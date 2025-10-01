// ...existing code...
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { sendEmail } from "../utils/sendEmail.js";

export const applyJob = async (req, res) => {
    try {
        const { coverLetter } = req.body;
        const jobId = req.params.jobId;
        const resumeUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const appDoc = await Application.create({
            job: jobId, candidate: req.user._id, coverLetter, resumeUrl
        });

        // optionally notify employer via email (if set)
        const job = await Job.findById(jobId).populate("employer");
        if (job?.employer?.email) {
            await sendEmail({
                to: job.employer.email,
                subject: `New application for ${job.title}`,
                text: `Someone applied for ${job.title}.`
            });
        }

        res.status(201).json(appDoc);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getApplicationsForJob = async (req, res) => {
    try {
        const apps = await Application.find({ job: req.params.jobId }).populate("candidate", "name email");
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
