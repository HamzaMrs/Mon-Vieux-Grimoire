const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration du stockage des fichiers avec multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); // Dossier de destination pour les fichiers
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_'); // Remplacement des espaces par des underscores dans le nom du fichier
    const extension = MIME_TYPES[file.mimetype]; // Obtention de l'extension du fichier
    callback(null, name + Date.now() + '.' + extension); // Création du nom du fichier avec un timestamp
  }
});

// Middleware pour optimiser l'image téléchargée
const optimizeImage = async (req, res, next) => {
  if (!req.file) return next(); // Si aucun fichier n'est téléchargé, passer au middleware suivant

  const originalImagePath = req.file.path; // Chemin de l'image originale
  const optimizedImageName = `optimized_${path.basename(
    req.file.filename,
    path.extname(req.file.filename)
  )}.webp`; // Création du nom de l'image optimisée avec extension .webp
  const optimizedImagePath = path.join('images', optimizedImageName); // Chemin de l'image optimisée

  try {
    sharp.cache(false); // Désactiver le cache de sharp pour cette opération
    await sharp(originalImagePath)
      .webp({ quality: 80 }) 
      .resize(400) 
      .toFile(optimizedImagePath); // Enregistrement de l'image optimisée
      req.file.filename = optimizedImageName

    // Supprime l'image originale après optimisation.
    fs.unlink(originalImagePath, (error) => {
      if (error) {
        console.error("Impossible de supprimer l'image originale :", error);
        return next(error);
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};

// Exporte les fonctionnalités de téléchargement et d'optimisation d'image.
module.exports = {
  upload: multer({ storage }).single('image'),
  optimizeImage,
};