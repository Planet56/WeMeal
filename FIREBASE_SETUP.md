# 🍽️ WeMeal - Configuration Firebase

## 📋 Étapes de Configuration

### 1. Créer un projet Firebase

1. Va sur [Firebase Console](https://console.firebase.google.com/)
2. Clique sur **"Ajouter un projet"**
3. Nomme-le (ex: `wemeal-app`)
4. Désactive Google Analytics si tu veux (pas nécessaire)
5. Clique **Créer le projet**

### 2. Ajouter une application Web

1. Dans ton projet, clique sur l'icône **Web** (`</>`)
2. Donne un nom à l'app (ex: `WeMeal Web`)
3. **NE COCHE PAS** Firebase Hosting pour l'instant
4. Clique **Enregistrer l'application**
5. **COPIE les clés de configuration** qui s'affichent :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "wemeal-app.firebaseapp.com",
  projectId: "wemeal-app",
  storageBucket: "wemeal-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 3. Configurer Firestore Database

1. Dans le menu de gauche, clique **Firestore Database**
2. Clique **Créer une base de données**
3. Choisis **Mode production** (recommandé) ou **Mode test** (plus permissif)
4. Sélectionne une région proche de toi (ex: `europe-west1`)
5. Clique **Activer**

### 4. Configurer les Règles Firestore

1. Va dans **Firestore Database > Règles**
2. Remplace le contenu par :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /recipes/{recipeId} {
      // Tout le monde peut lire
      allow read: if true;
      // Seuls les admins authentifiés peuvent écrire
      allow write: if request.auth != null;
    }
  }
}
```

3. Clique **Publier**

### 5. Activer l'Authentification

1. Dans le menu, clique **Authentication**
2. Clique **Commencer**
3. Onglet **Mode de connexion** > Active **E-mail/Mot de passe**
4. Clique **Enregistrer**

### 6. Créer un utilisateur Admin

1. Va dans **Authentication > Users**
2. Clique **Ajouter un utilisateur**
3. Entre ton email et un mot de passe sécurisé
4. Clique **Ajouter un utilisateur**

### 7. Mettre à jour les fichiers WeMeal

Remplace `YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc. dans ces fichiers :

- `admin.html` (ligne ~253)
- `firebase-loader.js` (ligne ~15)

Avec tes propres valeurs copiées à l'étape 2.

---

## 🚀 Utilisation

### Panel Admin

1. Ouvre `admin.html` dans ton navigateur
2. Connecte-toi avec l'email/mot de passe créé à l'étape 6
3. Tu peux maintenant :
   - ➕ Ajouter des recettes
   - ✏️ Modifier des recettes existantes
   - 🗑️ Supprimer des recettes
   - 🔄 Synchroniser les recettes de `recipes.js` vers Firebase

### Site Principal

Le site `index.html` chargera automatiquement les recettes depuis Firebase si configuré.
Si Firebase n'est pas configuré ou accessible, il utilisera le fichier `recipes.js` statique.

---

## 🔐 Sécurité

- **Ne partage JAMAIS** tes clés Firebase publiquement si ton projet a des données sensibles
- Les clés côté client sont **normales** pour Firebase Web, la sécurité est gérée par les règles Firestore
- Seuls les utilisateurs authentifiés peuvent modifier les recettes

---

## 🌐 Hébergement

Pour héberger ton site avec Firebase Hosting :

1. Installe Firebase CLI : `npm install -g firebase-tools`
2. Connecte-toi : `firebase login`
3. Initialise : `firebase init hosting`
4. Déploie : `firebase deploy`

Ton site sera accessible sur `https://ton-projet.web.app`

---

## 📞 Support

En cas de problème, vérifie :
1. Que tes clés Firebase sont correctes
2. Que Firestore est bien créé et les règles publiées
3. Que l'authentification Email/Password est activée
4. La console du navigateur pour les erreurs (F12)
