import Iranga from "../models/irangosModelis.js"
import mongoose from "mongoose"
import User from "../models/userModel.js"

// GET - paimti visas irangas
export const getAllEquipment = async (req, res) => {
    try {
        const iranga = await Iranga.find({});
        res.status(200).json(iranga);
    } catch (error) {
        res.status(500).json({ error: 'Nepavyko gauti įrangos duomenų.' });
    }
};

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

// PATCH - rezervuoti irangą
export const reserveIranga = async (req, res) => {
    const { itemId, rentalPeriod } = req.body;
    const userId = req.user._id;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ error: 'Invalid userId or itemId format' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const item = await Iranga.findById(itemId);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        item.reservations = item.reservations ?? [];

        const isOverlapping = item.reservations.some(reservation => {
            const existingStart = new Date(reservation.rentalPeriod.from);
            const existingEnd = new Date(reservation.rentalPeriod.to);
            const newStart = new Date(rentalPeriod.from);
            const newEnd = new Date(rentalPeriod.to);

            return (
                (newStart >= existingStart && newStart <= existingEnd) ||
                (newEnd >= existingStart && newEnd <= existingEnd) ||
                (newStart <= existingStart && newEnd >= existingEnd)
            );
        });

        if (isOverlapping) {
            return res.status(400).json({ error: 'Pasirinktas laikas jau rezervuotas' });
        }

        const newReservation = {
            user: userId,
            rentalPeriod,
            reservationStatus: 'Laukia patvirtinimo'
        };

        item.reservations.push(newReservation);

        user.rentedItems.push({
            item: itemId,
            rentalPeriod,
            reservationStatus: 'Laukia patvirtinimo' 
        });

        await Promise.all([item.save(), user.save()]);

        return res.status(200).json({
            message: 'Item successfully reserved',
            reservation: newReservation
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while reserving the item' });
    }
};

    // Fetch user reservations
    export const getAllReservations = async (req, res) => {
        try {
            const userId = req.user._id; // Ensure authentication middleware sets req.user
            const user = await User.findById(userId).populate({
                path: "rentedItems.item",
                model: "Iranga" // Ensure this matches your mongoose model name
            });

            if (!user) return res.status(404).json({ error: "User not found" });

            res.json({
                name: user.email, 
                role: user.role,
                rentedItems: user.rentedItems
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch reservations" });
        }
    };


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