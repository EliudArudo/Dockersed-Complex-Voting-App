const redis = require('redis');
const util = require('util');

const { REDIS_HOST, REDIS_PORT } = require('../env');

const redisClient = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT,
    retry_strategy: () => 1000
});

redisClient.get = util.promisify(redisClient.get);
redisClient.hget = util.promisify(redisClient.hget);


const redisPublisher = redisClient.duplicate();
const redisSubscriber = redisClient.duplicate();

redisClient.on('connect', function () {
    console.log('MANAGER: Redis connected');
}).on('error', function (error) {
    console.log(error);
});

module.exports = {
    redisClient,
    redisPublisher,
    redisSubscriber
}