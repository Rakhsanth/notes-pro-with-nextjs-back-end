// 3rd party modules
const express = require('express');
// custom modules
const {
    getAllNotes,
    getNotes,
    createNotes,
    editNotes,
    deleteNotes,
} = require('../controllers/notes');
const { protected } = require('../middlewares/authMiddlewares');
const advancedResults = require('../utils/advancedResults');
const Notes = require('../models/Notes');

const router = express.Router();

const populate = {};

router
    .route('/')
    .get(protected, advancedResults(Notes, 'notes'), getAllNotes)
    .post(protected, createNotes);
router
    .route('/:id')
    .get(protected, getNotes)
    .put(protected, editNotes)
    .delete(protected, deleteNotes);

module.exports = router;
