const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// Configuration de multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); // Dossier de destination
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_'); // Remplace les espaces par des underscores
    const extension = MIME_TYPES[file.mimetype]; // Récupère l'extension
    callback(null, name + Date.now() + '.' + extension); // Crée un nom unique
  },
});

// Middleware pour optimiser l'image
const optimizeImage = async (req, res, next) => {
  if (!req.file) return next(); // Si aucun fichier, passe au middleware suivant

  const originalImagePath = req.file.path; // Chemin de l'image originale
  const optimizedImageName = `optimized_${path.basename(
    req.file.filename,
    path.extname(req.file.filename)
  )}.webp`; // Nom de l'image optimisée
  const optimizedImagePath = path.join('images', optimizedImageName); // Chemin complet de l'image optimisée

  try {
    sharp.cache(false); // Désactiver le cache de sharp
    await sharp(originalImagePath)
      .webp({ quality: 80 }) // Convertit en .webp avec une qualité de 80
      .resize(400) // Redimensionne à une largeur maximale de 400px
      .toFile(optimizedImagePath); // Enregistre l'image optimisée

    // Mettre à jour les informations dans req.file
    req.file.filename = optimizedImageName;
    req.file.path = optimizedImagePath;

    // Supprimer l'image originale
    fs.unlink(originalImagePath, (error) => {
      if (error) {
        console.error("Impossible de supprimer l'image originale :", error);
        return next(error);
      }
      next();
    });
  } catch (error) {
    console.error("Erreur lors de l'optimisation de l'image :", error);
    next(error);
  }
};

module.exports = {
  upload: multer({ storage }).single('image'),
  optimizeImage,
};
