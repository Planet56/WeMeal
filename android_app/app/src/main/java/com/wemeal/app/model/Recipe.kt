package com.wemeal.app.model

import java.util.UUID

data class Recipe(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val emoji: String,
    val category: String,
    val time: String,
    val calories: Int,
    val sugar: Int,
    val servings: Int,
    val glycemicIndex: String, // "low", "medium", "high"
    val glycemicLoad: Int? = null,
    val price: String? = null,
    
    // Flags
    val isDiabeticFriendly: Boolean = false,
    val isVegetarian: Boolean = false,
    val isVegan: Boolean = false,
    val isGlutenFree: Boolean? = null,
    val isVisible: Boolean = true,
    
    // Context
    val weather: List<String> = emptyList(),
    val season: List<String> = emptyList(),
    val keywords: List<String> = emptyList(),
    val origin: String? = null,
    
    // Content
    val ingredients: List<Ingredient> = emptyList(),
    val steps: List<RecipeStep> = emptyList()
) {
    val igColor: String
        get() = when (glycemicIndex.lowercase()) {
            "low", "bas" -> "green"
            "medium", "moyen" -> "orange"
            "high", "élevé" -> "red"
            else -> "gray"
        }
}

data class Ingredient(
    val name: String,
    val qty: String = "",
    val unit: String? = null,
    val category: String? = null,
    var isChecked: Boolean = false
) {
    val id: String get() = name
}

data class RecipeStep(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val timer: Int? = null // Minutes
)
