const Candidate = require('../models/postgres/candidate');
const { genSeedData } = require('../controllers/postgresOps')
const { redisPublisher } = require('../connection');

const { get, set } = require('../controllers/redisOps');

const VoterId = require('../models/mongodb/votersId');

module.exports = async (data) => {
    try {
        // -------------- ID checks here ----------------- //
        let prevList2 = await get('voterIds');
        if (!prevList2) {
            await set('voterIds', []);
            prevList2 = await get('voterIds');
        }

        ///// Concurrency flaw solved here
        if (prevList2.includes(data["id"])) {
            return;
        }
        ///// Concurrency flaw solved here

        prevList2.push(data["id"]);
        set('voterIds', prevList2);
        // -------------- ID checks here ----------------- //

        const categoryArray = [];
        for (const category in data) {
            if (category !== 'id') {
                let candidate = await Candidate.findOne({ where: { name: data[category], category } });

                if (candidate) {
                    candidate.currentVotes++;
                    await candidate.save();

                    let prevList = await VoterId.findOne({ name: 'all' });

                    if (!prevList) { // meaning nothing was found
                        await new VoterId({ name: 'all', array: [] }).save();
                        prevList = await VoterId.findOne({ name: 'all' });
                    }

                    prevList.array = prevList.array.push(data["id"]);
                    prevList.save();

                    categoryArray.push(category);
                }
            }
        }

        // No need to update voters data;
        const adminData = await genSeedData('admin');
        const resultsData = await genSeedData('results');

        const voterIds = await get('voterIds');

        for (const category of categoryArray) {
            const adminPulse = adminData.find(item => item.name === category);
            const resultsPulse = resultsData.find(item => item.name === category);

            if (adminPulse) {
                redisPublisher.publish('response', JSON.stringify({
                    type: 'update',
                    data: { room: 'admin', type: 'pulse', data: adminPulse, voterIds } // should be an array object
                }));
            }

            if (resultsPulse) {
                redisPublisher.publish('response', JSON.stringify({
                    type: 'update',
                    data: { room: 'results', type: 'pulse', data: resultsPulse, voterIds } // should be an array object
                }));
            }
        }

        return;

    } catch (e) {
        throw new Error(e);
    }
}