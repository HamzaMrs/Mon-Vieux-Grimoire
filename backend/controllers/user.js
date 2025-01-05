const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Création d'un nouvel utilisateur. bcrypt hashe le mot de passe, puis save le sauvegarde dans la BDD
exports.signup = (req, res, next) => {
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


// Fonction de login pour authentifier l'utilisateur
exports.login = (req, res, next) => {
    // Recherche de l'utilisateur par email
    User.findOne({ email: req.body.email })
      .then(user => {
        // Si l'utilisateur n'est pas trouvé, renvoyer une erreur 401 Unauthorized
        if (!user) {
          return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
        }
  
        // Comparaison du mot de passe fourni avec celui stocké dans la base de données
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            // Si le mot de passe est incorrect, renvoyer une erreur 401 Unauthorized
            if (!valid) {
              return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
            }
  
            // Si le mot de passe est correct, renvoyer une réponse 200 OK avec le userId et le token JWT
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(
                { userId: user._id }, // Données à encoder dans le token
                'SECRET_KEY', // Clé secrète pour signer le token
                { expiresIn: '24h' } // Durée de validité du token
                    )
                });
            })
            .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};