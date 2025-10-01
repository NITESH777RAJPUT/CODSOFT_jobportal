import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["candidate", "employer"], default: "candidate" },

    // Candidate fields
    skills: [String],
    bio: String,
    resumeUrl: String,

    // Employer fields
    companyName: String,
    industry: String,

    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
