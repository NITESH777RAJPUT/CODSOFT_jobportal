import express from "express";
import Job from "../models/Job.js";
import { protect, employerOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Get all jobs (for candidates)
router.get("/", async (req, res) => {
    try {
        const jobs = await Job.find().populate("employer", "name email companyName industry");
        res.json(jobs);
    } catch (err) {
        console.error("Error fetching jobs:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Get single job detail
router.get("/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate("employer", "name email companyName industry");
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job);
    } catch (err) {
        console.error("Error fetching job:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Employer: create job
router.post("/", protect, employerOnly, async (req, res) => {
    try {
        const { title, description, company, location, salary, type } = req.body;

        if (!title || !description || !company || !location) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const newJob = new Job({
            title,
            description,
            company,
            location,
            salary,
            type,
            employer: req.user._id,
        });

        await newJob.save();
        res.status(201).json(newJob);
    } catch (err) {
        console.error("Error creating job:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Employer: update job
router.put("/:id", protect, employerOnly, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        // ensure only job owner can edit
        if (job.employer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not allowed" });
        }

        const updates = req.body;
        Object.assign(job, updates);
        await job.save();

        res.json(job);
    } catch (err) {
        console.error("Error updating job:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Employer: delete job
router.delete("/:id", protect, employerOnly, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        // ensure only job owner can delete
        if (job.employer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not allowed" });
        }

        await job.deleteOne();
        res.json({ message: "Job deleted" });
    } catch (err) {
        console.error("Error deleting job:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
