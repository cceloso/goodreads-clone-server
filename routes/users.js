var express = require('express');
var router = express.Router();
const controller = require('../controllers/main.controller');

/* Add user */
router.post('/', controller.postUser);

/* Add user (w/ userId, invalid) */
router.post('/:userId', controller.postUser);

/* Edit user (w/o userId, invalid) */
router.put('/', controller.putUser);

/* Edit user */
router.put('/:userId', controller.putUser);

/* View all users */
router.get('/', controller.getUser);

/* View specific user */
router.get('/:userId', controller.getUser);

/* Delete specific user (w/o bookId, invalid) */
router.delete('/', controller.deleteUser);

/* Delete specific user */
router.delete('/:userId', controller.deleteUser);

module.exports = router;
