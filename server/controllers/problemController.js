const Problem = require('../models/problemModel');

// Get all problems, optionally filtered by tags
exports.getProblems = async (req, res) => {
    try {
        // Extract tags from query params (if any)
        const { tags } = req.query;

        // Build query based on presence of tags filter
        let query = {};
        
        if (tags) {
            // Convert comma-separated tag string to array and filter by those tags
            const tagArray = tags.split(',').map(tag => tag.trim());
            query = { tags: { $in: tagArray } };
        }

        // Find problems with optional tag filtering
        const problems = await Problem.find(query);
        
        res.status(200).json({
            success: true,
            count: problems.length,
            data: problems
        });
    } catch (err) {
        console.error('Error fetching problems:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Get all unique tags from all problems
exports.getAllTags = async (req, res) => {
    try {
        // Aggregate to get all unique tags across problems
        const tags = await Problem.aggregate([
            { $unwind: '$tags' },
            { $group: { _id: '$tags' } },
            { $sort: { _id: 1 } } // Sort alphabetically
        ]);

        // Extract just the tag names
        const tagList = tags.map(tag => tag._id);
        
        res.status(200).json({
            success: true,
            count: tagList.length,
            data: tagList
        });
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Create a new problem
exports.createProblem = async (req, res) => {
    try {
        const problem = await Problem.create(req.body);
        
        res.status(201).json({
            success: true,
            data: problem
        });
    } catch (err) {
        console.error('Error creating problem:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Get a single problem by ID
exports.getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        
        if (!problem) {
            return res.status(404).json({
                success: false,
                error: 'Problem not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: problem
        });
    } catch (err) {
        console.error('Error fetching problem:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Update a problem
exports.updateProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        if (!problem) {
            return res.status(404).json({
                success: false,
                error: 'Problem not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: problem
        });
    } catch (err) {
        console.error('Error updating problem:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Delete a problem
exports.deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndDelete(req.params.id);
        
        if (!problem) {
            return res.status(404).json({
                success: false,
                error: 'Problem not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error('Error deleting problem:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};
