//
//  Weather.swift
//  WeMeal
//

import Foundation

struct Weather: Codable {
    var temperature: Double
    var condition: WeatherCondition
    var city: String
    var description: String
    
    var emoji: String {
        condition.emoji
    }
    
    var formattedTemperature: String {
        "\(Int(temperature))°C"
    }
}

enum WeatherCondition: String, Codable {
    case sunny
    case cloudy
    case rainy
    case snowy
    case hot
    case cold
    case stormy
    
    var emoji: String {
        switch self {
        case .sunny: return "☀️"
        case .cloudy: return "⛅"
        case .rainy: return "🌧️"
        case .snowy: return "❄️"
        case .hot: return "🔥"
        case .cold: return "🥶"
        case .stormy: return "⛈️"
        }
    }
    
    var tags: [String] {
        switch self {
        case .sunny: return ["sunny", "hot"]
        case .cloudy: return ["cloudy"]
        case .rainy: return ["rainy", "cold"]
        case .snowy: return ["snowy", "cold"]
        case .hot: return ["hot", "sunny"]
        case .cold: return ["cold"]
        case .stormy: return ["rainy", "cold"]
        }
    }
}
