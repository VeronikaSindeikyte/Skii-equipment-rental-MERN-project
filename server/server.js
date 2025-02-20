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
    origin: [
      'https://skii-equipment-rental-project.vercel.app',
      'https://skii-equipment-rent.vercel.app',
      'https://skii-equipment-rental-pr-git-f13e68-veronikas-projects-81793833.vercel.app',
      'https://skii-equipment-rental-project-mfsbswxto.vercel.app',
      'http://localhost:4001'
    ],
    credentials: true
  }));

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    next();
});

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
    .catch((err) => console.log('MongoDB connection error:', err))
