import express from 'express'
import * as controller from "../controllers/controller.js"
import requireAuth from '../middleware/requireAuth.js'
import { reserveIranga } from '../controllers/controller.js'

const router = express.Router()

// GET - paimti visą įrangą (no authentication required)
router.get('/', controller.getAllEquipment)

// GET - paimti vieną įrangą
router.get('/:id', controller.getOneEquiptment)

router.use(requireAuth)

// POST - rezervuoti įrangą
router.post('/reserve', reserveIranga);

// POST - sukurti naują įrangą
router.post('/', controller.createEquipment)


// PATCH - redaguoti vieną įrangą
router.patch('/:id', controller.updateEquipment)

// DELETE - ištrinti vieną įrangą
router.delete('/:id', controller.deleteEquipment)

export default router