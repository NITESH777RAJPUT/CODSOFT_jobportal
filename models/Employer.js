import mongoose from "mongoose";

const employerSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    industry: String,
    jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }]
}, { timestamps: true });

export default mongoose.model("Employer", employerSchema);
