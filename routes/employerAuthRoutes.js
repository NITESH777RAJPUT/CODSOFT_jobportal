import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Employer from "../models/Employer.js";

const router = express.Router();

// Employer Register
router.post("/register", async (req, res) => {
    try {
        const { companyName, email, password, industry } = req.body;

        const existing = await Employer.findOne({ email });
        if (existing) return res.status(400).json({ message: "Employer already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const employer = new Employer({
            companyName,
            email,
            password: hashedPassword,
            industry
        });

        await employer.save();

        const token = jwt.sign({ id: employer._id, role: "employer" }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ token, user: employer });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Employer Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const employer = await Employer.findOne({ email });
        if (!employer) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, employer.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: employer._id, role: "employer" }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, user: employer });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
