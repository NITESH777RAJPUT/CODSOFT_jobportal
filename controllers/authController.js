import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "User already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed, role });
        const token = generateToken({ id: user._id, role: user.role });
        res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken({ id: user._id, role: user.role });
        res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
