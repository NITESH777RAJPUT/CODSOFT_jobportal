import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

import candidateAuthRoutes from "./routes/candidateAuthRoutes.js";
import employerAuthRoutes from "./routes/employerAuthRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // 🔹 add this line

import { errorHandler } from "./middlewares/errorMiddleware.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// connect DB
connectDB(process.env.MONGO_URI);

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes); // 🔹 add this line
app.use("/api/candidate", candidateAuthRoutes);
app.use("/api/employer", employerAuthRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users", userRoutes);

// error handler
app.use(errorHandler);

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
