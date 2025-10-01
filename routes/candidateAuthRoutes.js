import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Candidate from "../models/Candidate.js";

const router = express.Router();

// Candidate Register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, skills, resume } = req.body;

        const existing = await Candidate.findOne({ email });
        if (existing) return res.status(400).json({ message: "Candidate already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const candidate = new Candidate({
            name,
            email,
            password: hashedPassword,
            skills,
            resume
        });

        await candidate.save();

        const token = jwt.sign({ id: candidate._id, role: "candidate" }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ token, user: candidate });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Candidate Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const candidate = await Candidate.findOne({ email });
        if (!candidate) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, candidate.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: candidate._id, role: "candidate" }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, user: candidate });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
