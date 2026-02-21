//
//  RecipeCard.swift
//  WeMeal
//

import SwiftUI

struct RecipeCard: View {
    let recipe: Recipe
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Emoji
            Text(recipe.emoji)
                .font(.system(size: 50))
                .frame(maxWidth: .infinity, alignment: .center)
            
            // Name
            Text(recipe.name)
                .font(.headline)
                .foregroundColor(Theme.text)
                .lineLimit(2)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
            
            // Info row
            HStack {
                Label(recipe.time, systemImage: "clock")
                    .font(.caption)
                    .foregroundColor(Theme.textMuted)
                
                Spacer()
                
                Text("\(recipe.calories) kcal")
                    .font(.caption)
                    .foregroundColor(Theme.textMuted)
            }
            
            // Badges
            HStack(spacing: 4) {
                if recipe.isVegan {
                    BadgeView(text: "🌱", color: Theme.success)
                } else if recipe.isVegetarian {
                    BadgeView(text: "🥬", color: Theme.secondary)
                }
                
                if recipe.diabeticFriendly {
                    BadgeView(text: "🩺", color: Theme.primary)
                }
                
                Spacer()
            }
        }
        .padding()
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.white.opacity(0.1), lineWidth: 1)
        )
    }
}

struct BadgeView: View {
    let text: String
    let color: Color
    
    var body: some View {
        Text(text)
            .font(.caption)
            .padding(4)
            .background(color.opacity(0.2))
            .clipShape(Circle())
    }
}

#Preview {
    RecipeCard(recipe: Recipe(
        name: "Salade César",
        emoji: "🥗",
        time: "20 min",
        calories: 350,
        isVegetarian: true
    ))
    .padding()
    .background(Theme.background)
}
