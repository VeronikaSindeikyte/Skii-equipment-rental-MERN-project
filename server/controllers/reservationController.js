import Iranga from "../models/irangosModelis.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";

// ---------- USER RESERVATION ROUTES ---------- 

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


// GET - paimti vieną rezervaciją (user)
export const getReservationById = async (req, res) => {
    const { reservationId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    try {
        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({ error: "Invalid reservation ID format" });
        }

        const item = await Iranga.findOne({ "reservations._id": reservationId });

        if (!item) {
            return res.status(404).json({ error: "Reservation not found in Iranga collection" });
        }

        const reservation = item.reservations.find(res => res._id.toString() === reservationId);

        if (!reservation) {
            return res.status(404).json({ error: "Reservation not found in item" });
        }

        if (!isAdmin && reservation.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Unauthorized to access this reservation" });
        }

        const reservationWithItem = {
            ...reservation.toObject(),
            item: {
                _id: item._id,
                title: item.title,
                description: item.description,
                photos: item.photos,
            }
        };

        return res.status(200).json({
            reservation: reservationWithItem
        });

    } catch (error) {
        console.error("Error in getReservationById:", error);
        return res.status(500).json({ error: "An error occurred while fetching the reservation" });
    }
};

// DELETE - ištrinti vieną rezervaciją (user)
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

// PATCH - atnaujinti rezervacijos laika (user)
export const updateReservation = async (req, res) => {
    const { reservationId } = req.params;
    const { rentalPeriod } = req.body;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin'; 

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

        if (!isAdmin && reservation.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Unauthorized to update this reservation" });
        }

        reservation.rentalPeriod = rentalPeriod;
        await item.save();

        const user = await User.findOneAndUpdate(
            { _id: reservation.user, "reservations.reservationId": reservationId },
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

// ---------- ADMIN RESERVATION ROUTES ----------

// GET - paimti iranga pagal rezervacijos ID (admin)
export const getItemByReservationId = async (req, res) => {
    const { reservationId } = req.params;

    try {
        const item = await Iranga.findOne({ "reservations._id": reservationId });
        
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }

        return res.status(200).json(item);
    } catch (error) {
        console.error("Error in getItemByReservationId:", error);
        return res.status(500).json({ error: "Failed to fetch item details" });
    }
};

// GET - paimti vieno userio rezervacijas (admin)
export const getUserReservations = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).select("-password").populate({
            path: "reservations.item",
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

// PATCH - atnaujinti rezervacijos statusą (admin)
export const updateReservationStatus = async (req, res) => {
    const { id } = req.params;
    const { reservationStatus } = req.body;

    try {
        const item = await Iranga.findOne({ "reservations._id": new mongoose.Types.ObjectId(id) });
        if (!item) return res.status(404).json({ error: "Reservation not found in Iranga model" });

        const reservation = item.reservations.find(res => res._id.toString() === id);
        if (!reservation) return res.status(404).json({ error: "Reservation not found in item" });

        reservation.reservationStatus = reservationStatus;
        await item.save();

        const user = await User.findOne({ "reservations.reservationId": new mongoose.Types.ObjectId(id) });
        if (!user) return res.status(404).json({ error: "Reservation not found in User model" });

        const userReservation = user.reservations.find(res => res.reservationId.toString() === id);
        if (!userReservation) return res.status(404).json({ error: "Reservation not found in user" });

        userReservation.reservationStatus = reservationStatus;
        await user.save();

        res.status(200).json({ message: "Reservation status updated in both models", reservation });
    } catch (error) {
        console.error("Error in updateReservationStatus:", error);
        res.status(500).json({ error: "An error occurred while updating the reservation status" });
    }
};

// DELETE - ištrinti vartotojo rezervaciją (admin)
export const deleteUserReservation = async (req, res) => {
    try {
        const { itemId, reservationId } = req.query;

        if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({ error: "Invalid item ID or reservation ID" });
        }

        const userUpdateResult = await User.updateOne(
            { "reservations.reservationId": new mongoose.Types.ObjectId(reservationId) },
            { 
                $pull: { 
                    reservations: { 
                        reservationId: new mongoose.Types.ObjectId(reservationId)
                    } 
                } 
            }
        );

        const irangaUpdateResult = await Iranga.updateOne(
            { _id: new mongoose.Types.ObjectId(itemId) },
            { 
                $pull: { 
                    reservations: { 
                        _id: new mongoose.Types.ObjectId(reservationId)
                    } 
                } 
            }
        );

        if (userUpdateResult.modifiedCount === 0 && irangaUpdateResult.modifiedCount === 0) {
            return res.status(404).json({ error: "Reservation not found" });
        }

        res.status(200).json({ message: "Reservation deleted successfully" });
    } catch (error) {
        console.error("Error deleting reservation:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
