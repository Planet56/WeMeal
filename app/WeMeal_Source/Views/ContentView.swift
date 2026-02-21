//
//  ContentView.swift
//  WeMeal
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var firebaseService = FirebaseService.shared
    @StateObject private var weatherService = WeatherService.shared
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color(hex: "0f172a"), Color(hex: "1e293b"), Color(hex: "0f172a")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            if appState.hasCompletedOnboarding {
                MainTabView()
            } else {
                OnboardingView()
            }
        }
        .task {
            await firebaseService.loadRecipes()
            weatherService.requestLocation()
        }
    }
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Theme Colors

struct Theme {
    static let primary = Color(hex: "0891b2")
    static let secondary = Color(hex: "8b5cf6")
    static let danger = Color(hex: "ef4444")
    static let success = Color(hex: "22c55e")
    static let warning = Color(hex: "f59e0b")
    static let background = Color(hex: "0f172a")
    static let cardBackground = Color.white.opacity(0.08)
    static let text = Color(hex: "f8fafc")
    static let textMuted = Color(hex: "94a3b8")
}

#Preview {
    ContentView()
        .environmentObject(AppState())
}
