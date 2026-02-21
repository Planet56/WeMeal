//
//  MainTabView.swift
//  WeMeal
//

import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        TabView(selection: $appState.selectedTab) {
            HomeView()
                .tabItem {
                    Label("Accueil", systemImage: "house.fill")
                }
                .tag(AppState.Tab.home)
            
            SurpriseView()
                .tabItem {
                    Label("Surprise", systemImage: "sparkles")
                }
                .tag(AppState.Tab.surprise)
            
            ProfileView()
                .tabItem {
                    Label("Moi", systemImage: "person.fill")
                }
                .tag(AppState.Tab.profile)
        }
        .tint(Theme.primary)
        .onChange(of: appState.selectedTab) { _, _ in
            HapticManager.shared.selection()
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AppState())
}
