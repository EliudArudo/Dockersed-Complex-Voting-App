const redis = require('redis');
const Sequelize = require('sequelize');
const mongoose = require('mongoose');

const util = require('util');

const { REDIS_HOST, REDIS_PORT, PG_HOST, PG_USER, PG_PASSWORD, PG_DATABASE, PG_PORT, MONGO_URI, MONGO_PORT, MONGO_DB } = require('../env');

mongoose.Promise = global.Promise;

const sequelize = new Sequelize(PG_DATABASE, PG_USER, PG_PASSWORD, {
    dialect: 'postgres',
    host: PG_HOST,
    port: PG_PORT
});

const mongoURI = `mongodb://${MONGO_URI}:${MONGO_PORT}/${MONGO_DB}`;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    reconnectTries: 10,
    reconnectInterval: 1000
}, async (err, db) => {
    if (err) {
        console.log(err);
        // process.exit(1);
    }

    console.log('WORKER: Mongodb connected');

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

redisClient.on('connect', function () {
    console.log('WORKER: Redis connected');
}).on('error', function (error) {
    console.log(error);
});

module.exports = {
    sequelize,
    redisClient,
    redisPublisher,
    redisSubscriber
};
