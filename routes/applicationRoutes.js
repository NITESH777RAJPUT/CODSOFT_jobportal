import express from "express";
import multer from "multer";
import { protect, candidateOnly, employerOnly } from "../middlewares/authMiddleware.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";

const router = express.Router();

// Multer setup for resume uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// ✅ Candidate applies to a job
router.post("/apply/:jobId", protect, candidateOnly, upload.single("resume"), async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await Job.findById(jobId).populate("employer", "email name");
        if (!job) return res.status(404).json({ message: "Job not found" });

        // prevent duplicate apply
        const already = await Application.findOne({ job: jobId, candidate: req.user._id });
        if (already) return res.status(400).json({ message: "Already applied to this job" });

        const resumeUrl = req.file ? `/uploads/${req.file.filename}` : req.body.resumePath || null;

        const app = new Application({
            job: jobId,
            candidate: req.user._id,
            coverLetter: req.body.coverLetter || "",
            resumeUrl,
            status: "submitted",
        });

        await app.save();
        res.status(201).json(app);
    } catch (err) {
        console.error("Apply error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Employer: get all applications for their jobs
router.get("/", protect, employerOnly, async (req, res) => {
    try {
        const jobs = await Job.find({ employer: req.user._id }).select("_id");
        const jobIds = jobs.map((j) => j._id);

        const apps = await Application.find({ job: { $in: jobIds } })
            .populate("job", "title")
            .populate("candidate", "name email skills resumeUrl");

        res.json(apps);
    } catch (err) {
        console.error("Get employer applications error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Candidate: get my applications
router.get("/me", protect, candidateOnly, async (req, res) => {
    try {
        const apps = await Application.find({ candidate: req.user._id })
            .populate("job", "title company location")
            .sort({ appliedAt: -1 });
        res.json(apps);
    } catch (err) {
        console.error("Get my applications error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Employer: update application status
router.put("/:id", protect, employerOnly, async (req, res) => {
    try {
        const app = await Application.findById(req.params.id).populate("job");
        if (!app) return res.status(404).json({ message: "Application not found" });

        if (app.job.employer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not allowed" });
        }

        app.status = req.body.status || app.status;
        await app.save();

        res.json(app);
    } catch (err) {
        console.error("Update status error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Employer: schedule interview
router.put("/:id/interview", protect, employerOnly, async (req, res) => {
    try {
        const { interviewDate } = req.body;
        const app = await Application.findById(req.params.id).populate("job");
        if (!app) return res.status(404).json({ message: "Application not found" });

        if (app.job.employer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not allowed" });
        }

        app.status = "interview_scheduled";
        app.interviewDate = interviewDate;
        await app.save();

        res.json(app);
    } catch (err) {
        console.error("Interview schedule error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
