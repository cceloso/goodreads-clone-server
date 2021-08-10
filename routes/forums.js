var express = require('express');
var router = express.Router();

const topicsController = require('../controllers/topics.controller');
const repliesController = require('../controllers/replies.controller');

/* -- TOPICS -- */

router.get('/:topicId', topicsController.getTopic);
router.get('/', topicsController.getTopics);
router.post('/', topicsController.postTopic);
router.put('/:topicId', topicsController.putTopic);
router.delete('/:topicId', topicsController.deleteTopic);

/* -- REPLIES -- */

router.get('/:topicId/replies/:replyId', repliesController.getReply);
router.get('/:topicId/replies', repliesController.getReplies);
router.post('/:topicId/replies', repliesController.postReply);
router.put('/:topicId/replies/:replyId', repliesController.putReply);
router.delete('/:topicId/replies/:replyId', repliesController.deleteReply);

module.exports = router;
