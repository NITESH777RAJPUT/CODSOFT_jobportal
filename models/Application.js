import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    resumeUrl: {
        type: String
    },
    coverLetter: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["submitted", "shortlisted", "interview_scheduled", "hired", "rejected"],
        default: "submitted"
    },
    interviewDate: {
        type: Date
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model("Application", applicationSchema);
