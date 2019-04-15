const Candidate = require('../models/postgres/candidate');
const { genSeedData } = require('../controllers/postgresOps')
const { redisPublisher } = require('../connection');

const { get, set } = require('../controllers/redisOps');

const VoterId = require('../models/mongodb/votersId');

module.exports = async (data) => {
    try {

        const categoryArray = [];
        for (const category in data) {
            if (category !== 'id') {
                let candidate = await Candidate.find({ name: data[category], category });
                candidate = candidate[0];

                if (candidate) {
                    candidate.currentVotes++;
                    await candidate.save();

                    let prevList = await VoterId.findOne({ name: 'all' });
                    prevList = prevList.array;
                    await VoterId.findOneAndUpdate({ name: 'all' }, { $set: { array: prevList } });

                    const prevList2 = await get('voterIds');
                    prevList2.push(data.id);
                    set('voterIds', prevList2);

                    categoryArray.push(category);
                }
            }
        }

        const adminData = await genSeedData('admin');
        const resultsData = await genSeedData('results');

        for (const category of categoryArray) {
            const adminPulse = adminData.find(item => item.category === category);
            const resultsPulse = resultsData.find(item => item.category === category);

            redisPublisher.publish('response', JSON.stringify({
                type: 'update',
                data: { room: 'admin', type: 'pulse', data: adminPulse } // should be an array object
            }));

            redisPublisher.publish('response', JSON.stringify({
                type: 'update',
                data: { room: 'results', type: 'pulse', data: resultsPulse } // should be an array object
            }));
        }

        return;

    } catch (e) {
        return e;
    }
}