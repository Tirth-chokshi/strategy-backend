import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";
import strategyRoutes from "./routes/strategyRoutes";
import optionRoutes from './routes/optionRoutes'
import { importOptionsFromCSV } from "./utils/csvImporter";
import path from "path";

dotenv.config();

const app: Express = express();
const port = 8000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL as string, "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/users", userRoutes);
app.use("/strategies", strategyRoutes);
app.use('/options', optionRoutes)

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("Connected to MongoDB");
    // Import options data on startup
    // const csvPath = path.join(__dirname, '..', 'options.csv');
    // importOptionsFromCSV(csvPath)
    //     .then(() => console.log('Options data imported successfully'))
    //     .catch(err => console.error('Error importing options:', err));
  })
  .catch((error) => console.error("MongoDB connection error:", error));
