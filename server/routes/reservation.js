import { getAllReservations } from '../controllers/controller.js';
import express from 'express';
import { reserveIranga } from '../controllers/controller.js';  
import requireAuth from '../middleware/requireAuth.js'

const router = express.Router();
router.use(requireAuth)

// POST - rezervuoti iranga
router.post('/reserve', reserveIranga);

// GET - paimti visa iranga
router.get('/reservations', getAllReservations);


export default router;