//
//  UserProfile.swift
//  WeMeal
//

import Foundation

struct UserProfile: Codable {
    var name: String
    var avatarEmoji: String
    var isDiabetic: Bool
    var isVegetarian: Bool
    var isVegan: Bool
    
    init(name: String = "", 
         avatarEmoji: String = "👤",
         isDiabetic: Bool = false,
         isVegetarian: Bool = false,
         isVegan: Bool = false) {
        self.name = name
        self.avatarEmoji = avatarEmoji
        self.isDiabetic = isDiabetic
        self.isVegetarian = isVegetarian
        self.isVegan = isVegan
    }
}
