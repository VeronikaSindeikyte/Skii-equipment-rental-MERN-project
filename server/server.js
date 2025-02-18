import express from 'express'
import dotenv from 'dotenv'
import irangaRoutes from './routes/iranga.js'
import mongoose from 'mongoose'
import userRoutes from './routes/user.js'
import reservationRoutes from './routes/reservation.js'
import cors from 'cors'
dotenv.config()

// create express app
const app = express()


// middleware (viskas kas vyksta serverio puseje. Seka cia yra svarbi, todel naudojame next() funkciją, kuri nurodo, kad middleware vykdytų toliau esamas funkcijas)
app.use(cors({
    origin: ['https://skii-equipment-rental-project-4kekl17qb.vercel.app', 'http://localhost:4001'],
    credentials: true
  }));

const PORT = process.env.PORT || 4001;

app.use(express.json())
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// routes
app.use('/api/iranga', irangaRoutes)
app.use('/api/user', userRoutes)
app.use('/api/reservations', reservationRoutes)




// connect to DB
mongoose.connect(process.env.URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => console.log(err))
