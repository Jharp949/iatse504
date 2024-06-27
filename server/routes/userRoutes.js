const express = require('express');
const userControllers = require('../controllers/userControllers');

const router = express.Router();

// GET routes
router.get('/', userControllers.getAllUsers);
router.get('/:id', userControllers.findById);
router.get('/confirm/:token', userControllers.confirmRegistration);

// POST routes
router.post('/register', userControllers.registration);
router.post('/login', userControllers.loginUser);
router.post('/sendPasswordResetEmail', userControllers.sendPasswordResetEmail);
//router.post('/upload', uploadControllers.uploadFile);

// PUT routes
router.put('/resetPassword', userControllers.resetPassword);

// DELETE routes

module.exports = router;