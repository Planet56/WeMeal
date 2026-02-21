//
//  AppState.swift
//  WeMeal
//

import SwiftUI
import CoreLocation

class AppState: ObservableObject {
    @Published var userProfile: UserProfile?
    @Published var currentWeather: Weather?
    @Published var selectedTab: Tab = .home
    @Published var isDiabeticMode: Bool = false
    @Published var isVegetarianMode: Bool = false
    @Published var isVeganMode: Bool = false
    @Published var hasCompletedOnboarding: Bool = false
    
    enum Tab: String, CaseIterable {
        case home = "Accueil"
        case surprise = "Surprise"
        case profile = "Moi"
    }
    
    init() {
        loadUserProfile()
    }
    
    func loadUserProfile() {
        if let data = UserDefaults.standard.data(forKey: "userProfile"),
           let profile = try? JSONDecoder().decode(UserProfile.self, from: data) {
            self.userProfile = profile
            self.isDiabeticMode = profile.isDiabetic
            self.isVegetarianMode = profile.isVegetarian
            self.isVeganMode = profile.isVegan
            self.hasCompletedOnboarding = true
        }
    }
    
    func saveUserProfile(_ profile: UserProfile) {
        self.userProfile = profile
        self.isDiabeticMode = profile.isDiabetic
        self.isVegetarianMode = profile.isVegetarian
        self.isVeganMode = profile.isVegan
        self.hasCompletedOnboarding = true
        
        if let data = try? JSONEncoder().encode(profile) {
            UserDefaults.standard.set(data, forKey: "userProfile")
        }
    }
}
