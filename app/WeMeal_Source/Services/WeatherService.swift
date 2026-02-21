//
//  WeatherService.swift
//  WeMeal
//

import Foundation
import CoreLocation

class WeatherService: NSObject, ObservableObject, CLLocationManagerDelegate {
    static let shared = WeatherService()
    
    private let locationManager = CLLocationManager()
    private let apiKey = "d2dbc6669c4d71b05c8fd2b4e58f8a06" // OpenWeatherMap API
    
    @Published var currentWeather: Weather?
    @Published var isLoading = false
    @Published var locationAuthorized = false
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyKilometer
    }
    
    func requestLocation() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        switch manager.authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            locationAuthorized = true
            locationManager.requestLocation()
        case .denied, .restricted:
            locationAuthorized = false
            // Use default weather
            currentWeather = Weather(
                temperature: 15,
                condition: .cloudy,
                city: "France",
                description: "Nuageux"
            )
        default:
            break
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.first else { return }
        fetchWeather(for: location)
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error: \(error)")
        // Use default weather
        currentWeather = Weather(
            temperature: 15,
            condition: .cloudy,
            city: "France",
            description: "Nuageux"
        )
    }
    
    private func fetchWeather(for location: CLLocation) {
        isLoading = true
        
        let lat = location.coordinate.latitude
        let lon = location.coordinate.longitude
        let urlString = "https://api.openweathermap.org/data/2.5/weather?lat=\(lat)&lon=\(lon)&appid=\(apiKey)&units=metric&lang=fr"
        
        guard let url = URL(string: urlString) else { return }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                
                guard let data = data,
                      let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                    return
                }
                
                let main = json["main"] as? [String: Any]
                let weatherArray = json["weather"] as? [[String: Any]]
                let weather = weatherArray?.first
                
                let temp = main?["temp"] as? Double ?? 15
                let description = weather?["description"] as? String ?? "Nuageux"
                let weatherId = weather?["id"] as? Int ?? 800
                let city = json["name"] as? String ?? "France"
                
                let condition = self?.mapWeatherCondition(id: weatherId, temp: temp) ?? .cloudy
                
                self?.currentWeather = Weather(
                    temperature: temp,
                    condition: condition,
                    city: city,
                    description: description.capitalized
                )
            }
        }.resume()
    }
    
    private func mapWeatherCondition(id: Int, temp: Double) -> WeatherCondition {
        switch id {
        case 200...232: return .stormy
        case 300...321: return .rainy
        case 500...531: return .rainy
        case 600...622: return .snowy
        case 800: return temp > 25 ? .hot : .sunny
        case 801...804: return .cloudy
        default: return temp < 10 ? .cold : .sunny
        }
    }
}
