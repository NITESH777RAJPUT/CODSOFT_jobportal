import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// Generate JWT
const genToken = (user) =>
    jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

// ✅ Register
router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            companyName,
            industry,
            skills,
            bio,
        } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // 👇 Custom messages based on role
            if (existingUser.role === "candidate" && role === "employer") {
                return res.status(400).json({
                    message:
                        "This email is already registered as a Candidate. Please use a different email for Employer registration.",
                });
            }
            if (existingUser.role === "employer" && role === "candidate") {
                return res.status(400).json({
                    message:
                        "This email is already registered as an Employer. Please use a different email for Candidate registration.",
                });
            }

            // Same role trying to register again
            return res
                .status(400)
                .json({ message: "User already exists with this email." });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashed,
            role: role || "candidate",
            companyName: role === "employer" ? companyName : undefined,
            industry: role === "employer" ? industry : undefined,
            skills: role === "candidate" ? skills : [],
            bio: role === "candidate" ? bio : "",
        });

        await user.save();

        const token = genToken(user);

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyName: user.companyName,
                industry: user.industry,
                skills: user.skills,
                bio: user.bio,
            },
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = genToken(user);

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyName: user.companyName,
                industry: user.industry,
                skills: user.skills,
                bio: user.bio,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
