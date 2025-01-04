const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

// Use of a secret key
const secret = process.env.JWT_SECRET || 'defaultSecretKey';

// limiting time between connexion attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limite à 5 tentatives de connexion par IP
    message: 'Trop de tentatives de connexion, réessayez dans 15 minutes'
});

// control if strong passwordd
function isStrongPassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[\W_]/.test(password); 

    return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar
    );
}

exports.signup = (req, res, next) => {
    // Validate email before proceeding
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({ message: 'Email invalide' });
    }

    // Confirm password complexity
    if (!isStrongPassword(req.body.password)) {
        return res.status(400).json({
            message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
        });
    }

    // Password hashing at increased cost for greater security
    bcrypt.hash(req.body.password, 12) 
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé!' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    // Validate email before proceeding
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({ message: 'Email invalide' });
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
            }
            // Secure hashed password comparison
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            secret, // Secure secret key
                            { expiresIn: '24h' } // Token lifetime
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

// Export the limiter for use in routes
exports.loginLimiter = loginLimiter;