import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const createToken = (_id, role) => {
    return jwt.sign({ _id, role }, process.env.SECRET, { expiresIn: '3d' });
};

// Login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id, user.role);
        res.status(200).json({ email: user.email, role: user.role, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Signup user
export const signupUser = async (req, res) => {
    const { email, password, role = 'user' } = req.body;

    try {
        const user = await User.signup(email, password, role);
        const token = createToken(user._id, user.role);
        res.status(200).json({ email: user.email, role: user.role, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Gauti visus userius
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).populate({
            path: 'rentedItems.item',
            populate: {
                path: 'reservations'
            }
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}

// Gauti prisijungusio userio rezervacijas
export const getUserReservations = async (req, res) => {
    try {
      const userId = req.user._id; 
      const user = await User.findById(userId).populate('rentedItems.item');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(user.rentedItems); 
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch user reservations' });
    }
};

// Ištrinti userį
export const deleteUser = async (req, res) => {
    const { id } = req.params; 
    console.log("Received DELETE request for user ID:", id);

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            console.log("User not found in database.");
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
};

// Pakeisti userio rolę
export const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User role updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
};