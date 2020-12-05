// custom modules
const ErrorResponse = require('../utils/error');
const Notes = require('../models/Notes');
const asyncHandler = require('../middlewares/asyncHandler');

/*
route:          GET /notes
description:    To get all notes for a user
auth:           Logged in user
*/
const getAllNotes = asyncHandler(async (request, response, next) => {
    response.status(200).json(response.advancedResults);
});
/*
route:          GET /notes/:id
description:    To get a notes by his unique ID
auth:           Logged in user
*/
const getNotes = asyncHandler(async (request, response, next) => {
    const notes = await Notes.findById(request.params.id);
    if (!notes) {
        return next(new ErrorResponse('Note does not exist', '404'));
    }

    if (notes.user.toString() !== request.user.id) {
        return next(
            new ErrorResponse(
                'User not authorized to view or modify this note',
                401
            )
        );
    }

    response.status(200).json({
        success: true,
        data: notes,
        error: false,
    });
});
/*
route:          POST /notes/
description:    To create a note
auth:           logged in users
*/
const createNotes = asyncHandler(async (request, response, next) => {
    request.body.user = request.user.id;
    const note = await Notes.create(request.body);

    response.status(201).json({ success: true, data: note, error: false });
});
/*
route:          PUT /notes/:id
description:    To update a note
auth:           logged in user
*/
const editNotes = asyncHandler(async (request, response, next) => {
    console.log(request.body);

    const note = await Notes.findById(request.params.id);

    if (!note) {
        return next(new ErrorResponse('Note does not exist', 404));
    }

    if (note.user.toString() !== request.user.id) {
        return next(
            new ErrorResponse(
                'Current user is not authorized to update this notes',
                401
            )
        );
    }

    const updatedNote = await Notes.findByIdAndUpdate(
        request.params.id,
        request.body,
        { new: true, runValidators: true }
    );

    response.status(201).json({
        success: true,
        data: updatedNote,
        error: false,
    });
});
/*
route:          DELETE /notes/:id
description:    To delete a note
auth:           logged in user
*/
const deleteNotes = asyncHandler(async (request, response, next) => {
    const note = await Notes.findById(request.params.id);

    if (!note) {
        return next(new ErrorResponse('Note doesnot exist', 404));
    }

    await note.remove();

    response.status(201).json({
        success: true,
        message: 'Note successfully removed',
        error: false,
    });
});

module.exports = {
    getAllNotes,
    getNotes,
    createNotes,
    editNotes,
    deleteNotes,
};
