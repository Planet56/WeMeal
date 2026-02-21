//
//  FirebaseService.swift
//  WeMeal
//

import Foundation
import FirebaseFirestore

class FirebaseService: ObservableObject {
    static let shared = FirebaseService()
    
    private let db = Firestore.firestore()
    
    @Published var recipes: [Recipe] = []
    @Published var isLoading = false
    @Published var error: String?
    
    private init() {}
    
    // MARK: - Load Recipes
    
    func loadRecipes() async {
        await MainActor.run { isLoading = true }
        
        do {
            let snapshot = try await db.collection("recipes").getDocuments()
            
            let loadedRecipes: [Recipe] = snapshot.documents.compactMap { doc in
                let data = doc.data()
                
                // Skip hidden recipes
                if let isVisible = data["isVisible"] as? Bool, !isVisible {
                    return nil
                }
                
                return Recipe(
                    id: doc.documentID,
                    name: data["name"] as? String ?? "",
                    emoji: data["emoji"] as? String ?? "🍽️",
                    category: data["category"] as? String ?? "",
                    cuisine: data["cuisine"] as? String,
                    time: data["time"] as? String ?? "",
                    calories: data["calories"] as? Int ?? 0,
                    sugar: data["sugar"] as? Int ?? 0,
                    servings: data["servings"] as? Int ?? 4,
                    glycemicIndex: data["glycemicIndex"] as? String ?? "medium",
                    diabeticFriendly: data["diabeticFriendly"] as? Bool ?? false,
                    isVegetarian: data["isVegetarian"] as? Bool ?? false,
                    isVegan: data["isVegan"] as? Bool ?? false,
                    isVisible: data["isVisible"] as? Bool ?? true,
                    weather: data["weather"] as? [String] ?? [],
                    season: data["season"] as? [String] ?? [],
                    keywords: data["keywords"] as? [String] ?? [],
                    ingredients: parseIngredients(data["ingredients"]),
                    steps: data["steps"] as? [String] ?? []
                )
            }
            
            await MainActor.run {
                self.recipes = loadedRecipes
                self.isLoading = false
            }
            
        } catch {
            await MainActor.run {
                self.error = error.localizedDescription
                self.isLoading = false
            }
        }
    }
    
    private func parseIngredients(_ data: Any?) -> [Ingredient] {
        guard let array = data as? [[String: Any]] else { return [] }
        return array.compactMap { dict in
            guard let name = dict["name"] as? String else { return nil }
            return Ingredient(name: name, qty: dict["qty"] as? String ?? "")
        }
    }
    
    // MARK: - Filter Recipes
    
    func getRecommendedRecipes(for weather: Weather?, isDiabetic: Bool = false, isVegetarian: Bool = false, isVegan: Bool = false) -> [Recipe] {
        var filtered = recipes
        
        // Filter by dietary preferences
        if isDiabetic {
            filtered = filtered.filter { $0.diabeticFriendly }
        }
        if isVegan {
            filtered = filtered.filter { $0.isVegan }
        } else if isVegetarian {
            filtered = filtered.filter { $0.isVegetarian }
        }
        
        // Sort by weather match
        if let weather = weather {
            filtered.sort { recipe1, recipe2 in
                let score1 = weatherMatchScore(recipe: recipe1, weather: weather)
                let score2 = weatherMatchScore(recipe: recipe2, weather: weather)
                return score1 > score2
            }
        }
        
        return Array(filtered.prefix(6))
    }
    
    private func weatherMatchScore(recipe: Recipe, weather: Weather) -> Int {
        var score = 0
        for tag in weather.condition.tags {
            if recipe.weather.contains(tag) {
                score += 2
            }
        }
        return score
    }
    
    // MARK: - Search Recipes
    
    func searchRecipes(keywords: [String], isDiabetic: Bool = false, isVegetarian: Bool = false, isVegan: Bool = false) -> [Recipe] {
        var filtered = recipes
        
        // Filter by dietary preferences
        if isDiabetic {
            filtered = filtered.filter { $0.diabeticFriendly }
        }
        if isVegan {
            filtered = filtered.filter { $0.isVegan }
        } else if isVegetarian {
            filtered = filtered.filter { $0.isVegetarian }
        }
        
        // Score by keywords
        let scored = filtered.map { recipe -> (Recipe, Int) in
            var score = 0
            for keyword in keywords {
                let lower = keyword.lowercased()
                
                // Name match
                if recipe.name.lowercased().contains(lower) {
                    score += 5
                }
                // Category match
                if recipe.category.lowercased().contains(lower) {
                    score += 3
                }
                // Keywords match
                if recipe.keywords.contains(where: { $0.lowercased().contains(lower) }) {
                    score += 4
                }
                // Ingredient match
                if recipe.ingredients.contains(where: { $0.name.lowercased().contains(lower) }) {
                    score += 3
                }
            }
            return (recipe, score)
        }
        
        return scored
            .filter { $0.1 > 0 }
            .sorted { $0.1 > $1.1 }
            .prefix(6)
            .map { $0.0 }
    }
}
