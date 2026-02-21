# 📱 WeMeal iOS App

Application iOS native pour WeMeal, développée en SwiftUI avec Firebase.

## 🚀 Fonctionnalités

- ✅ **Interface identique** à la version web
- ✅ **Firebase Firestore** - Synchronisation des recettes en temps réel
- ✅ **Mode Diabétique/Végétarien/Vegan** - Filtrage des recettes
- ✅ **Météo locale** - Recommandations basées sur le temps
- ✅ **Recherche avancée** - "Surprends-moi" avec mots-clés
- ✅ **Mode cuisine** - Étapes pas-à-pas en plein écran
- ✅ **Retour haptique** - Vibrations sur chaque interaction
- ✅ **Widget iOS** - Recette du jour sur l'écran d'accueil
- ✅ **Design sombre** - Même style glassmorphism que le web

## 📋 Prérequis

- macOS avec Xcode 15+
- iOS 17+
- Compte Apple Developer (pour tester sur appareil)

## 🔧 Installation

### 1. Ouvrir le projet

```bash
cd /Users/amaurybnrd/Downloads/WeMeal/app
open WeMeal.xcodeproj
```

### 2. Configurer Firebase

Le fichier `GoogleService-Info.plist` est déjà configuré avec tes credentials Firebase.

**Important :** Tu dois ajouter ton app iOS dans la console Firebase :

1. Va sur [console.firebase.google.com](https://console.firebase.google.com)
2. Sélectionne ton projet **wemeal-61b0c**
3. Clique sur **Ajouter une application** → **iOS**
4. Bundle ID : `com.wemeal.app`
5. Télécharge le nouveau `GoogleService-Info.plist` et remplace celui existant

### 3. Ajouter Firebase SDK

Dans Xcode :
1. File → Add Package Dependencies
2. URL : `https://github.com/firebase/firebase-ios-sdk`
3. Sélectionne : `FirebaseFirestore`, `FirebaseAuth`

### 4. Lancer l'app

1. Sélectionne un simulateur iPhone
2. Clique sur ▶️ Run (Cmd+R)

## 📁 Structure du projet

```
WeMeal/
├── WeMealApp.swift          # Point d'entrée
├── Models/
│   ├── AppState.swift       # État global de l'app
│   ├── Recipe.swift         # Modèle recette
│   ├── UserProfile.swift    # Profil utilisateur
│   └── Weather.swift        # Modèle météo
├── Views/
│   ├── ContentView.swift    # Vue principale
│   ├── OnboardingView.swift # Onboarding
│   ├── MainTabView.swift    # Navigation tabs
│   ├── HomeView.swift       # Accueil
│   ├── SurpriseView.swift   # Recherche
│   ├── ProfileView.swift    # Profil
│   ├── RecipeCard.swift     # Carte recette
│   ├── RecipeDetailView.swift # Détail recette
│   └── CookingModeView.swift # Mode cuisine
├── Services/
│   ├── FirebaseService.swift # API Firebase
│   ├── WeatherService.swift  # API Météo
│   └── HapticManager.swift   # Vibrations
├── Widgets/
│   └── WeMealWidget.swift    # Widget iOS
└── Assets.xcassets/          # Images et icônes
```

## 🎨 Design

L'app utilise le même design que la version web :
- **Couleurs** : Dégradé cyan/violet (#0891b2 → #8b5cf6)
- **Fond** : Bleu foncé (#0f172a)
- **Cartes** : Effet glassmorphism
- **Texte** : Blanc (#f8fafc)

## 📲 Widget

Le widget affiche une recette aléatoire et se rafraîchit toutes les heures.

Pour l'ajouter :
1. Appuie longuement sur l'écran d'accueil
2. Appuie sur "+" en haut à gauche
3. Cherche "WeMeal"
4. Choisis le format (petit ou moyen)

## 🔔 Retour haptique

Toutes les interactions ont un retour haptique :
- **Léger** : Boutons, sélections
- **Moyen** : Actions importantes
- **Succès** : Validation, fin de recette
- **Erreur** : Aucun résultat

## 🐛 Debugging

En cas de problème :

1. **Firebase pas connecté** :
   - Vérifie que `GoogleService-Info.plist` est bien ajouté au projet
   - Vérifie le Bundle ID dans Firebase Console

2. **Pas de recettes** :
   - Vérifie ta connexion internet
   - Vérifie que les recettes existent dans Firestore

3. **Météo ne charge pas** :
   - Accepte la permission de localisation
   - Vérifie le simulateur a une position configurée

## 📄 Licence

Projet privé - WeMeal © 2026
