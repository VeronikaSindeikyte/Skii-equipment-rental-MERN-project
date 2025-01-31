import { deleteReservation, getAllReservations, updateReservation,getUserReservations, deleteUserReservation, updateReservationStatus } from '../controllers/controller.js';
import express from 'express';
import { reserveIranga } from '../controllers/controller.js';  
import requireAuth from '../middleware/requireAuth.js'

const router = express.Router();
router.use(requireAuth)

// POST - rezervuoti iranga
router.post('/reserve', reserveIranga);

// GET - paimti visas rezervacijas
router.get('/reservations', getAllReservations);

// GET - paimti vieno userio rezervacijas per admin paskyra
router.get('/reservations/:id', getUserReservations)

// DELETE - istrinti viena rezervacija is user puses
router.delete('/reservations/:id', deleteReservation)

// DELETE - istrinti viena rezervacija is admin puses
router.delete('/delete/reservations/:id', deleteUserReservation)

// PATCH - pakeisti rezervacijos statusa (admin)
router.patch('/update/reservations/:id', updateReservationStatus)

// PATCH - atnaujinti vienos rezervacijos laika
router.patch('/reservations/:id', updateReservation);


export default router;