import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate, requireAdminKey } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, authController.changePassword);

// Setup routes (protected with admin setup key)
router.post('/setup/students', requireAdminKey, authController.bulkCreateStudents);
router.post('/setup/entities', requireAdminKey, authController.bulkCreateEntities);
router.post('/setup/treasury', requireAdminKey, authController.createTreasury);

export default router;
