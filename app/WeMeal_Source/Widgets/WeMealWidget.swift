//
//  WeMealWidget.swift
//  WeMealWidgetExtension
//

import WidgetKit
import SwiftUI

// MARK: - Timeline Entry

struct RecipeEntry: TimelineEntry {
    let date: Date
    let recipe: WidgetRecipe
}

struct WidgetRecipe {
    let name: String
    let emoji: String
    let time: String
    let calories: Int
    
    static let placeholder = WidgetRecipe(
        name: "Salade fraîcheur",
        emoji: "🥗",
        time: "15 min",
        calories: 250
    )
    
    static let samples = [
        WidgetRecipe(name: "Pasta Carbonara", emoji: "🍝", time: "25 min", calories: 450),
        WidgetRecipe(name: "Salade César", emoji: "🥗", time: "15 min", calories: 320),
        WidgetRecipe(name: "Poulet rôti", emoji: "🍗", time: "45 min", calories: 380),
        WidgetRecipe(name: "Soupe miso", emoji: "🍜", time: "20 min", calories: 180),
        WidgetRecipe(name: "Tacos", emoji: "🌮", time: "30 min", calories: 420),
        WidgetRecipe(name: "Pizza maison", emoji: "🍕", time: "35 min", calories: 550)
    ]
}

// MARK: - Provider

struct RecipeProvider: TimelineProvider {
    func placeholder(in context: Context) -> RecipeEntry {
        RecipeEntry(date: Date(), recipe: .placeholder)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (RecipeEntry) -> Void) {
        let entry = RecipeEntry(date: Date(), recipe: WidgetRecipe.samples.randomElement() ?? .placeholder)
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<RecipeEntry>) -> Void) {
        var entries: [RecipeEntry] = []
        let currentDate = Date()
        
        // Generate new recipe every hour
        for hourOffset in 0..<24 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let recipe = WidgetRecipe.samples.randomElement() ?? .placeholder
            let entry = RecipeEntry(date: entryDate, recipe: recipe)
            entries.append(entry)
        }
        
        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

// MARK: - Small Widget View

struct SmallWidgetView: View {
    let entry: RecipeEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(entry.recipe.emoji)
                    .font(.system(size: 36))
                Spacer()
            }
            
            Spacer()
            
            Text(entry.recipe.name)
                .font(.headline)
                .foregroundColor(.white)
                .lineLimit(2)
            
            HStack {
                Image(systemName: "clock")
                    .font(.caption2)
                Text(entry.recipe.time)
                    .font(.caption2)
            }
            .foregroundColor(.white.opacity(0.7))
        }
        .padding()
        .background(
            LinearGradient(
                colors: [Color(hex: "0891b2"), Color(hex: "8b5cf6")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}

// MARK: - Medium Widget View

struct MediumWidgetView: View {
    let entry: RecipeEntry
    
    var body: some View {
        HStack(spacing: 16) {
            Text(entry.recipe.emoji)
                .font(.system(size: 60))
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Recette du moment")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
                
                Text(entry.recipe.name)
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                HStack(spacing: 16) {
                    Label(entry.recipe.time, systemImage: "clock")
                    Label("\(entry.recipe.calories) kcal", systemImage: "flame")
                }
                .font(.caption)
                .foregroundColor(.white.opacity(0.8))
            }
            
            Spacer()
        }
        .padding()
        .background(
            LinearGradient(
                colors: [Color(hex: "0891b2"), Color(hex: "8b5cf6")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}

// MARK: - Widget Configuration

struct WeMealWidget: Widget {
    let kind: String = "WeMealWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: RecipeProvider()) { entry in
            WeMealWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Recette du jour")
        .description("Découvrez une nouvelle recette à chaque heure")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct WeMealWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: RecipeEntry
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Color Extension for Widget

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b: UInt64
        switch hex.count {
        case 6:
            (r, g, b) = (int >> 16, int >> 8 & 0xFF, int & 0xFF)
        default:
            (r, g, b) = (0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: 1
        )
    }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
    WeMealWidget()
} timeline: {
    RecipeEntry(date: .now, recipe: WidgetRecipe.samples[0])
    RecipeEntry(date: .now, recipe: WidgetRecipe.samples[1])
}

#Preview(as: .systemMedium) {
    WeMealWidget()
} timeline: {
    RecipeEntry(date: .now, recipe: WidgetRecipe.samples[0])
}
