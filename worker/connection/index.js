const redis = require('redis');
const Sequelize = require('sequelize');

const util = require('util');

const { REDIS_HOST, REDIS_PORT, PG_HOST, PG_USER, PG_PASSWORD, PG_DATABASE, PG_PORT } = require('../env');

const sequelize = new Sequelize(PG_DATABASE, PG_USER, PG_PASSWORD, {
    dialect: 'postgres',
    host: PG_HOST,
    port: PG_PORT
});


const redisClient = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT,
    retry_strategy: () => 1000
});

redisClient.get = util.promisify(redisClient.get);
redisClient.hget = util.promisify(redisClient.hget);


const redisPublisher = redisClient.duplicate();
const redisSubscriber = redisClient.duplicate();


module.exports = {
    sequelize,
    redisClient,
    redisPublisher,
    redisSubscriber
};