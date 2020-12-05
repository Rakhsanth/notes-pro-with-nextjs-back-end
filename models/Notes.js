const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notesSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'User needs to be associated with each Note'],
    },
    title: {
        type: String,
        maxlength: [
            100,
            'Each notes title can only have maximum of 100 characters',
        ],
        unique: [true, 'Title of each notes needs to be unique'],
        required: [true, 'Each notes must have a title'],
    },
    description: {
        type: String,
        maxlength: [
            3000,
            'Each notes description can only have a maximum of 3000 characters',
        ],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

notesSchema.index({ title: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Notes', notesSchema);
