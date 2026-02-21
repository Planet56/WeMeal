//
//  WeMealApp.swift
//  WeMeal
//
//  Created with ❤️ for iOS
//

import SwiftUI
import FirebaseCore

@main
struct WeMealApp: App {
    @StateObject private var appState = AppState()
    
    init() {
        FirebaseApp.configure()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .preferredColorScheme(.dark)
        }
    }
}
