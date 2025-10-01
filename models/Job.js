import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    salary: {
        type: String
    },
    type: {
        type: String,
        enum: ["full-time", "part-time", "internship", "contract"],
        default: "full-time"
    },
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }, // ✅ Job posted by Employer
    createdAt: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model("Job", jobSchema);
