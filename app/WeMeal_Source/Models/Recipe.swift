//
//  Recipe.swift
//  WeMeal
//

import Foundation

struct Recipe: Identifiable, Codable {
    var id: String
    var name: String
    var emoji: String
    var category: String
    var cuisine: String?
    var time: String
    var calories: Int
    var sugar: Int
    var servings: Int
    var glycemicIndex: String
    var diabeticFriendly: Bool
    var isVegetarian: Bool
    var isVegan: Bool
    var isVisible: Bool
    var weather: [String]
    var season: [String]
    var keywords: [String]
    var ingredients: [Ingredient]
    var steps: [String]
    
    init(id: String = UUID().uuidString,
         name: String,
         emoji: String = "🍽️",
         category: String = "",
         cuisine: String? = nil,
         time: String = "",
         calories: Int = 0,
         sugar: Int = 0,
         servings: Int = 4,
         glycemicIndex: String = "medium",
         diabeticFriendly: Bool = false,
         isVegetarian: Bool = false,
         isVegan: Bool = false,
         isVisible: Bool = true,
         weather: [String] = [],
         season: [String] = [],
         keywords: [String] = [],
         ingredients: [Ingredient] = [],
         steps: [String] = []) {
        self.id = id
        self.name = name
        self.emoji = emoji
        self.category = category
        self.cuisine = cuisine
        self.time = time
        self.calories = calories
        self.sugar = sugar
        self.servings = servings
        self.glycemicIndex = glycemicIndex
        self.diabeticFriendly = diabeticFriendly
        self.isVegetarian = isVegetarian
        self.isVegan = isVegan
        self.isVisible = isVisible
        self.weather = weather
        self.season = season
        self.keywords = keywords
        self.ingredients = ingredients
        self.steps = steps
    }
}

struct Ingredient: Codable, Identifiable {
    var id: String { name }
    var name: String
    var qty: String
    
    init(name: String, qty: String = "") {
        self.name = name
        self.qty = qty
    }
}
