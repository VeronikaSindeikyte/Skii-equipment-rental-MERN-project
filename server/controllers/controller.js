import Iranga from "../models/irangosModelis.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";

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
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Tokios įrangos nėra.' });
    }
    const iranga = await Iranga.findById(id);
    if (!iranga) {
        return res.status(404).json({ error: 'Tokios įrangos nėra.' });
    }
    res.status(200).json(iranga);
};

// PATCH - rezervuoti irangą
export const reserveIranga = async (req, res) => {
    const { itemId, rentalPeriod } = req.body;
    const userId = req.user._id;
    const reservationId = new mongoose.Types.ObjectId();


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
            reservationId,
            item: itemId,
            rentalPeriod,
            reservationStatus: 'Laukia patvirtinimo'
        };

        item.reservations.push({
            _id: reservationId,
            user: userId,
            rentalPeriod,
            reservationStatus: 'Laukia patvirtinimo'
        });

        user.reservations.push(newReservation);

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

// GET - paimti visas rezervacijas (user)
export const getAllReservations = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate({
            path: "reservations.item",
            model: "Iranga"
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            name: user.email,
            role: user.role,
            reservations: user.reservations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch reservations" });
    }
};

export const getReservationById = async (req, res) => {
    try {
        const userId = req.user._id;
        const reservationId = req.params.reservationId;
        
        console.log(`Fetching reservation ${reservationId} for user ${userId}`);

        const user = await User.findById(userId).populate({
            path: "reservations.item",
            model: "Iranga"
        });

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ error: "User not found" });
        }

        const reservation = user.reservations.find(
            (res) => res.reservationId.toString() === reservationId
        )

        if (!reservation) {
            console.log("Reservation not found for this user");
            return res.status(404).json({ error: "Reservation not found" });
        }

        console.log("Reservation found:", reservation);

        res.json({
            name: user.email,
            role: user.role,
            reservation
        });
    } catch (error) {
        console.error("Error fetching reservation:", error);
        res.status(500).json({ error: "Failed to fetch reservation" });
    }
};

// GET - paimti vieno userio rezervacijas (admin)
export const getUserReservations = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).select("-password").populate({
            path: "rentedItems.item",
            model: "Iranga",
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userData = await Iranga.find({ userId: id });

        res.status(200).json({ user, userData });
    } catch (error) {
        console.error("Error fetching user reservations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// DELETE - ištrinti vieną rezervaciją iš User pusės
export const deleteReservation = async (req, res) => {
    const userId = req.user._id;
    const { reservationId } = req.query;

    console.log("Received request to delete reservation:", reservationId);

    try {
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({ error: "Invalid userId or reservationId format" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userReservationIndex = user.reservations.findIndex(
            (res) => res.reservationId.toString() === reservationId
        );

        if (userReservationIndex === -1) {
            return res.status(404).json({ error: "Reservation not found in user data" });
        }

        const itemId = user.reservations[userReservationIndex].item;
        user.reservations.splice(userReservationIndex, 1);
        await user.save();

        const item = await Iranga.findById(itemId);
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }

        const itemReservationIndex = item.reservations.findIndex(
            (res) => res._id.toString() === reservationId
        );

        if (itemReservationIndex === -1) {
            return res.status(404).json({ error: "Reservation not found in item reservations" });
        }

        item.reservations.splice(itemReservationIndex, 1);
        await item.save();

        return res.status(200).json({
            message: "Reservation successfully deleted from user and item",
        });

    } catch (error) {
        console.error("Error in deleteReservation:", error);
        return res.status(500).json({ error: "An error occurred while deleting the reservation" });
    }
};



// PATCH - atnaujinti rezervacijos laika
export const updateReservation = async (req, res) => {
    const { reservationId } = req.params;
    const { rentalPeriod } = req.body;
    const userId = req.user._id;

    try {
        console.log("Updating reservation:", reservationId, "for user:", userId, "with new dates:", rentalPeriod);

        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({ error: "Invalid reservation ID format" });
        }

        const item = await Iranga.findOne({ "reservations._id": reservationId });

        if (!item) {
            return res.status(404).json({ error: "Reservation not found in Iranga collection" });
        }

        const reservation = item.reservations.find(res => res._id.toString() === reservationId);
        console.log("Reservation:", reservation)

        if (!reservation) {
            return res.status(404).json({ error: "Reservation not found in item" });
        }

        if (reservation.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Unauthorized to update this reservation" });
        }

        reservation.rentalPeriod = rentalPeriod;
        await item.save();

        const user = await User.findOneAndUpdate(
            { _id: userId, "reservations.reservationId": reservationId },
            { $set: { "reservations.$.rentalPeriod": rentalPeriod } }, 
            { new: true } 
          );

        console.log("useris:", user)

        if (!user) {
            return res.status(404).json({ error: "User not found or reservation does not exist in user data" });
        }

        return res.status(200).json({
            message: "Reservation successfully updated",
            updatedReservation: reservation
        });

    } catch (error) {
        console.error("Error in updateReservation:", error);
        return res.status(500).json({ error: "An error occurred while updating the reservation" });
    }
};


// DELETE - ištrinti vartotojo rezervaciją iš admin pusės
export const deleteUserReservation = async (req, res) => {
    const { id: reservationId } = req.params;

    try {
        // Find the item containing the specific reservation
        const item = await Iranga.findOne({ "reservations._id": reservationId });

        if (!item) {
            return res.status(404).json({ error: "Reservation not found in any item" });
        }

        // Remove only the specific reservation from the item's reservations array
        item.reservations = item.reservations.filter(res => res._id.toString() !== reservationId);
        await item.save();

        // Remove only this specific rented item from the user's rentedItems
        const result = await User.updateOne(
            { "_id": item.user_id },
            {
                $pull: {
                    rentedItems: {
                        "item": item._id,
                        "reservation": reservationId
                    }
                }
            }
        );

        return res.status(200).json({
            message: "Reservation successfully deleted"
        });

    } catch (error) {
        console.error("Error in deleteUserReservation:", error);
        return res.status(500).json({ error: "An error occurred while deleting the reservation" });
    }
};


// PATCH - atnaujinti rezervacijos statusą
export const updateReservationStatus = async (req, res) => {
    const { id } = req.params;
    const { reservationStatus } = req.body;

    try {
        const item = await Iranga.findOne({ "reservations._id": new mongoose.Types.ObjectId(id) });
        if (!item) return res.status(404).json({ error: "Reservation not found" });

        const reservation = item.reservations.find(
            (res) => res._id.toString() === id
        );
        if (!reservation) return res.status(404).json({ error: "Reservation not found in item" });

        reservation.reservationStatus = reservationStatus;
        await item.save();

        res.status(200).json({ message: "Reservation status updated", reservation });
    } catch (error) {
        console.error("Error in updateReservationStatus:", error);
        res.status(500).json({ error: "An error occurred while updating the reservation status" });
    }
};

// POST - sukurti naują įrangą
export const createEquipment = async (req, res) => {
    const { photos, title, description, rentPricePerDay, gender, size, condition, available } = req.body;

    let emptyFields = [];

    if (!title) { emptyFields.push('title'); }
    if (!description) { emptyFields.push('description'); }
    if (!rentPricePerDay) { emptyFields.push('rentPricePerDay'); }
    if (!gender) { emptyFields.push('gender'); }
    if (!size) { emptyFields.push('size'); }
    if (!condition) { emptyFields.push('condition'); }
    if (!available) { emptyFields.push('available'); }
    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Prašome užpildyti visus laukelius', emptyFields });
    }

    try {
        const user_id = req.user._id;
        const iranga = await Iranga.create({ photos, title, description, rentPricePerDay, gender, size, condition, available, user_id });
        res.status(200).json(iranga);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// PATCH - redaguoti vieną įrangą
export const updateEquipment = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Tokios įrangos nėra." });
    }
    const iranga = await Iranga.findOneAndUpdate({ _id: id }, { ...req.body });
    if (!iranga) {
        return res.status(404).json({ error: 'Tokios įrangos nėra.' });
    }
    res.status(200).json(iranga);
};

// DELETE - ištrinti vieną įrangą
export const deleteEquipment = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Tokios įrangos nėra." });
    }
    const iranga = await Iranga.findOneAndDelete({ _id: id });
    if (!iranga) {
        return res.status(404).json({ error: 'Tokios įrangos nėra.' });
    }
    res.status(200).json(iranga);
};