import express from 'express';
import * as studentController from '../controllers/student.controller.js';
import { authenticate, isStudent } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require student authentication
router.use(authenticate, isStudent);

// Student events
router.get('/events', studentController.getStudentEvents);
router.get('/prize-history', studentController.getPrizeHistory);

// Bank profile (saved)
router.get('/bank-profile', studentController.getBankProfile);
router.post('/bank-profile', studentController.saveBankProfile);
router.delete('/bank-profile', studentController.deleteBankProfile);

// Bank details submission
router.post('/bank-details', studentController.submitBankDetails);
router.get('/bank-details/:teamId', studentController.viewBankDetails);

export default router;
