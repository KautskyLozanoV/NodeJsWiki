const express = require("express");
const ImagesController = require("../controllers/images");
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

router.post("", multer({storage: storage}).single("image"), ImagesController.uploadImage)

module.exports = router;
