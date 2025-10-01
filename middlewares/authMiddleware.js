import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.cookies?.token;
        let token = null;

        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) return res.status(401).json({ message: "Not authorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded._id).select("-password");
        if (!user) return res.status(401).json({ message: "User not found" });

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth error:", err.message);
        res.status(401).json({ message: "Token invalid or expired" });
    }
};

export const employerOnly = (req, res, next) => {
    if (req.user?.role !== "employer") {
        return res.status(403).json({ message: "Employer access only" });
    }
    next();
};

export const candidateOnly = (req, res, next) => {
    if (req.user?.role !== "candidate") {
        return res.status(403).json({ message: "Candidate access only" });
    }
    next();
};
