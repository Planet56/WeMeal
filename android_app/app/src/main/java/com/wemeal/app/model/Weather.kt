package com.wemeal.app.model

data class Weather(
    val temperature: Int, // Celsius
    val condition: WeatherCondition,
    val city: String
) {
    val seasonName: String
        get() = "summer" // Simplified for now
}

data class WeatherCondition(
    val code: Int,
    val description: String,
    val icon: String,
    val tags: List<String> // e.g., ["cold", "rainy"]
)
