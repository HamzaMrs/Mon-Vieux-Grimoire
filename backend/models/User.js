const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Ajout d'un index unique pour éviter les doublons même en cas d'erreur Mongoose
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);