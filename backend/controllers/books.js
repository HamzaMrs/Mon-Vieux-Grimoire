const Book = require("../models/Book");
const fs = require("fs");

// Créer un livre
exports.createBook = (req, res, next) => {
  if (!req.body.book) {
      return res.status(400).json({ message: "Données du livre manquantes" });
  }
  let bookObject;
  try {
      bookObject = JSON.parse(req.body.book);
  } catch (error) {
      return res.status(400).json({ message: "Format JSON invalide" });
  }
  // Vérifier tous les champs obligatoires
  const requiredFields = ['title', 'author', 'year', 'genre', 'ratings'];
  const missingFields = requiredFields.filter(field => !bookObject[field]);
  if (missingFields.length > 0 || !req.file) {
      return res.status(400).json({ 
          message: "Tous les champs sont obligatoires, y compris l'image et les notes", 
          missingFields: missingFields.concat(req.file ? [] : ['imageUrl'])
      });
  }
  // Vérifier que ratings n'est pas vide
  if (bookObject.ratings.length === 0) {
      return res.status(400).json({ 
          message: "Au moins une note est requise", 
          missingFields: ['ratings']
      });
  }
  // Vérifier que chaque note a un userId et un grade
  bookObject.ratings.forEach((rating, index) => {
      if (!rating.userId || !rating.grade) {
          return res.status(400).json({ 
              message: `La note ${index + 1} doit avoir un userId et un grade`, 
              missingFields: ['userId', 'grade']
          });
      }
  });
  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      averageRating: bookObject.ratings.reduce((total, rating) => total + rating.grade, 0) / bookObject.ratings.length
  });
  book.save()
      .then(() => res.status(201).json({ message: "Livre enregistré !" }))
      .catch((error) => {
          console.error("Erreur lors de l'enregistrement :", error);
          res.status(400).json({ error });
      });
}

//Obtenir tout les livres
exports.getAllBooks = (req, res, next) => {
    Book.find()
      .then((books) => {res.status(200).json(books)})
      .catch((error) => {res.status(400).json({error: error})});
  };

//Obtenir un seul livre par son ID
exports.getOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
      .then((book) => {res.status(200).json(book)})
      .catch(error => res.status(404).json({ error }));
  };

// Modifier un livre
exports.modifyBook = (req, res, next) => {
  let bookObject;

  // Si un fichier est envoyé, on inclut l'URL de l'image, sinon on garde juste les données envoyées
  if (req.file) {
    bookObject = {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    };
  } else {
    bookObject = { ...req.body };
  }

  delete bookObject._userId;

  // Vérification des champs obligatoires
  const requiredFields = ['title', 'author', 'year', 'genre'];
  const missingFields = requiredFields.filter(field => !bookObject[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({ 
      message: "Champs obligatoires manquants", 
      missingFields: missingFields 
    });
  }

  // Recherche du livre à modifier par son ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: "Non autorisé" });
      } else {
        // Mise à jour du livre si tous les champs sont présents
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => {
            // Suppression de l'ancienne image si une nouvelle image est fournie
            if (req.file && book.imageUrl) {
              const imagePath = book.imageUrl.split("/images/")[1];
              fs.unlinkSync(`images/${imagePath}`);
            }
            res.status(200).json({ message: "Livre modifié!" });
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};



//Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

//Livre les mieux notés
exports.bestRatings = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

//noter un livre
exports.rateOneBook = (req, res, next) => {
  const userId = req.body.userId;
  const grade = req.body.rating;
  if (grade < 0 || grade > 5) {
    return res
      .status(400)
      .json({ message: "La note doit être comprise entre 0 et 5." });
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(400).json({ message: "Livre non trouvé! " });
      }
      if (book.userId === req.auth.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const hasAlreadyRated = book.ratings.some(
        (rating) => rating.userId.toString() === userId
      );
      if (hasAlreadyRated) {
        return res
          .status(400)
          .json({ message: "L'utilisateur a déjà noté ce livre" });
      }
      book.ratings.push({ userId, grade });
      // Recalcul de la moyenne des notes.
      const totalGrade = book.ratings.reduce(
        (accumulator, currentValue) => accumulator + currentValue.grade,
        0
      );
      const averageRating = totalGrade / book.ratings.length;
      //Moyenne à un seul chiffre après la virgule
      const roundedAverageRating = parseFloat(averageRating.toFixed(1));
      //Mise à jour de la moyenne dans le livre.
      book.averageRating = roundedAverageRating;

      //Sauvegarde les modifications dans la base de données.
      book
        .save()
        .then(() => res.status(200).json(book))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};