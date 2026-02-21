package com.wemeal.app.model

data class UserProfile(
    val name: String = "",
    val avatarEmoji: String = "👤",
    // Avatar image logic usually requires handling URIs or Files differently in Android,
    // ignoring for now or storing as URI string.
    val isDiabetic: Boolean = false,
    val isVegetarian: Boolean = false,
    val isVegan: Boolean = false,
    val isGlutenFree: Boolean = false,
    val themeSelection: String = "system", // "system", "light", "dark"
    
    // Daily Stats
    var dailyCalories: Int = 0,
    var dailySugar: Int = 0,
    var cookedRecipesToday: List<String> = emptyList(),
    
    // Lists (IDs or objects)
    var favorites: List<String> = emptyList(),
    var shoppingList: List<Ingredient> = emptyList()
)
