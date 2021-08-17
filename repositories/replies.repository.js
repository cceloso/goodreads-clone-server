const knex = require('./knex');

const repliesRepo = {
    getReply: (replyId, topicId) => {
        return knex.raw("CALL getReply(?, ?)", [replyId, topicId]);
    },
    
    getReplies: (topicId) => {
        return knex.raw("CALL getReplies(?)", [topicId]);
    },

    addReply: (content, topicId, userId, userName) => {
        return knex.raw("CALL postReply(?, ?, ?, ?)", [content, topicId, userId, userName]);
    },

    editReply: (replyId, content, topicId) => {
        return knex.raw("CALL putReply(?, ?, ?)", [replyId, content, topicId]);
    },

    deleteReply: (replyId, topicId) => {
        return knex.raw("CALL deleteReply(?, ?)", [replyId, topicId]);
    },

    deleteRepliesByTopic: (topicId) => {
        return knex.raw("CALL deleteRepliesByTopic(?)", [topicId]);
    }
};

module.exports = repliesRepo;