import Iranga from "../models/irangosModelis.js"
import mongoose from "mongoose"

// GET - paimti visas irangas
export const getAllEquipment = async (req, res) => {
    const user_id = req.user._id
    const irangos = await Iranga.find({user_id}).sort({createdAt: -1})
    res.status(200).json(irangos)
}

// GET - paimti vieną įrangą
export const getOneEquiptment = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Tokios įrangos nėra.'})
    }
    const iranga = await Iranga.findById(id)
    if(!iranga) {
        return res.status(404).json({error: 'Tokios įrangos nėra.'})
    }
    res.status(200).json(iranga)
}

// POST - sukurti naują įrangą
export const createEquipment = async (req, res) => {
    const { title, description, rentPricePerDay, gender, size, condition, available } = req.body

    let emptyFields = []

    if(!title) {emptyFields.push('title')}
    if(!description) {emptyFields.push('description')}
    if(!rentPricePerDay) {emptyFields.push('rentPricePerDay')}
    if(!gender) {emptyFields.push('gender')}
    if(!size) {emptyFields.push('size')}
    if(!condition) {emptyFields.push('condition')}
    if(!available) {emptyFields.push('available')}
    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Prašome užpildyti visus laukelius', emptyFields })
    }

    try {
        const user_id = req.user._id
        const iranga = await Iranga.create({title, description, rentPricePerDay, gender, size, condition, available, user_id})
        res.status(200).json(iranga)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// PATCH - redaguoti vieną įrangą
export const updateEquipment = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: "Tokios įrangos nėra."})
    }
    const iranga = await Iranga.findOneAndUpdate({_id: id}, {...req.body})
    if(!iranga) {
        return res.status(404).json({error: 'Tokios įrangos nėra.'})
    }
    res.status(200).json(iranga)
}

// DELETE - ištrinti vieną įrangą
export const deleteEquipment = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: "Tokios įrangos nėra."})
    }
    const iranga = await Iranga.findOneAndDelete({_id: id})
    if(!iranga) {
        return res.status(404).json({error: 'Tokios įrangos nėra.'})
    }
    res.status(200).json(iranga)
}