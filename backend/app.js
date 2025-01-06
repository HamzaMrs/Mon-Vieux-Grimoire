const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const booksRoutes = require('./routes/books');  // On importe les routes
const userRoutes = require('./routes/user');   // Si tu as des routes pour l'authentification

const app = express();

// Connexion à la base de données MongoDB
const connectLink = 'mongodb://127.0.0.1:27017/ma_base'; 
mongoose.connect(connectLink)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

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
app.use('/api/auth', userRoutes);    // Route pour gérer l'authentification (si tu en as une)

// Servir les images statiques depuis le dossier "images"
app.use('/images', express.static(path.join(__dirname, 'images')));

// Route de test pour vérifier si le backend est bien actif
app.get('/', (req, res) => {
  res.send('Backend is running');
});

module.exports = app;
