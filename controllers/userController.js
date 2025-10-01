// ...existing code...
// Get jobs posted by current employer
export const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user._id });
        res.json(jobs);
    } catch (err) {
        console.error("Error fetching employer jobs:", err);
        res.status(500).json({ message: "Server error" });
    }
};
