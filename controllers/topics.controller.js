const url = require('url');

module.exports = (socket) => {
    const responsesController = require('./responses.controller');
    
    const repliesRepo = require('../repositories/replies.repository');
    const topicsRepo = require('../repositories/topics.repository');
    const usersRepo = require('../repositories/users.repository');
    
    
    const searchTopics = (res, searchParam) => {
        searchParam = `%${searchParam}%`;
    
        topicsRepo.searchTopics(searchParam)
        .then((val) => responsesController.sendData(res, 200, val[0][0]))
        .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
    };
    
    const getTopicsByFlair = (res, flair) => {
        topicsRepo.getTopicsByFlair(flair)
        .then((val) => responsesController.sendData(res, 200, val[0][0]))
        .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
    };
    
    const getTopicsByUser = (res, userId) => {
        topicsRepo.getTopicsByUser(userId)
        .then((val) => responsesController.sendData(res, 200, val[0][0]))
        .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
    };

    return {
        getTopic: (req, res) => {
            topicsRepo.getTopic(req.params.topicId)
            .then((val) => {
                let topic = val[0][0];
                if(topic.length == 0) {
                    responsesController.sendError(res, 404, "Topic not found.", "NOT_FOUND");
                } else {
                    responsesController.sendData(res, 200, topic);
                }
            })
            .catch((err) => {
                responsesController.sendError(res, 400, err, "BAD_REQUEST");
            });
        },
    
        getTopics: (req, res) => {
            const queryObject = url.parse(req.url, true).query;
            const searchParam = queryObject.q;
            const flair = queryObject.flair;
            const userId = queryObject.userId;
    
            if(searchParam != undefined) {
                searchTopics(res, searchParam);
            } else if(flair != undefined) {
                getTopicsByFlair(res, flair);
            } else if(userId != undefined) {
                getTopicsByUser(res, userId);
            } else {
                topicsRepo.getTopics()
                .then((val) => responsesController.sendData(res, 200, val[0][0]))
                .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"));
            }
        },
    
        postTopic: (req, res) => {
            if(Object.keys(req.body).length === 0) {
                responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
            }
    
            const queryObject = url.parse(req.url, true).query;
            const userId = queryObject.userId;
            let userName = "";
    
            usersRepo.getUserById(userId)
            .then((val) => userName = val[0][0][0]['userName'])
            .then(() => topicsRepo.addTopic(req.body, userId, userName))
            .then((val) => {
                const topicObject = val[0][0][0];

                socket.broadcastWithoutRoom("newTopic", topicObject);

                responsesController.sendData(res, 201, topicObject);
            })
            .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"));
        },
    
        putTopic: (req, res) => {
            if(Object.keys(req.body).length === 0) {
                responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
            }
    
            topicsRepo.editTopic(req.params.topicId, req.body)
            .then((val) => {
                const topicObject = val[0][0][0];
                const room = `topicUpdate-${topicObject.id}`;

                socket.broadcast(room, "updatedTopic", topicObject);
                socket.broadcastWithoutRoom("updatedTopic", topicObject);

                responsesController.sendData(res, 200, topicObject);
            })
            .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"));
        },
    
        deleteTopic: (req, res) => {
            const topicId = req.params.topicId;

            topicsRepo.deleteTopic(topicId)
            .then(() => repliesRepo.deleteRepliesByTopic(topicId))
            .then(() => {
                const room = `topicUpdate-${topicId}`;

                socket.broadcast(room, "removedTopic", topicId);
                socket.broadcastWithoutRoom("removedTopic", topicId);

                responsesController.sendData(res, 200, {message: "Successfully deleted topic."});
            })
            .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"));
        }
    }
}
