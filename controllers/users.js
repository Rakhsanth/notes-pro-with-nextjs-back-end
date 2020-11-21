// custom modules
const ErrorResponse = require('../utils/error');
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const { validatePassword } = require('../inputValidators');
const { request } = require('express');

/*
route:          GET /users/:id
description:    To get a user by his unique ID
auth:           Logged in user
*/
const getUser = asyncHandler(async (request, response, next) => {
    const user = await User.findById(request.params.id);
    if (!user) {
        return next(new ErrorResponse('User does not exist', '404'));
    }

    response.status(200).json({
        success: true,
        data: user,
        error: false,
    });
});
/*
route:          POST /users/login
description:    To login a user
auth:           all
*/
const userLogin = asyncHandler(async (request, response, next) => {
    console.log('logging session'.yellow.inverse);
    console.log(request.session);
    const { userName, password } = request.body;

    const user = await User.findOne({ userName: userName }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Username seems to be incorrect', '401'));
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return next(new ErrorResponse('Incorrect password', '401'));
    }
    setTokenToCookie(user, 200, request, response);
});
/*
route:          POST /users/register
description:    To create a user
auth:           all
*/
const createUser = asyncHandler(async (request, response, next) => {
    const { userName, password } = request.body;
    if (!validatePassword(password)) {
        return next(
            new ErrorResponse(
                'Password must contains min 8 chars, 1 number, 1 uppercase, 1 lowercase and 1 special character',
                400
            )
        );
    }
    const user = await User.create(request.body);

    setTokenToCookie(user, 201, response);
});
/*
route:          PUT /users/:id
description:    To update a user
auth:           loggedin user
*/
const editUser = asyncHandler(async (request, response, next) => {
    const { userName } = request.body;

    const user = await User.findById(request.params.id);

    if (!user) {
        return next(new ErrorResponse('User doesnot exist', 404));
    }

    const updatedUser = User.findByIdAndUpdate(request.params.id, userName);

    response.status(201).json({
        success: true,
        data: updatedUser,
        error: false,
    });
});
/*
route:          DELETE /users/:id
description:    To delete a user
auth:           logged in user
*/
const deleteUser = asyncHandler(async (request, response, next) => {
    const user = await User.findById(request.params.id);

    if (!user) {
        return next(new ErrorResponse('User doesnot exist', 404));
    }

    await User.findByIdAndDelete(request.params.id);

    response.status(201).json({
        success: true,
        message: 'User successfully deleted',
        error: false,
    });
});
/*
route:          GET /users/logout
description:    To logout
auth:           logged in user
*/
const userLogout = asyncHandler(async (request, response, next) => {
    request.headers.authorization = null;

    request.session.destroy();
    response
        .status(200)
        .cookie('token', 'none', {
            expires: new Date(Date.now() + 5 * 1000),
            httpOnly: true,
        })
        .json({
            success: true,
            message: 'User successfully logged out',
        });
});

// util service to set token to cookie
const setTokenToCookie = (user, statusCode, request, response) => {
    const token = user.getJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_TIMEOUT * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.ENVIRONMENT === 'prod',
    };

    request.session.token = token;
    response.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
    });
};

module.exports = {
    getUser,
    userLogin,
    createUser,
    editUser,
    deleteUser,
    userLogout,
};
