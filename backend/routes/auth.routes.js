import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, authController.changePassword);

// Setup routes (should be protected in production with special admin key)
router.post('/setup/students', authController.bulkCreateStudents);
router.post('/setup/entities', authController.bulkCreateEntities);
router.post('/setup/treasury', authController.createTreasury);

export default router;
