const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};


const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  const originalImagePath = req.file.path;
  const optimizedImageName = `optimized_${path.basename(
    req.file.filename,
    path.extname(req.file.filename)
  )}.webp`;
  const optimizedImagePath = path.join('images', optimizedImageName);

  try {
    sharp.cache(false);
    await sharp(originalImagePath)
      .webp({ quality: 90 }) // Meilleure qualité
      //.resize({ width: 400 }) // Redimensionne seulement si nécessaire
      .toFile(optimizedImagePath);

    req.file.filename = optimizedImageName;
    req.file.path = optimizedImagePath;

    // Supprimer l'image originale
    fs.unlink(originalImagePath, (error) => {
      if (error) console.error("Impossible de supprimer l'image originale :", error);
    });


    const bookId = req.params.id; // Id du livre
    await BookModel.findByIdAndUpdate(bookId, { imagePath: optimizedImagePath });

    next();
  } catch (error) {
    console.error("Erreur lors de l'optimisation de l'image :", error);
    next(error);
  }
};


module.exports = {
  upload: multer({ storage }).single('image'),
  optimizeImage,
};
