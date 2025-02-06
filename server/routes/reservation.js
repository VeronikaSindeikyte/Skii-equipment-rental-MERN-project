import { deleteReservation, getAllReservations, updateReservation,getUserReservations, deleteUserReservation, updateReservationStatus } from '../controllers/controller.js';
import express from 'express';
import { reserveIranga } from '../controllers/controller.js';  
import requireAuth from '../middleware/requireAuth.js'

const router = express.Router();
router.use(requireAuth)

// ------- USER/ADMIN ------- 

// POST - rezervuoti iranga
router.post('/reserve', reserveIranga);

// PATCH - atnaujinti vienos rezervacijos laika
router.patch('/updateTime', updateReservation);


// ------- USER Routes ------- 

// GET - paimti visas rezervacijas
router.get('/user', getAllReservations);

// DELETE - istrinti viena rezervacija is user puses
router.delete('/user/delete', deleteReservation)


// ------- ADMIN Routes ------- 

// GET - paimti vieno userio rezervacijas per admin paskyra
router.get('/admin/:id', getUserReservations)

// DELETE - istrinti viena rezervacija is admin puses
router.delete('/admin/delete/:id', deleteUserReservation)

// PATCH - pakeisti rezervacijos statusa (admin)
router.patch('/admin/updateStatus/:id', updateReservationStatus)




export default router;