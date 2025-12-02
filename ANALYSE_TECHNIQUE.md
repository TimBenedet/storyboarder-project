# Analyse Technique Complète - Storyboarder

**Date d'analyse:** 2 Décembre 2025
**Version analysée:** 3.0.0
**Auteur de l'analyse:** Claude (Anthropic)

---

## Table des matières

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Architecture technique](#architecture-technique)
3. [Stack technologique](#stack-technologique)
4. [Points forts](#points-forts)
5. [Points faibles et risques](#points-faibles-et-risques)
6. [Problèmes pouvant provoquer des bugs/crashes](#problèmes-pouvant-provoquer-des-bugscrashes)
7. [Axes d'amélioration prioritaires](#axes-damélioration-prioritaires)
8. [Recommandations de sécurité](#recommandations-de-sécurité)
9. [Dette technique identifiée](#dette-technique-identifiée)
10. [Conclusion](#conclusion)

---

## Vue d'ensemble du projet

### Description
Storyboarder est une application desktop professionnelle pour la création rapide de storyboards. Elle combine:
- Un canevas de dessin 2D rapide
- Un générateur de scènes 3D sophistiqué (Shot Generator)
- Des capacités AR/VR (WebXR)
- Des fonctionnalités de collaboration P2P
- Import/Export vers de nombreux formats professionnels

### Statistiques du code
| Métrique | Valeur |
|----------|--------|
| Taille totale | ~605 MB |
| Fichiers JS/JSX | ~950 fichiers |
| Dossier src/ | 325 MB |
| Dossier test/ | 84 MB |
| Lignes main.js | 1,744 lignes |
| TODO/FIXME trouvés | 43 occurrences |
| Dépendances prod | 94 packages |
| Dépendances dev | 44 packages |

### Structure du projet
```
storyboarder-project/
├── build/              # Assets de build, icônes
├── configs/            # Configurations Webpack (6 modules)
├── scripts/            # Scripts de déploiement
├── server/             # Serveur P2P backend
├── src/
│   ├── css/           # Feuilles de style
│   ├── data/          # Assets (brushes, modèles 3D)
│   ├── fonts/         # Polices personnalisées
│   ├── img/           # Images
│   ├── js/            # Code source principal
│   │   ├── ar/        # Module Réalité Augmentée
│   │   ├── xr/        # Module VR/XR
│   │   ├── shot-generator/  # Éditeur 3D
│   │   ├── exporters/ # Exportateurs
│   │   ├── importers/ # Importateurs
│   │   └── windows/   # Fenêtres Electron
│   └── snd/           # Sons
└── test/              # Tests et fixtures
```

---

## Architecture technique

### Pattern architectural
- **Electron** pour l'application desktop multi-plateforme
- **React + Redux** pour l'interface utilisateur et la gestion d'état
- **Three.js** via react-three-fiber pour le rendu 3D
- **Express.js** pour le serveur de collaboration
- **PeerJS + Socket.io** pour le P2P temps réel

### Flux de données
```
┌─────────────────┐     ┌─────────────────┐
│  Main Process   │◄────│  Redux Store    │
│   (Electron)    │     │  (electron-redux)│
└────────┬────────┘     └────────┬────────┘
         │                       │
         │ IPC                   │
         │                       │
┌────────▼────────┐     ┌────────▼────────┐
│ Renderer Process│     │   P2P Server    │
│  (React + R3F)  │◄────│  (Express+Peer) │
└─────────────────┘     └─────────────────┘
```

### Modules principaux
1. **Main Process** (`src/js/main.js`) - Point d'entrée Electron
2. **Shot Generator** - Éditeur de scènes 3D
3. **XR Module** - Réalité virtuelle/étendue
4. **AR Module** - Réalité augmentée
5. **Express App** - Application mobile companion
6. **Print Project** - Export PDF

---

## Stack technologique

### Core Framework
| Technologie | Version | Rôle |
|-------------|---------|------|
| Electron | 18.0.2 | Framework desktop |
| React | 16.10.1 | UI Framework |
| Redux | 4.0.1 | State management |
| Three.js | 0.115.0 | Rendu 3D WebGL |
| react-three-fiber | 4.0.12 | Bindings React/Three |

### Backend & Réseau
| Technologie | Version | Rôle |
|-------------|---------|------|
| Express | 4.15.4 | Serveur web |
| Socket.io | 2.3.0 | Communication temps réel |
| PeerJS | 1.3.1 | Connexions P2P |
| Winston | 3.3.3 | Logging |

### Média & Fichiers
| Technologie | Version | Rôle |
|-------------|---------|------|
| FFmpeg (static) | 4.4.1 | Encodage vidéo |
| PDFKit | 0.13.0 | Génération PDF |
| ag-psd | 11.1.3 | Support Photoshop |
| Paper.js | 0.11.5 | Dessin vectoriel 2D |

### Build & Test
| Technologie | Version | Rôle |
|-------------|---------|------|
| Webpack | 4.46.0 | Bundler |
| Babel | 7.12.3 | Transpileur |
| Mocha | 8.2.0 | Test framework |
| electron-builder | - | Packaging |

---

## Points forts

### 1. Architecture modulaire bien pensée
- Séparation claire des modules (shot-generator, xr, ar)
- Configurations Webpack distinctes par module
- Code organisé par fonctionnalité

### 2. Stack technologique moderne
- Utilisation de React avec hooks
- Redux pour une gestion d'état prévisible
- Three.js via react-three-fiber pour un code déclaratif

### 3. Fonctionnalités professionnelles riches
- Import/Export vers formats industriels (Final Cut Pro, Photoshop)
- Système d'IK (Inverse Kinematics) pour les personnages 3D
- Support multi-langue complet (i18next)

### 4. Collaboration P2P
- Architecture peer-to-peer pour collaboration sans serveur central
- Synchronisation temps réel via Socket.io

### 5. Support multi-plateforme
- macOS avec signature de code et notarization
- Windows avec installateur NSIS
- Linux (AppImage, snap, deb)

### 6. Système de préférences et keymap personnalisable
- Migration automatique des keymaps obsolètes
- Persistance des préférences utilisateur

---

## Points faibles et risques

### 1. Configuration de sécurité Electron problématique

**Critique - Niveau de risque: ÉLEVÉ**

```javascript
// Trouvé dans plusieurs fichiers:
webPreferences: {
  nodeIntegration: true,        // DANGEREUX
  contextIsolation: false,      // DANGEREUX
  webSecurity: false            // TRÈS DANGEREUX
}
```

**Fichiers concernés:**
- `src/js/main.js` (7 occurrences)
- `src/js/windows/shot-generator/main.js`
- `src/js/windows/shot-generator-tutorial/main.js`
- `src/js/windows/shot-explorer/setup.js`
- `src/js/windows/language-preferences/main.js`
- `src/js/auto-updater.js`

**Impact:** Vulnérabilité XSS pourrait permettre une exécution de code arbitraire sur le système.

### 2. Versions de dépendances obsolètes

| Package | Version actuelle | Problème |
|---------|-----------------|----------|
| React | 16.10.1 | Obsolète (18.x disponible) |
| react-dom | 16.8.6 | Version différente de React |
| Electron | 18.0.2 | Fin de support (31.x disponible) |
| moment | 2.19.3 | Obsolète, utiliser date-fns |
| request | 2.83.0 | DÉPRÉCIÉ depuis 2020 |
| jsonwebtoken | 8.1.1 | Vulnérabilités connues |

### 3. Gestion d'erreurs incomplète

Le ratio try/catch est déséquilibré:
- 11 blocs `try`
- 14 blocs `catch`

Certaines erreurs ne sont pas correctement capturées ou propagées.

### 4. Fuites mémoire potentielles

**Ratio addEventListener/removeEventListener déséquilibré:**
- `addEventListener` / `.on()` : 53 occurrences
- `removeEventListener` / `dispose` : 41 occurrences

Certains event listeners ne sont pas nettoyés, particulièrement dans le module shot-generator.

### 5. Dette technique élevée
- 43 TODO/FIXME non résolus dans le code
- Code commenté laissé en place
- Fonctions marquées "unused" mais non supprimées

### 6. Incohérence des versions React
```json
"react": "^16.10.1",
"react-dom": "16.8.6"  // Version différente!
```

---

## Problèmes pouvant provoquer des bugs/crashes

### 1. Accès à `mainWindow` sans vérification

**Fichier:** `src/js/main.js`

```javascript
// Lignes 1231-1328: Accès direct à mainWindow.webContents.send()
// sans vérifier si mainWindow existe ou n'est pas détruit

menuBus.on('newBoard', (e, arg)=> {
  mainWindow.webContents.send('newBoard', arg)  // CRASH si mainWindow est null
})
```

**Risque:** Crash de l'application si une action menu est déclenchée avant l'initialisation de la fenêtre principale ou après sa fermeture.

### 2. Gestion asynchrone non protégée

**Fichier:** `src/js/main.js`, ligne 150+

```javascript
app.on('ready', async () => {
  // Pas de try/catch global
  let ffmpegVersion = await exporterFfmpeg.checkVersion()
  // Si ffmpeg n'est pas disponible, erreur non catchée
})
```

### 3. Race conditions dans le chargement de fichiers

**Fichier:** `src/js/main.js`

```javascript
// Problème: recentDocumentsCopy modifié pendant l'itération
for (var recentDocument of prefs.recentDocuments) {
  try {
    fs.accessSync(recentDocument.filename, fs.R_OK)
  } catch (e) {
    recentDocumentsCopy.splice(count, 1)  // Modification pendant itération
  }
  count++
}
```

### 4. Variable `error` vs `err` incohérente

**Fichier:** `src/js/main.js`

```javascript
// Ligne 526-527
fs.readFile(filepath, 'utf-8', (err, data) => {
  if (err) {
    dialog.showMessageBox({
      message: 'Could not open Final Draft file.\n' + error.message,  // ERREUR: 'error' au lieu de 'err'
    })
```

**Impact:** ReferenceError - `error is not defined`

### 5. Fermeture de fenêtre sans nettoyage complet

```javascript
// Le scriptWatcher n'est pas toujours fermé correctement
mainWindow.once('closed', event => {
  // scriptWatcher.close() appelé conditionnellement
  if (scriptWatcher) { scriptWatcher.close() }
  // Mais pas de nettoyage des autres listeners
})
```

### 6. Promesses non gérées

```javascript
// Multiples .then() sans .catch()
dialog.showOpenDialog({...}).then(({ filePaths }) => {
  // ...
})  // Pas de .catch() sur certains appels
```

### 7. Conditions de course dans le chargement IPC

```javascript
ipcMain.on('workspaceReady', event => {
  if (!mainWindow) return  // Protection tardive
  // Le code précédent pourrait crasher
})
```

### 8. Timeout magiques sans gestion d'erreur

```javascript
setTimeout(() => openFile(filePath), 300)  // Pourquoi 300ms?
setTimeout(() => keyCommandWindow.show(), 250)  // Pourquoi 250ms?
setTimeout(() => mainWindow.show(), 1000)  // Windows only, pourquoi?
```

---

## Axes d'amélioration prioritaires

### Priorité 1: Sécurité (CRITIQUE)

1. **Activer `contextIsolation: true`**
   - Migrer vers l'API contextBridge
   - Isoler le processus renderer du processus main

2. **Désactiver `nodeIntegration`**
   - Utiliser preload scripts
   - Exposer uniquement les API nécessaires

3. **Activer `webSecurity: true`**
   - Configurer CSP (Content Security Policy)
   - Valider les origines des ressources

### Priorité 2: Stabilité

1. **Ajouter des vérifications null/undefined**
```javascript
// Avant
mainWindow.webContents.send('newBoard', arg)

// Après
if (mainWindow && !mainWindow.isDestroyed()) {
  mainWindow.webContents.send('newBoard', arg)
}
```

2. **Corriger les bugs de typo (error vs err)**

3. **Ajouter des try/catch globaux**

### Priorité 3: Mise à jour des dépendances

| Package | Action |
|---------|--------|
| Electron | Mettre à jour vers 31.x |
| React | Migrer vers 18.x |
| request | Remplacer par node-fetch ou axios |
| moment | Remplacer par date-fns |
| jsonwebtoken | Mettre à jour vers 9.x |

### Priorité 4: Gestion mémoire

1. **Implémenter un système de cleanup uniforme**
```javascript
useEffect(() => {
  // setup
  return () => {
    // cleanup - TOUJOURS implémenter
  }
}, [])
```

2. **Ajouter des dispose() pour les objets Three.js**

3. **Monitorer les fuites mémoire avec les DevTools**

### Priorité 5: Qualité du code

1. **Résoudre les 43 TODO/FIXME**
2. **Supprimer le code mort**
3. **Ajouter des tests pour les cas limites**
4. **Documenter les timeouts magiques**

---

## Recommandations de sécurité

### Immédiat (À faire maintenant)

1. **Electron Security Hardening**
```javascript
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  webSecurity: true,
  enableRemoteModule: false,
  sandbox: true
}
```

2. **Valider les entrées utilisateur**
   - Sanitizer les chemins de fichiers
   - Valider les données JSON importées

3. **Mettre à jour les dépendances critiques**
   - jsonwebtoken (vulnérabilités CVE)
   - electron (support de sécurité)

### Court terme

1. **Implémenter CSP**
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'">
```

2. **Auditer les permissions de fichiers**
3. **Chiffrer les données sensibles (tokens, licenses)**

### Long terme

1. **Migration vers contextBridge**
2. **Audit de sécurité complet**
3. **Tests de pénétration**

---

## Dette technique identifiée

### Code mort à supprimer
- Fonctions commentées avec "unused"
- `getSceneDifference` (lignes 911-923)
- Variables non utilisées

### Refactoring nécessaire
- `main.js` trop volumineux (1744 lignes) - à découper
- Duplication de code dans les gestionnaires IPC
- Logique métier mélangée avec la gestion de fenêtres

### Tests manquants
- Tests E2E pour le workflow complet
- Tests de régression pour les exports
- Tests de charge pour le P2P

### Documentation à améliorer
- JSDoc manquant sur les fonctions critiques
- Diagrammes d'architecture absents
- Guide de contribution incomplet

---

## Conclusion

### Résumé des risques

| Catégorie | Niveau | Impact |
|-----------|--------|--------|
| Sécurité Electron | CRITIQUE | Exécution de code arbitraire |
| Stabilité | ÉLEVÉ | Crashes potentiels |
| Dépendances | MOYEN | Vulnérabilités connues |
| Maintenance | MOYEN | Dette technique croissante |
| Performance | FAIBLE | Fuites mémoire possibles |

### Plan d'action recommandé

1. **Semaine 1-2:** Corriger les problèmes de sécurité Electron
2. **Semaine 3-4:** Corriger les bugs critiques (null checks, typos)
3. **Mois 2:** Mettre à jour les dépendances critiques
4. **Mois 3:** Refactorer main.js et améliorer les tests
5. **Continu:** Réduire la dette technique progressivement

### Note finale

Storyboarder est une application ambitieuse et riche en fonctionnalités. L'architecture de base est solide, mais des problèmes de sécurité critiques et une dette technique accumulée nécessitent une attention immédiate. Les axes d'amélioration identifiés permettront de transformer cette base en une application plus robuste et maintenable.

---

*Ce rapport a été généré automatiquement par analyse statique du code source. Une revue manuelle approfondie et des tests dynamiques sont recommandés pour compléter cette analyse.*
