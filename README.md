# Diagnostic Système & Réseau

Outil de diagnostic front-end pour analyser les performances réseau, navigateur, système et stockage en temps réel.

## Fonctionnalités

### Réseau
- Statut de connexion (en ligne/hors ligne)
- Type de connexion (WiFi, 4G, 5G, Ethernet)
- Test de latence (ping simulation)
- Test de vitesse de téléchargement
- Détection de l'adresse IP publique

### Navigateur
- Détection du navigateur et version
- Système d'exploitation
- Résolution d'écran
- État des cookies

### Performance
- Benchmark CPU (calcul de nombres premiers)
- Utilisation mémoire (si disponible)
- Niveau de batterie
- État de charge

### Stockage
- LocalStorage (disponibilité et espace utilisé)
- SessionStorage
- IndexedDB
- Cache API

### Autres
- Score global sur 100
- Export des résultats en JSON
- Interface responsive (mobile/desktop)
- Aucune dépendance externe

## Installation

Aucune installation nécessaire. Il suffit de cloner le dépôt et d'ouvrir le fichier HTML.

```bash
git clone https://github.com/votre-username/diagnostic-systeme.git
cd diagnostic-systeme
```

## Utilisation

### Méthode 1 : Ouverture directe
Double-cliquez sur `index.html` pour lancer l'outil dans votre navigateur.

### Méthode 2 : Serveur local (recommandé pour le développement)
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

## Structure du projet

```
diagnostic-systeme/
├── index.html          # Structure HTML
├── styles.css          # Styles CSS
├── app.js             # Logique JavaScript (vanilla)
├── README.md          # Documentation
└── LICENSE            # Licence MIT
```

## Technologies utilisées

- HTML5
- CSS3 (Variables CSS, Grid, Flexbox)
- JavaScript ES6+ (Vanilla JS, aucune dépendance)
- APIs Web natives :
  - Navigator API
  - Performance API
  - Fetch API
  - Battery API
  - Storage APIs (LocalStorage, SessionStorage, IndexedDB, Cache)

## Fonctionnement

L'outil effectue des tests en temps réel lors du chargement de la page :

1. **Tests réseau** : Requêtes HTTP pour mesurer latence et vitesse
2. **Détection navigateur** : Parsing du User Agent
3. **Benchmark CPU** : Calcul de nombres premiers sur 100 000 itérations
4. **Vérification stockage** : Tests d'écriture/lecture

Chaque module génère un score sur 100, agrégé en score global.

<img width="1434" height="784" alt="image" src="https://github.com/user-attachments/assets/16ecf166-6a86-48b0-b7a1-9954b29c8b35" />


## Compatibilité

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+
- ⚠️ Certaines fonctionnalités peuvent ne pas être disponibles sur tous les navigateurs (Battery API, Memory API)

## Export des résultats

Cliquez sur "Exporter JSON" pour télécharger un fichier contenant :
- Tous les résultats des diagnostics
- Scores détaillés par catégorie
- Timestamp de l'analyse

Format du JSON :
```json
{
  "network": { ... },
  "browser": { ... },
  "performance": { ... },
  "storage": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Contribuer

Les contributions sont les bienvenues ! 

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/amelioration`)
3. Committez vos changements (`git commit -m 'Ajout fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteur

Massot Sacha - [@sxcha02](https://github.com/sxcha02)

## Remerciements

- Inspiré par les outils de diagnostic système professionnels
- Conçu sans framework pour maximiser la compatibilité et la performance
