const { redisClient } = require(".");

const VoterIds = require("../models/mongodb/votersId");
const Pictures = require("../models/mongodb/pictures");
const Candidate = require('../models/postgres/candidate');

async function init() {
    try {

        const voters = await VoterIds.find();
        const pictures = await Pictures.find();

        voters.forEach(voter => {
            VoterIds.findByIdAndRemove(voter._id);
        });

        pictures.forEach(pic => {
            Pictures.findByIdAndRemove(pic._id);
        });

        redisClient.flushall();
        Candidate.destroy({ where: {}, truncate: true });

    } catch (e) {
        console.log(e);
    }
}

init();

