const jwt = require("jsonwebtoken");

// Exportation du middleware d'authentification
module.exports = (req, res, next) => {
  try {
    // Récupération du token à partir de l'en-tête d'autorisation
    const token = req.headers.authorization.split(' ')[1];
    
    // Vérification et décryptage du token avec la clé secrète
    const decodedToken = jwt.verify(token, 'SECRET_KEY');
    
    // Extraction de l'identifiant utilisateur du token décrypté
    const userId = decodedToken.userId;
    
    // Ajout de l'identifiant utilisateur à l'objet req.auth pour l'utiliser dans les middlewares ou routes suivants
    req.auth = {
      userId: userId,
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};