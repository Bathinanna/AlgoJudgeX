const express = require('express');
const router = express.Router();
const { 
    getProblems, 
    getAllTags, 
    createProblem,
    getProblemById,
    updateProblem,
    deleteProblem
} = require('../controllers/problemController');
const { isAdmin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getProblems);
router.get('/tags', getAllTags);
router.get('/:id', getProblemById);

// Protected routes (admin only)
router.post('/', isAdmin, createProblem);
router.put('/:id', isAdmin, updateProblem);
router.delete('/:id', isAdmin, deleteProblem);

module.exports = router;
