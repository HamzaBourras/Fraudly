# 🛡️ Fraudly - Plateforme d'Apprentissage & Proctoring IA

Fraudly est une plateforme de gestion de l'apprentissage (LMS) et d'évaluation, intégrant des fonctionnalités avancées de télésurveillance (Proctoring) par Intelligence Artificielle. Elle repose sur une architecture microservices robuste pour assurer haute disponibilité, scalabilité et séparation des responsabilités.

## 🏗️ Architecture du Projet

L'application est structurée autour de trois composants principaux : un Frontend en Angular, un Backend IA, et un Backend Spring Boot.

### 🧩 Microservices Spring Boot (`Backend-spring/`)
L'écosystème backend est découpé en plusieurs services spécialisés :
* **`authentification-service`** : Gestion des utilisateurs, des rôles et de la sécurité via JWT.
* **`learning-service`** : Gestion des cours, des chapitres, des ressources (avec stockage AWS S3) et des inscriptions.
* **`assessment-service`** : Moteur d'évaluation gérant les examens, les questions, les tentatives et les corrections automatiques.
* **`proctoring-service`** : Surveillance des sessions d'examen et gestion des paires d'alertes de collusion.
* **`analytics-service`** : Collecte de statistiques, fréquences des sujets et profils d'apprentissage des étudiants.
* **`gateway-service`** : API Gateway servant de point d'entrée unique pour le routage des requêtes client.
* **`discavery-service`** : Service de découverte (Eureka) pour l'enregistrement et la localisation dynamique des microservices.

La communication asynchrone entre ces services (comme les alertes de collusion ou les workflows d'apprentissage) est assurée par un broker de messages **Apache Kafka**.

### 🧠 Intelligence Artificielle (`Backend-IA/`)
* Service conteneurisé dédié aux fonctionnalités d'IA (génération de contenu, audit, détection).

### 💻 Interface Client (`Frontend/`)
* Application Web Single Page Application (SPA) développée en Angular, comprenant les modules de tableau de bord (professeur/étudiant), les vues de cours et l'interface de passage d'examens interactifs.

## 🚀 Installation & Déploiement

### Prérequis
* Docker et Docker Compose
* Java 17+ et Maven
* Node.js et Angular CLI

### Démarrage rapide (Docker)
Un fichier `compose.yaml` est fourni à la racine pour orchestrer et conteneuriser l'ensemble des services.

1. Clonez le dépôt en local :
   ```bash
   git clone [https://github.com/HamzaBourras/Fraudly.git](https://github.com/HamzaBourras/Fraudly.git)
   cd Fraudly
