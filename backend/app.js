const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const booksRoutes = require('./routes/books');  // On importe les routes
const userRoutes = require('./routes/user');

const app = express();

// Connexion à MongoDB Atlas avec la chaîne d'URL récupérée depuis le fichier .env
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('Connexion à MongoDB Atlas réussie !'))
  .catch((error) => console.log('Connexion à MongoDB Atlas échouée !', error));

// Middleware pour gérer les CORS et autoriser l'accès depuis n'importe quel domaine
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');  // Permet l'accès à toutes les origines
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Middleware pour parse le JSON dans les requêtes entrantes
app.use(express.json());

// Définir les routes
app.use('/api/books', booksRoutes);  // Route pour gérer les livres
app.use('/api/auth', userRoutes);    // Route pour gérer l'authentification

// Servir les images statiques depuis le dossier "images"
app.use('/images', express.static(path.join(__dirname, 'images')));

// Route de test pour vérifier si le backend est bien actif
app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // Répond avec un statut 204 (No Content)
});

module.exports = app;
