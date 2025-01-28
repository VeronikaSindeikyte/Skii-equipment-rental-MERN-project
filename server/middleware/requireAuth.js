import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const requireAuth = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ error: 'Autorizavimo token yra privalomas.' });
    }

    const token = authorization.split(' ')[1];

    try {
        const { _id } = jwt.verify(token, process.env.SECRET);

        const user = await User.findOne({ _id }).select('_id role');
        if (!user) {
            return res.status(401).json({ error: 'Invalid token.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log('Authentication error:', error);
        res.status(401).json({ error: 'Uzklausa nepatvirtinta.' });
    }
};

export default requireAuth;