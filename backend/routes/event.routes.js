import express from 'express';
import * as eventController from '../controllers/event.controller.js';
import { authenticate, isEntity } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Entity-only routes
router.post('/', isEntity, eventController.createEvent);
router.get('/my-events', isEntity, eventController.getEntityEvents);

// Get event details (accessible by entity, students, treasury)
router.get('/:eventId', eventController.getEventDetails);

export default router;
