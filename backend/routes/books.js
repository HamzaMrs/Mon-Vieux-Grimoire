const express = require('express');
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const bookCtrl = require('../controllers/book');

router.post("/",auth,multer.upload,multer.optimizeImage,bookCtrl.createBook);

router.put("/:id", auth, multer.upload, multer.optimizeImage, bookCtrl.modifyBook);
  
router.delete("/:id", auth, bookCtrl.deleteBook);
  
router.get("/bestrating", bookCtrl.bestRatings);
  
router.get("/:id", bookCtrl.getOneBook);
  
router.post("/:id/rating", auth, bookCtrl.rateOneBook); 
  
router.get('/', bookCtrl.getAllBooks);

module.exports = router;