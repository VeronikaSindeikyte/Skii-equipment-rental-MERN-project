import express from 'express'
import { getAllUsers, loginUser, signupUser } from '../controllers/userController.js'

const router = express.Router()

// login route
router.post('/login', loginUser)

// signup route
router.post('/signup', signupUser)

// GET - get all Users
router.get('/users', getAllUsers)


export default router