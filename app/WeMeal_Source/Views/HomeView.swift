//
//  HomeView.swift
//  WeMeal
//

import SwiftUI

struct HomeView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var firebaseService = FirebaseService.shared
    @StateObject private var weatherService = WeatherService.shared
    
    var recommendedRecipes: [Recipe] {
        firebaseService.getRecommendedRecipes(
            for: weatherService.currentWeather,
            isDiabetic: appState.isDiabeticMode,
            isVegetarian: appState.isVegetarianMode,
            isVegan: appState.isVeganMode
        )
    }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header with weather
                    HeaderView()
                    
                    // Diet mode indicators
                    if appState.isDiabeticMode || appState.isVegetarianMode || appState.isVeganMode {
                        DietIndicators()
                    }
                    
                    // Recipe recommendations
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Recommandations du jour")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(Theme.text)
                        
                        if firebaseService.isLoading {
                            ProgressView()
                                .tint(Theme.primary)
                                .frame(maxWidth: .infinity, minHeight: 200)
                        } else {
                            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                                ForEach(recommendedRecipes) { recipe in
                                    NavigationLink(destination: RecipeDetailView(recipe: recipe)) {
                                        RecipeCard(recipe: recipe)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .background(Theme.background)
        }
    }
}

struct HeaderView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var weatherService = WeatherService.shared
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Bonjour \(appState.userProfile?.name ?? "Gourmand") ! 👋")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(Theme.text)
                
                if let weather = weatherService.currentWeather {
                    HStack(spacing: 8) {
                        Text(weather.emoji)
                        Text("\(weather.formattedTemperature) • \(weather.city)")
                            .foregroundColor(Theme.textMuted)
                    }
                    .font(.subheadline)
                }
            }
            
            Spacer()
            
            Text(appState.userProfile?.avatarEmoji ?? "👤")
                .font(.system(size: 44))
        }
        .padding()
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .padding(.horizontal)
    }
}

struct DietIndicators: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        HStack(spacing: 12) {
            if appState.isDiabeticMode {
                DietBadge(emoji: "🩺", text: "Diabétique")
            }
            if appState.isVeganMode {
                DietBadge(emoji: "🌱", text: "Vegan")
            } else if appState.isVegetarianMode {
                DietBadge(emoji: "🥬", text: "Végétarien")
            }
        }
        .padding(.horizontal)
    }
}

struct DietBadge: View {
    let emoji: String
    let text: String
    
    var body: some View {
        HStack(spacing: 6) {
            Text(emoji)
            Text(text)
                .font(.caption)
                .fontWeight(.semibold)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Theme.primary.opacity(0.2))
        .foregroundColor(Theme.primary)
        .clipShape(Capsule())
    }
}

#Preview {
    HomeView()
        .environmentObject(AppState())
}
