import mongoose from 'mongoose'

const Schema = mongoose.Schema
const irangosSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: '', 
    },
    rentPricePerDay: {
        type: Number,
        default: null,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'unisex'],
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    condition: {
        type: String,
        enum: ['new', 'used', 'refurbished'],
        required: true,
    },
    available: {
        type: Boolean,
        default: true,
    },
    user_id: {
        type: String,
        required: true
    }
}, {timestamps: true})

export default mongoose.model('Iranga', irangosSchema)