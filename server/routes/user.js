import express from 'express'
import { getAllUsers, loginUser, signupUser, deleteUser, updateUserRole } from '../controllers/userController.js'

const router = express.Router()

// login route
router.post('/login', loginUser)

// signup route
router.post('/signup', signupUser)

// GET - get all Users
router.get('/users', getAllUsers)

// DELETE - delete one user
router.delete('/:id', deleteUser)

// PATCH - update user role
router.patch('/:id', updateUserRole)


export default router