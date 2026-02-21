//
//  CookingModeView.swift
//  WeMeal
//

import SwiftUI

struct CookingModeView: View {
    let recipe: Recipe
    @State private var currentStep = 0
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        ZStack {
            Theme.background
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Button {
                        HapticManager.shared.lightTap()
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.title2)
                            .foregroundColor(Theme.textMuted)
                    }
                    
                    Spacer()
                    
                    Text("\(currentStep + 1) / \(recipe.steps.count)")
                        .font(.headline)
                        .foregroundColor(Theme.textMuted)
                    
                    Spacer()
                    
                    Text(recipe.emoji)
                        .font(.title2)
                }
                .padding()
                
                // Progress bar
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(Theme.cardBackground)
                            .frame(height: 4)
                        
                        Rectangle()
                            .fill(
                                LinearGradient(colors: [Theme.primary, Theme.secondary],
                                               startPoint: .leading, endPoint: .trailing)
                            )
                            .frame(width: geometry.size.width * CGFloat(currentStep + 1) / CGFloat(recipe.steps.count), height: 4)
                            .animation(.spring(), value: currentStep)
                    }
                }
                .frame(height: 4)
                
                Spacer()
                
                // Current step
                VStack(spacing: 30) {
                    Text("Étape \(currentStep + 1)")
                        .font(.headline)
                        .foregroundColor(Theme.primary)
                    
                    Text(recipe.steps[currentStep])
                        .font(.title2)
                        .fontWeight(.medium)
                        .foregroundColor(Theme.text)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 50)
                
                Spacer()
                
                // Navigation buttons
                HStack(spacing: 20) {
                    // Previous
                    Button {
                        HapticManager.shared.lightTap()
                        if currentStep > 0 {
                            currentStep -= 1
                        }
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.title2)
                            .foregroundColor(currentStep > 0 ? Theme.text : Theme.textMuted)
                            .frame(width: 60, height: 60)
                            .background(Theme.cardBackground)
                            .clipShape(Circle())
                    }
                    .disabled(currentStep == 0)
                    
                    // Next / Done
                    Button {
                        HapticManager.shared.mediumTap()
                        if currentStep < recipe.steps.count - 1 {
                            currentStep += 1
                        } else {
                            HapticManager.shared.success()
                            dismiss()
                        }
                    } label: {
                        HStack {
                            if currentStep < recipe.steps.count - 1 {
                                Text("Suivant")
                                Image(systemName: "chevron.right")
                            } else {
                                Text("Terminé !")
                                Text("✅")
                            }
                        }
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
                .padding(.bottom, 20)
            }
        }
        .gesture(
            DragGesture()
                .onEnded { value in
                    if value.translation.width < -50 && currentStep < recipe.steps.count - 1 {
                        HapticManager.shared.lightTap()
                        currentStep += 1
                    } else if value.translation.width > 50 && currentStep > 0 {
                        HapticManager.shared.lightTap()
                        currentStep -= 1
                    }
                }
        )
    }
}

#Preview {
    CookingModeView(recipe: Recipe(
        name: "Salade César",
        emoji: "🥗",
        steps: [
            "Lavez et essorez la salade romaine",
            "Préparez la sauce César en mélangeant la mayonnaise, l'ail et le parmesan",
            "Ajoutez les croûtons",
            "Mélangez le tout et servez avec du parmesan râpé"
        ]
    ))
}
