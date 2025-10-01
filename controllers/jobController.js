// ...existing code...
import Job from "../models/Job.js";

export const createJob = async (req, res) => {
    try {
        const { title, company, location, type, salary, description, requirements, featured } = req.body;
        const job = await Job.create({
            title, company, location, type, salary, description, requirements, featured: !!featured, employer: req.user._id
        });
        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getJobs = async (req, res) => {
    try {
        const q = {};
        if (req.query.search) q.$or = [
            { title: new RegExp(req.query.search, "i") },
            { company: new RegExp(req.query.search, "i") },
            { location: new RegExp(req.query.search, "i") }
        ];
        const jobs = await Job.find(q).populate("employer", "name email");
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate("employer", "name email");
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.employer.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed" });

        Object.assign(job, req.body);
        await job.save();
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.employer.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed" });

        await job.remove();
        res.json({ message: "Job removed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
