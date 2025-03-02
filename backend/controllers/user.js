const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Fonction pour valider l'email avec une regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Création d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    if (!isValidEmail(req.body.email)) {
        return res.status(400).json({ message: 'Email invalide' });
    }

    bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));  
};

// Fonction de login
exports.login = (req, res, next) => {
    if (!isValidEmail(req.body.email)) {
        return res.status(400).json({ message: 'Email invalide' });
    }

    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.status(401).json({ message: 'Adresse email ou mot de passe incorrecte' });
        }
  
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ message: 'Adresse email ou mot de passe incorrecte' });
            }
  
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(
                { userId: user._id },
                'SECRET_KEY',
                { expiresIn: '24h' }
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
