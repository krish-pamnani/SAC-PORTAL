import express from 'express';
import * as treasuryController from '../controllers/treasury.controller.js';
import { authenticate, isTreasury } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require treasury authentication
router.use(authenticate, isTreasury);

// Events and bank details
router.get('/events', treasuryController.getAllEvents);
router.get('/pending', treasuryController.getPendingBankDetails);
router.get('/statistics', treasuryController.getStatistics);

// Actions
router.post('/send-reminders', treasuryController.sendReminders);
router.get('/download-data', treasuryController.downloadTreasuryData);
router.post('/mark-paid/:bankDetailsId', treasuryController.markPaymentCompleted);

export default router;
