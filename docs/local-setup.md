# Guide de déploiement et d'exécution en local

Ce document décrit deux approches pour démarrer l'ensemble de la plateforme (API + frontend + base PostgreSQL) sur votre machine :

1. **Avec Docker Compose** – solution recommandée pour une mise en route rapide et isolée.
2. **Sans Docker** – pour un lancement direct via Node.js, utile lors du développement ciblé sur l'API ou le frontend.

Avant de commencer, assurez-vous d'avoir cloné le dépôt et positionnez-vous à la racine du projet.

## 1. Exécution avec Docker Compose (recommandé)

### 1.1. Prérequis
- Docker Desktop (ou Docker Engine) 24+.
- Docker Compose v2 (intégré à Docker Desktop ou installé séparément).

### 1.2. Lancer l'environnement
```bash
# À la racine du projet
docker compose -f docker-compose.dev.yml up --build
```

Cette commande construit les images si nécessaire, puis démarre :
- **PostgreSQL** (`db`) exposé sur `localhost:5432` avec la base `studiofit` et l'utilisateur/mot de passe `studiofit`.
- **API Node.js** (`api`) en mode développement sur `http://localhost:3000`.
- **Frontend Vite/React** (`frontend`) en mode développement sur `http://localhost:5173`.

Les volumes Docker montent le code source dans les conteneurs pour activer le rechargement à chaud (`ts-node` côté API, `npm run dev` côté frontend).

### 1.3. Arrêter l'environnement
```bash
docker compose -f docker-compose.dev.yml down
```

Ajoutez `-v` si vous souhaitez également supprimer les volumes (et donc les données Postgres locales).

### 1.4. Santé des services
- API : vérifiez `http://localhost:3000/health` (une sonde HTTP est configurée dans `Dockerfile.backend`).
- Frontend : ouvrez `http://localhost:5173` dans votre navigateur.
- Base de données : utilisez un client Postgres (`psql`, TablePlus, DBeaver…) en vous connectant à `postgres://studiofit:studiofit@localhost:5432/studiofit`.

## 2. Exécution locale sans Docker

### 2.1. Prérequis
- Node.js 20.x et npm 10.x.
- PostgreSQL 15+ installé localement (ou exécuté via un autre conteneur).
- Variables d'environnement pour l'API :
  - `DATABASE_URL` (ex. `postgres://studiofit:studiofit@localhost:5432/studiofit`).
  - `ACCESS_TOKEN_SECRET` et `REFRESH_TOKEN_SECRET` (chaînes aléatoires longues pour le JWT).
  - `CLIENT_ORIGIN` (ex. `http://localhost:5173`).

### 2.2. Préparer la base de données
Créez la base et les identifiants correspondant à la chaîne `DATABASE_URL`. Vous pouvez utiliser le script SQL fourni :
```bash
psql -f schema.sql postgres
```
Adaptez la commande si vous devez passer un hôte ou un utilisateur différent.

### 2.3. Installer les dépendances
```bash
npm install
```
La commande déclenche également `npm install` dans `frontend/` via le script `postinstall`.

### 2.4. Démarrer l'API en développement
```bash
npm run start:dev
```
Le serveur Express écoute sur le port `3000` (configurable avec la variable `PORT`).

### 2.5. Démarrer le frontend
```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```
Ouvrez ensuite `http://localhost:5173`.

### 2.6. Construire et lancer en production locale (optionnel)
```bash
# Construire l'API
npm run build
npm start

# Construire le frontend
cd frontend
npm run build
npm run preview
```
Cela permet de tester les builds optimisés (`dist/server.js` pour l'API, `frontend/dist` pour le front).

## 3. Nettoyage et astuces
- Utilisez `docker compose logs -f <service>` pour suivre les journaux lorsque vous êtes en mode conteneur.
- Les tests peuvent être exécutés indépendamment de la méthode de lancement via les commandes décrites dans la documentation de tests (`npm test`, `npm run test:unit`, `npm run test:api`, `npm run test:playwright`, `npm run test:all`).
- Pour modifier les secrets en mode Docker, ajustez les variables d'environnement dans `docker-compose.dev.yml`.

## 4. Ressources complémentaires
- `Dockerfile.backend` et `frontend/Dockerfile` détaillent la configuration des images.
- `docker-compose.dev.yml` orchestre les services pour le développement local.
- `schema.sql` fournit une structure de base de données initiale.

En suivant ces étapes, vous pouvez développer et tester la plateforme intégralement sur votre machine, avec ou sans Docker.
