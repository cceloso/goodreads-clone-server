const Redis = require("ioredis");
const redis = new Redis({
    port: 6379,
    host: 'goodreads_redis',
    password: "Password123"
});

module.exports = redis;