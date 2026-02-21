//
//  SurpriseView.swift
//  WeMeal
//

import SwiftUI

struct SurpriseView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var firebaseService = FirebaseService.shared
    
    @State private var searchText = ""
    @State private var results: [Recipe] = []
    @State private var isSearching = false
    @State private var showChefAnimation = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.background
                    .ignoresSafeArea()
                
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Text("✨")
                            .font(.system(size: 60))
                        
                        Text("Surprends-moi !")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundStyle(
                                LinearGradient(colors: [Theme.primary, Theme.secondary],
                                               startPoint: .leading, endPoint: .trailing)
                            )
                        
                        Text("Dis-moi ce que tu as envie, et je te trouve la recette parfaite")
                            .font(.subheadline)
                            .foregroundColor(Theme.textMuted)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 20)
                    
                    // Search input
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(Theme.textMuted)
                        
                        TextField("pasta, poulet, asiatique...", text: $searchText)
                            .foregroundColor(Theme.text)
                            .submitLabel(.search)
                            .onSubmit {
                                performSearch()
                            }
                        
                        if !searchText.isEmpty {
                            Button {
                                HapticManager.shared.lightTap()
                                searchText = ""
                                results = []
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(Theme.textMuted)
                            }
                        }
                    }
                    .padding()
                    .background(Theme.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .padding(.horizontal)
                    
                    // Tags
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            QuickTag(text: "🇮🇹 Italien", action: { searchFor("italien") })
                            QuickTag(text: "🇯🇵 Japonais", action: { searchFor("japonais") })
                            QuickTag(text: "🥗 Léger", action: { searchFor("léger") })
                            QuickTag(text: "🍝 Pasta", action: { searchFor("pasta") })
                            QuickTag(text: "🍗 Poulet", action: { searchFor("poulet") })
                            QuickTag(text: "❄️ Hiver", action: { searchFor("hiver") })
                        }
                        .padding(.horizontal)
                    }
                    
                    // Search button
                    Button {
                        performSearch()
                    } label: {
                        HStack {
                            Text("🔮")
                            Text("Trouver ma recette")
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
                    .disabled(searchText.isEmpty)
                    .opacity(searchText.isEmpty ? 0.6 : 1)
                    
                    // Results
                    if isSearching {
                        Spacer()
                        ProgressView()
                            .tint(Theme.primary)
                            .scaleEffect(1.5)
                        Spacer()
                    } else if !results.isEmpty {
                        ScrollView {
                            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                                ForEach(results) { recipe in
                                    NavigationLink(destination: RecipeDetailView(recipe: recipe)) {
                                        RecipeCard(recipe: recipe)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding(.horizontal)
                        }
                    } else {
                        Spacer()
                        
                        VStack(spacing: 16) {
                            Text("👨‍🍳")
                                .font(.system(size: 60))
                            Text("Entre des mots-clés pour découvrir des recettes")
                                .foregroundColor(Theme.textMuted)
                                .multilineTextAlignment(.center)
                        }
                        
                        Spacer()
                    }
                }
            }
            .navigationBarHidden(true)
        }
    }
    
    private func searchFor(_ term: String) {
        searchText = term
        performSearch()
    }
    
    private func performSearch() {
        guard !searchText.isEmpty else { return }
        
        HapticManager.shared.mediumTap()
        isSearching = true
        
        let keywords = searchText
            .lowercased()
            .components(separatedBy: CharacterSet(charactersIn: " ,"))
            .filter { !$0.isEmpty }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            results = firebaseService.searchRecipes(
                keywords: keywords,
                isDiabetic: appState.isDiabeticMode,
                isVegetarian: appState.isVegetarianMode,
                isVegan: appState.isVeganMode
            )
            isSearching = false
            
            if results.isEmpty {
                HapticManager.shared.warning()
            } else {
                HapticManager.shared.success()
            }
        }
    }
}

struct QuickTag: View {
    let text: String
    let action: () -> Void
    
    var body: some View {
        Button(action: {
            HapticManager.shared.lightTap()
            action()
        }) {
            Text(text)
                .font(.subheadline)
                .foregroundColor(Theme.text)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(Theme.cardBackground)
                .clipShape(Capsule())
                .overlay(
                    Capsule()
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                )
        }
    }
}

#Preview {
    SurpriseView()
        .environmentObject(AppState())
}
