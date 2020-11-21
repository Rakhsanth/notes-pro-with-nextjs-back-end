// 3rd party modules
const express = require('express');
// custom modules
const {
    getUser,
    userLogin,
    editUser,
    deleteUser,
    createUser,
    userLogout,
} = require('../controllers/users');
const { protected } = require('../middlewares/authMiddlewares');

const router = express.Router();

router
    .route('/:id')
    .get(protected, getUser)
    .put(protected, editUser)
    .delete(protected, deleteUser);
router.route('/register').post(createUser);
router.route('/login').post(userLogin);
router.route('/auth/logout').get(protected, userLogout);

module.exports = router;
