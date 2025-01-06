const express = require('express');
const router = express.Router();

const auth = require("../middleware/auth");    // Middleware pour l'authentification
const multer = require("../middleware/multer-config"); // Middleware pour gérer les fichiers image

const bookCtrl = require('../controllers/books'); // Contrôleur pour les livres

router.get('/', bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.bestRatings);
router.post("/", auth, multer.upload, multer.optimizeImage, bookCtrl.createBook);
router.post("/:id/rating", auth, bookCtrl.rateOneBook);
router.get("/:id", bookCtrl.getOneBook);
router.put("/:id", auth, multer.upload, multer.optimizeImage, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
