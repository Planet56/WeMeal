//
//  OnboardingView.swift
//  WeMeal
//

import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var appState: AppState
    @State private var name: String = ""
    @State private var selectedEmoji: String = "👤"
    @State private var isDiabetic: Bool = false
    @State private var isVegetarian: Bool = false
    @State private var isVegan: Bool = false
    
    let emojis = ["👤", "👨", "👩", "🧑", "👦", "👧", "🧔", "👨‍🍳", "👩‍🍳", "🦸", "🧑‍🎄", "🎅"]
    
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            
            // Logo
            Text("🍽️")
                .font(.system(size: 80))
            
            Text("Bienvenue sur WeMeal")
                .font(.title)
                .fontWeight(.bold)
                .foregroundStyle(
                    LinearGradient(colors: [Theme.primary, Theme.secondary],
                                   startPoint: .leading, endPoint: .trailing)
                )
            
            Text("Créons votre profil gourmand")
                .foregroundColor(Theme.textMuted)
            
            // Avatar selection
            VStack(alignment: .leading, spacing: 12) {
                Text("Choisissez votre avatar")
                    .font(.subheadline)
                    .foregroundColor(Theme.textMuted)
                
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 6), spacing: 12) {
                    ForEach(emojis, id: \.self) { emoji in
                        Button {
                            HapticManager.shared.selection()
                            selectedEmoji = emoji
                        } label: {
                            Text(emoji)
                                .font(.system(size: 32))
                                .frame(width: 50, height: 50)
                                .background(
                                    selectedEmoji == emoji ?
                                    LinearGradient(colors: [Theme.primary, Theme.secondary],
                                                   startPoint: .topLeading, endPoint: .bottomTrailing) :
                                    LinearGradient(colors: [Theme.cardBackground, Theme.cardBackground],
                                                   startPoint: .topLeading, endPoint: .bottomTrailing)
                                )
                                .clipShape(Circle())
                        }
                    }
                }
            }
            .padding()
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            
            // Name input
            VStack(alignment: .leading, spacing: 8) {
                Text("Votre prénom")
                    .font(.subheadline)
                    .foregroundColor(Theme.textMuted)
                
                TextField("Entrez votre prénom", text: $name)
                    .textFieldStyle(.plain)
                    .padding()
                    .background(Color.black.opacity(0.3))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .foregroundColor(.white)
            }
            .padding()
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            
            // Diet preferences
            VStack(alignment: .leading, spacing: 12) {
                Text("Préférences alimentaires")
                    .font(.subheadline)
                    .foregroundColor(Theme.textMuted)
                
                HStack(spacing: 12) {
                    DietToggle(emoji: "🩺", title: "Diabétique", isOn: $isDiabetic)
                    DietToggle(emoji: "🥬", title: "Végétarien", isOn: $isVegetarian)
                    DietToggle(emoji: "🌱", title: "Vegan", isOn: $isVegan)
                }
            }
            .padding()
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            
            Spacer()
            
            // Continue button
            Button {
                HapticManager.shared.success()
                let profile = UserProfile(
                    name: name.isEmpty ? "Gourmand" : name,
                    avatarEmoji: selectedEmoji,
                    isDiabetic: isDiabetic,
                    isVegetarian: isVegetarian,
                    isVegan: isVegan
                )
                appState.saveUserProfile(profile)
            } label: {
                Text("C'est parti ! 🚀")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(
                        LinearGradient(colors: [Theme.primary, Theme.secondary],
                                       startPoint: .leading, endPoint: .trailing)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 16))
            }
        }
        .padding()
    }
}

struct DietToggle: View {
    let emoji: String
    let title: String
    @Binding var isOn: Bool
    
    var body: some View {
        Button {
            HapticManager.shared.lightTap()
            isOn.toggle()
        } label: {
            VStack(spacing: 6) {
                Text(emoji)
                    .font(.title2)
                Text(title)
                    .font(.caption2)
                    .foregroundColor(isOn ? .white : Theme.textMuted)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                isOn ?
                LinearGradient(colors: [Theme.primary, Theme.secondary],
                               startPoint: .topLeading, endPoint: .bottomTrailing) :
                LinearGradient(colors: [Theme.cardBackground, Theme.cardBackground],
                               startPoint: .topLeading, endPoint: .bottomTrailing)
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}

#Preview {
    OnboardingView()
        .environmentObject(AppState())
}
