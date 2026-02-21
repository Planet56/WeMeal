//
//  ProfileView.swift
//  WeMeal
//

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var appState: AppState
    @State private var showingEditSheet = false
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile card
                    VStack(spacing: 16) {
                        Text(appState.userProfile?.avatarEmoji ?? "👤")
                            .font(.system(size: 80))
                        
                        Text(appState.userProfile?.name ?? "Gourmand")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(Theme.text)
                        
                        Button {
                            HapticManager.shared.lightTap()
                            showingEditSheet = true
                        } label: {
                            Label("Modifier le profil", systemImage: "pencil")
                                .font(.subheadline)
                                .foregroundColor(Theme.primary)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 30)
                    .background(Theme.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 24))
                    .padding(.horizontal)
                    
                    // Diet modes
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Modes alimentaires")
                            .font(.headline)
                            .foregroundColor(Theme.text)
                            .padding(.horizontal)
                        
                        VStack(spacing: 12) {
                            DietModeRow(
                                emoji: "🩺",
                                title: "Mode Diabétique",
                                subtitle: "Recettes à faible indice glycémique",
                                isOn: $appState.isDiabeticMode
                            )
                            
                            DietModeRow(
                                emoji: "🥬",
                                title: "Mode Végétarien",
                                subtitle: "Sans viande ni poisson",
                                isOn: $appState.isVegetarianMode
                            )
                            
                            DietModeRow(
                                emoji: "🌱",
                                title: "Mode Vegan",
                                subtitle: "100% végétal",
                                isOn: $appState.isVeganMode
                            )
                        }
                        .padding()
                        .background(Theme.cardBackground)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .padding(.horizontal)
                    }
                    
                    // Stats (placeholder)
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Statistiques")
                            .font(.headline)
                            .foregroundColor(Theme.text)
                            .padding(.horizontal)
                        
                        HStack(spacing: 16) {
                            StatCard(emoji: "📖", value: "0", label: "Recettes vues")
                            StatCard(emoji: "❤️", value: "0", label: "Favoris")
                        }
                        .padding(.horizontal)
                    }
                    
                    // App info
                    VStack(spacing: 12) {
                        Text("WeMeal")
                            .font(.headline)
                            .foregroundColor(Theme.textMuted)
                        Text("Version 1.0.0")
                            .font(.caption)
                            .foregroundColor(Theme.textMuted)
                        Text("Fait avec ❤️")
                            .font(.caption)
                            .foregroundColor(Theme.textMuted)
                    }
                    .padding(.top, 20)
                }
                .padding(.vertical)
            }
            .background(Theme.background)
            .navigationTitle("Mon Profil")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showingEditSheet) {
                EditProfileSheet()
            }
        }
    }
}

struct DietModeRow: View {
    let emoji: String
    let title: String
    let subtitle: String
    @Binding var isOn: Bool
    
    var body: some View {
        HStack {
            Text(emoji)
                .font(.title2)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(Theme.text)
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(Theme.textMuted)
            }
            
            Spacer()
            
            Toggle("", isOn: $isOn)
                .tint(Theme.primary)
                .onChange(of: isOn) { _, _ in
                    HapticManager.shared.lightTap()
                }
        }
    }
}

struct StatCard: View {
    let emoji: String
    let value: String
    let label: String
    
    var body: some View {
        VStack(spacing: 8) {
            Text(emoji)
                .font(.title)
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(Theme.text)
            Text(label)
                .font(.caption)
                .foregroundColor(Theme.textMuted)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

struct EditProfileSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    
    @State private var name: String = ""
    @State private var selectedEmoji: String = "👤"
    
    let emojis = ["👤", "👨", "👩", "🧑", "👦", "👧", "🧔", "👨‍🍳", "👩‍🍳", "🦸", "🧑‍🎄", "🎅"]
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Current avatar
                Text(selectedEmoji)
                    .font(.system(size: 80))
                    .padding(.top, 20)
                
                // Avatar selection
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
                                    Theme.primary : Theme.cardBackground
                                )
                                .clipShape(Circle())
                        }
                    }
                }
                .padding()
                
                // Name input
                VStack(alignment: .leading, spacing: 8) {
                    Text("Prénom")
                        .font(.subheadline)
                        .foregroundColor(Theme.textMuted)
                    
                    TextField("Entrez votre prénom", text: $name)
                        .textFieldStyle(.plain)
                        .padding()
                        .background(Theme.cardBackground)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .foregroundColor(.white)
                }
                .padding(.horizontal)
                
                Spacer()
                
                // Save button
                Button {
                    HapticManager.shared.success()
                    var profile = appState.userProfile ?? UserProfile()
                    profile.name = name.isEmpty ? "Gourmand" : name
                    profile.avatarEmoji = selectedEmoji
                    appState.saveUserProfile(profile)
                    dismiss()
                } label: {
                    Text("Enregistrer")
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Theme.primary)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .padding()
            }
            .background(Theme.background)
            .navigationTitle("Modifier le profil")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                name = appState.userProfile?.name ?? ""
                selectedEmoji = appState.userProfile?.avatarEmoji ?? "👤"
            }
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AppState())
}
