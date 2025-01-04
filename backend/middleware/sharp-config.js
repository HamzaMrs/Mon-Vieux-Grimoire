const sharp = require("sharp");
const fs = require('fs');
const path = require("path");

const processImage = (req, res, next) => {
    if (req.file) {
        console.log("File received :", req.file);

        const webpFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
        const webpImagePath = path.join("images", webpFilename);

        const newWidth = 463;
        const newHeight = 595;

        sharp(req.file.buffer)
            .resize(newWidth, newHeight)
            .webp({ quality: 50 })
            .toFile(webpImagePath, (err, info) => {
                if (err) {
                    console.error("Image processing error :", err);
                    return res.status(500).json({ error: "Image processing error" });
                }

                console.log("Image processed and saved as WebP :", info);

                // Update req.file to reflect the new image details
                req.file.filename = webpFilename;
                req.file.path = webpImagePath;

                next();
            });
    } else {
        console.log("No file received");
        next();
    }
};

module.exports = processImage;