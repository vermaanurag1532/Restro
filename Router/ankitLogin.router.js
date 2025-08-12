// Router/ankitLogin.router.js
import express from 'express';
import ankitLoginController from '../Controller/ankitLogin.controller.js';

const AnkitRouter = express.Router();

// Authentication routes
AnkitRouter.post('/signin', ankitLoginController.signIn);
AnkitRouter.post('/signup', ankitLoginController.signUp);
AnkitRouter.post('/signout', ankitLoginController.signOut);
AnkitRouter.post('/forgot-password', ankitLoginController.forgotPassword);

// User profile routes
AnkitRouter.put('/profile', ankitLoginController.updateProfile);
AnkitRouter.put('/fcm-token', ankitLoginController.updateFCMToken);
AnkitRouter.get('/profile/:userId', ankitLoginController.getUserProfile);

// App version check route
AnkitRouter.get('/version-check', ankitLoginController.versionCheck);

// Get all users (admin functionality)
AnkitRouter.get('/users', ankitLoginController.getAllUsers);

// Delete user
AnkitRouter.delete('/user/:userId', ankitLoginController.deleteUser);

export default AnkitRouter;