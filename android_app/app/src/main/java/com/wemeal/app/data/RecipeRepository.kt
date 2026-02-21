package com.wemeal.app.data

import com.wemeal.app.model.Ingredient
import com.wemeal.app.model.Recipe
import com.wemeal.app.model.RecipeStep
import kotlinx.coroutines.delay

class RecipeRepository {
    
    suspend fun getRecipes(): List<Recipe> {
        delay(500) // Simulate network
        return listOf(
            Recipe(
                id = "1",
                name = "Pasta Soleil",
                emoji = "🍝",
                category = "Plat principal",
                time = "15 min",
                calories = 450,
                sugar = 3,
                servings = 2,
                glycemicIndex = "low",
                ingredients = listOf(
                    Ingredient("Pâtes", "200g"),
                    Ingredient("Tomates Cerises", "150g"),
                    Ingredient("Basilic", "1 botte")
                ),
                steps = listOf(
                    RecipeStep(text = "Faire bouillir l'eau salée.", timer = 10),
                    RecipeStep(text = "Couper les tomates en deux."),
                    RecipeStep(text = "Mélanger et servir avec du basilic.")
                )
            ),
            Recipe(
                id = "2",
                name = "Salade Zen",
                emoji = "🥗",
                category = "Entrée",
                time = "10 min",
                calories = 200,
                sugar = 1,
                servings = 1,
                glycemicIndex = "low",
                isVegetarian = true,
                isVegan = true,
                isGlutenFree = true,
                ingredients = listOf(
                    Ingredient("Laitue", "1"),
                    Ingredient("Concombre", "1/2"),
                    Ingredient("Huile d'olive", "1 c.à.s")
                ),
                steps = listOf(
                    RecipeStep(text = "Laver la salade."),
                    RecipeStep(text = "Couper le concombre en rondelles."),
                    RecipeStep(text = "Assaisonner et déguster.")
                )
            )
        )
    }
}
