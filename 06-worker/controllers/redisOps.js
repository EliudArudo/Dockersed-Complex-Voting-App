const { redisClient } = require('../connection')

const getHash = async (key1, key2) => {
    try {
        let res = await redisClient.hget(key1, key2);

        if (res) {
            res = JSON.parse(res);
        } else {
            res = null;
        }

        return res;
    } catch (e) {
        throw new Error(e);
    }
};

const get = async (key) => {
    try {
        let res = await redisClient.get(key);

        if (res) {
            res = JSON.parse(res);
        } else {
            res = null;
        }

        return res;
    } catch (e) {
        throw new Error(e);
    }
};

const setHash = async (key1, key2, value) => {
    // Value should be turned to JSON automatically
    value = JSON.stringify(value);
    try {
        await redisClient.hset(key1, key2, value);

        return;
    } catch (e) {
        throw new Error(e);
    }
};

const set = async (key, value) => {
    // Value should be turned to JSON automatically
    value = JSON.stringify(value);
    try {
        await redisClient.set(key, value);

        return res;
    } catch (e) {
        throw new Error(e);
    }
};




module.exports = {
    get,
    getHash,
    set,
    setHash
}