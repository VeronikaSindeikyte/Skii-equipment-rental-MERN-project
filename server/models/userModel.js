import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import validator from 'validator'

const Schema = mongoose.Schema
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    reservations: [{
        item: {
            type: Schema.Types.ObjectId,
            ref: 'Iranga'
        },
        reservationId: {
            type: Schema.Types.ObjectId,
            ref: 'Iranga.reservations', 
        },
        rentalPeriod: { 
            from: { type: Date, default: null }, 
            to: { type: Date, default: null } 
        },
        reservationStatus: {
            type: String,
            enum: ['Patvirtinta', 'Laukia patvirtinimo', 'Nerezervuota', 'Atmesta'],
            default: 'Laukia patvirtinimo'
        }
    }]
});


userSchema.statics.signup = async function (email, password, role = 'user') {
    // Validation
    if (!email || !password || !role) {
        throw Error('Visi laukeliai privalomi.');
    }
    if (!validator.isEmail(email)) {
        throw Error('El. paštas nėra tinkamas.');
    }
    if (!validator.isStrongPassword(password)) {
        throw Error('Slaptažodis pernelyg silpnas.');
    }
    if (!['user', 'admin'].includes(role)) {
        throw Error('Rolė netinkama.');
    }

    const exists = await this.findOne({ email });
    if (exists) {
        throw Error('El. paštas jau naudojamas.');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await this.create({ email, password: hash, role });

    return user;
};

// statiskas login metodas
userSchema.statics.login = async function(email, password) {
    if(!email || !password) {
        throw Error('Visi laukeliai yra privalomi.')
    }
    const user = await this.findOne({email})
    if(!user) {
        throw Error('El. paštas yra neteisingas.')
    }
    const match = await bcrypt.compare(password, user.password)
    if(!match) {
        throw Error('Neteisingai įvestas slaptažodis.')
    }
    return user
}

export default mongoose.model('User', userSchema)