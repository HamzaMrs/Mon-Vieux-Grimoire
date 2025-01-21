const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const BookModel = require('../models/Book');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// Configuration de multer pour stocker les fichiers temporairement sur le disque
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); // Dossier de stockage temporaire
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_'); // Remplacement des espaces par des underscores
    const extension = MIME_TYPES[file.mimetype] || 'jpg'; // Extension par défaut
    callback(null, `${name}_${Date.now()}.${extension}`);
  }
});

const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  const originalImagePath = req.file.path; // Chemin de l'image d'origine
  const optimizedImageName = `optimized_${Date.now()}.webp`;
  const optimizedImagePath = path.join('images', optimizedImageName);

  try {
    // Traitement de l'image pour la redimensionner et la convertir en WebP
    await sharp(originalImagePath)
      .resize(206, 260, { 
        fit: sharp.fit.cover,  // Utiliser 'cover' pour remplir et couper si nécessaire
        position: sharp.strategy.entropy // Centrer sur la partie la plus "intéressante"
      })
      .webp({ quality: 95 })
      .toFile(optimizedImagePath);

    // Mettre à jour les informations du fichier dans req.file
    req.file.filename = optimizedImageName;
    req.file.path = optimizedImagePath;

    // Supprimer l'image d'origine après avoir généré l'image optimisée
    fs.unlink(originalImagePath, (error) => {
      if (error) console.error("Impossible de supprimer l'image d'origine :", error);
    });

    // Mettre à jour l'image du livre si c'est un livre existant
    if (req.params.id) {
      await BookModel.findByIdAndUpdate(req.params.id, { imagePath: optimizedImagePath });
    }

    next();
  } catch (error) {
    console.error("Erreur lors de l'optimisation de l'image :", error);
    next(error);
  }
};


// Exporter les middlewares
module.exports = {
  upload: multer({ storage }).single('image'),
  optimizeImage,
};
