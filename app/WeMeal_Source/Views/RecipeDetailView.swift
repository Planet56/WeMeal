//
//  RecipeDetailView.swift
//  WeMeal
//

import SwiftUI

struct RecipeDetailView: View {
    let recipe: Recipe
    @State private var currentStep = 0
    @State private var showingCookingMode = false
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 16) {
                    Text(recipe.emoji)
                        .font(.system(size: 100))
                    
                    Text(recipe.name)
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(Theme.text)
                        .multilineTextAlignment(.center)
                    
                    // Info badges
                    HStack(spacing: 16) {
                        InfoBadge(icon: "clock", text: recipe.time)
                        InfoBadge(icon: "flame", text: "\(recipe.calories) kcal")
                        InfoBadge(icon: "person.2", text: "\(recipe.servings) pers.")
                    }
                    
                    // Diet badges
                    HStack(spacing: 8) {
                        if recipe.isVegan {
                            DietPill(emoji: "🌱", text: "Vegan", color: Theme.success)
                        } else if recipe.isVegetarian {
                            DietPill(emoji: "🥬", text: "Végétarien", color: Theme.secondary)
                        }
                        if recipe.diabeticFriendly {
                            DietPill(emoji: "🩺", text: "Diabétique", color: Theme.primary)
                        }
                    }
                }
                .padding()
                
                // Ingredients
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(title: "Ingrédients", emoji: "🧺")
                    
                    VStack(spacing: 12) {
                        ForEach(recipe.ingredients) { ingredient in
                            HStack {
                                Text("•")
                                    .foregroundColor(Theme.primary)
                                Text(ingredient.name)
                                    .foregroundColor(Theme.text)
                                Spacer()
                                Text(ingredient.qty)
                                    .foregroundColor(Theme.textMuted)
                            }
                        }
                    }
                    .padding()
                    .background(Theme.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .padding(.horizontal)
                
                // Steps preview
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(title: "Préparation", emoji: "👨‍🍳")
                    
                    VStack(spacing: 12) {
                        ForEach(Array(recipe.steps.enumerated()), id: \.offset) { index, step in
                            HStack(alignment: .top, spacing: 12) {
                                Text("\(index + 1)")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .frame(width: 24, height: 24)
                                    .background(Theme.primary)
                                    .clipShape(Circle())
                                
                                Text(step)
                                    .foregroundColor(Theme.text)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }
                    .padding()
                    .background(Theme.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .padding(.horizontal)
                
                // Start cooking button
                Button {
                    HapticManager.shared.mediumTap()
                    showingCookingMode = true
                } label: {
                    HStack {
                        Text("👨‍🍳")
                        Text("Commencer la recette")
                            .fontWeight(.semibold)
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(
                        LinearGradient(colors: [Theme.primary, Theme.secondary],
                                       startPoint: .leading, endPoint: .trailing)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .padding(.horizontal)
                .padding(.bottom, 30)
            }
        }
        .background(Theme.background)
        .navigationBarTitleDisplayMode(.inline)
        .fullScreenCover(isPresented: $showingCookingMode) {
            CookingModeView(recipe: recipe)
        }
    }
}

struct InfoBadge: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption)
            Text(text)
                .font(.caption)
        }
        .foregroundColor(Theme.textMuted)
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Theme.cardBackground)
        .clipShape(Capsule())
    }
}

struct DietPill: View {
    let emoji: String
    let text: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 4) {
            Text(emoji)
            Text(text)
                .font(.caption)
                .fontWeight(.medium)
        }
        .foregroundColor(color)
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(color.opacity(0.15))
        .clipShape(Capsule())
    }
}

struct SectionHeader: View {
    let title: String
    let emoji: String
    
    var body: some View {
        HStack {
            Text(emoji)
            Text(title)
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(Theme.text)
        }
    }
}

#Preview {
    NavigationStack {
        RecipeDetailView(recipe: Recipe(
            name: "Salade César",
            emoji: "🥗",
            time: "20 min",
            calories: 350,
            servings: 4,
            isVegetarian: true,
            ingredients: [
                Ingredient(name: "Laitue romaine", qty: "1 grande"),
                Ingredient(name: "Parmesan", qty: "50g"),
                Ingredient(name: "Croûtons", qty: "100g")
            ],
            steps: [
                "Lavez et essorez la salade",
                "Préparez la sauce César",
                "Mélangez le tout et servez"
            ]
        ))
    }
}
