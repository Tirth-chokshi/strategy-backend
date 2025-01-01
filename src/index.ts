import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose'
import userRoutes from './routes/userRoutes'
import strategyRoutes from './routes/strategyRoutes'

dotenv.config();

const app: Express = express();
const port = 8000

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,               
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', userRoutes);
app.use('/strategies', strategyRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    app.listen(port, () => console.log(`DB connected and Server Port: ${port}`));
  })
  .catch((error) => console.log(`${error} did not connect`));