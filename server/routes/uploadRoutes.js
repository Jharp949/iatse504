const express = require('express');
const fileControllers = require('../controllers/uploadControllers');

multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/assets/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

const router = express.Router();

// GET routes
//router.get('/', userControllers.getAllUsers);
//router.get('/:id', userControllers.findById);

// POST routes
router.post('/upload', upload.single('file'), fileControllers.uploadFile);


// PUT routes


// DELETE routes

module.exports = router;