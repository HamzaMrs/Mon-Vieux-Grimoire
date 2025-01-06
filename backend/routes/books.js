const express = require('express');
const router = express.Router();

const bookCtrl = require('../controllers/books'); // Contrôleur pour les livres
const auth = require("../middleware/auth");    // Middleware pour l'authentification
const multer = require("../middleware/multer-config"); // Middleware pour gérer les fichiers image

// Création d'un livre
router.post("/", auth, multer.upload, multer.optimizeImage, bookCtrl.createBook);

// Modification d'un livre
router.put("/:id", auth, multer.upload, multer.optimizeImage, bookCtrl.modifyBook);

// Suppression d'un livre
router.delete("/:id", auth, bookCtrl.deleteBook);

// Obtenir les livres les mieux notés
router.get("/bestrating", bookCtrl.bestRatings);

// Obtenir un livre par son ID (une seule route pour cela)
router.get("/:id", bookCtrl.getOneBook);

// Noter un livre
router.post("/:id/rating", auth, bookCtrl.rateOneBook);

// Obtenir tous les livres
router.get('/', bookCtrl.getAllBooks);

module.exports = router;
