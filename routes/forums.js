var express = require('express');
var router = express.Router();
const passport = require('passport');

const topicsController = require('../controllers/topics.controller');
const repliesController = require('../controllers/replies.controller');

/* -- TOPICS -- */

router.get('/:topicId', topicsController.getTopic);
router.get('/', topicsController.getTopics);
router.post('/', passport.authenticate('jwt', { session: false }), topicsController.postTopic);
router.put('/:topicId', passport.authenticate('jwt', { session: false }), topicsController.putTopic);
router.delete('/:topicId', passport.authenticate('jwt', { session: false }), topicsController.deleteTopic);

/* -- REPLIES -- */

router.get('/:topicId/replies/:replyId', repliesController.getReply);
router.get('/:topicId/replies', repliesController.getReplies);
router.post('/:topicId/replies', passport.authenticate('jwt', { session: false }), repliesController.postReply);
router.put('/:topicId/replies/:replyId', passport.authenticate('jwt', { session: false }), repliesController.putReply);
router.delete('/:topicId/replies/:replyId', passport.authenticate('jwt', { session: false }), repliesController.deleteReply);

module.exports = router;
