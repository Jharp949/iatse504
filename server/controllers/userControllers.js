
require('dotenv').config();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = require('../models/User');

// Returns all users in the database
exports.getAllUsers = async (req, res, next) => {
    try {
        const [users, _] = await User.findAll();

        res.status(200).json({ count: users.length, users });
    } catch (error) {
        next(error);
    }
};

// Returns a user by ID
exports.findById = async (req, res, next) => {
    try {
        const [users, _] = await User.findById(req.params.id);

        res.status(200).json({ count: users.length, users });
    } catch (error) {
        next(error);
    }
};

// Creates a new user
exports.registration = async (req, res) => {

    try {
        let { firstName, lastName, username, password, email } = req.body;

            // Hash the user password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new instance of the UserRegistration model
        let registration = new User(
            firstName,
            lastName,
            username,
            hashedPassword,
            email
        );

        // Save the registration data to the database
        let newUser = await registration.save();

        // Generate a JWT with the user's ID
        let token = jwt.sign({ id: newUser }, process.env.JWT_SECRET, { expiresIn: '7d' });

        let transporter = nodemailer.createTransport({
            service: process.env.SERVICE,
            auth: {
                user: process.env.CONFIRM_EMAIL,
                pass: process.env.CONFIRM_PASSWORD
            }
        });

        let mailOptions = {
            from: 'musicrulez9@yahoo.com',
            to: 'musicrulez9@yahoo.com',
            subject: 'New user registration',
            text: `A new user has registered. ${firstName} ${lastName} would like access to the website. Click the link below to confirm the user:
            http://localhost:3000/api/user/confirm/${token}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    
        res.send('Registration successful. Awaiting admin confirmation.');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during registration.');
    }
};

exports.confirmRegistration = async (req, res) => {
    let token = req.params.token;

    try {
        // Verify the token
        let decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Update the is_allowed field to true for the user with the given ID
        await User.confirmUser(decoded.id, 1);

        let transporter = nodemailer.createTransport({
            service: process.env.SERVICE,
            auth: {
                user: process.env.CONFIRM_EMAIL,
                pass: process.env.CONFIRM_PASSWORD
            }
        });

        let mailOptions = {
            from: 'musicrulez9@yahoo.com',
            to: 'musicrulez9@yahoo.com',
            subject: 'Registration Confirmed',
            text: `Your account has been confirmed. You can now log in.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.send('User confirmed successfully');
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.send('Token has expired');
        } else if (err instanceof jwt.JsonWebTokenError) {
            res.send('Invalid token');
        } else {
            res.send(err.message);
        }
    }
};

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user in the database
        const [[user]] = await User.findUsername(username);

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check the password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Create a JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the JWT to the client
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred' });
    }
};

// Sends a password reset email to the user
exports.sendPasswordResetEmail = async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user in the database
        const [[user]] = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a JWT with the user's ID
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Create a password reset link
        const resetLink = `http://localhost:3000/reset-password/${token}`;

        // Send the password reset email
        const transporter = nodemailer.createTransport({
            service: process.env.SERVICE,
            auth: {
                user: process.env.CONFIRM_EMAIL,
                pass: process.env.CONFIRM_PASSWORD
            }
        });

        const mailOptions = {
            from: 'musicrulez9@yahoo.com',
            //to: email,
            to: 'musicrulez9@yahoo.com',
            subject: 'Password Reset',
            text: `Click the link below to reset your password:
            ${resetLink}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Failed to send password reset email' });
            } else {
                console.log('Email sent: ' + info.response);
                return res.json({ message: 'Password reset email sent' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
};

// Resets the user's password
exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user in the database
        const [[user]] = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update the user's password
        await User.updatePassword(user.id, hashedPassword);

        return res.json({ message: 'Password reset successful' });
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(400).json({ message: 'Token has expired' });
        } else if (err instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({ message: 'Invalid token' });
        } else {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred' });
        }
    }
};
