import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect } from "../middlewares/authMiddleware.js"; // ✅ add this middleware

const router = express.Router();

// ✅ Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio,
                skills: user.skills,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Candidate Profile Update
router.put("/profile", protect, async (req, res) => {
    try {
        const { name, bio, skills } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role !== "candidate") {
            return res.status(403).json({ message: "Only candidates can update profile" });
        }

        user.name = name || user.name;
        user.bio = bio || user.bio;
        user.skills = skills || user.skills;

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio,
            skills: user.skills,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
