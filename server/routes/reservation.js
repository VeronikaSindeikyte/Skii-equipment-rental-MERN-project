import * as controller from '../controllers/reservationController.js';
import express from 'express';
import requireAuth from '../middleware/requireAuth.js'

const router = express.Router();
router.use(requireAuth)



// ------- USER RESERVATION ROUTES ------- 

// GET - paimti visas rezervacijas (user)
router.get('/user', controller.getAllReservations);

// GET - paimti vieną userio rezervaciją (user)
router.get('/user/:reservationId', controller.getReservationById);

// DELETE - istrinti viena rezervacija (user)
router.delete('/user/delete', controller.deleteReservation)

// PATCH - atnaujinti vienos rezervacijos laika (user)
router.patch('/update/:reservationId', controller.updateReservation);


// ------- ADMIN RESERVATION ROUTES ------- 

// GET - paimti viena iranga pagal rezervacijos ID (admin)
router.get('/reservation/:reservationId', controller.getItemByReservationId);

// GET - paimti vieno userio rezervacijas (admin)
router.get('/admin/:id', controller.getUserReservations)

// PATCH - pakeisti rezervacijos statusa (admin)
router.patch('/admin/updateStatus/:id', controller.updateReservationStatus)

// DELETE - istrinti viena rezervacija (admin)
router.delete('/admin/delete', controller.deleteUserReservation)


export default router;