import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Function to create a JWT token
const createToken = (_id, role) => {
    return jwt.sign({ _id, role }, process.env.SECRET, { expiresIn: '3d' });
};

// Login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);

        // Generate a token that includes the user's role
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

        // Generate a token that includes the user's role
        const token = createToken(user._id, user.role);

        res.status(200).json({ email: user.email, role: user.role, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
