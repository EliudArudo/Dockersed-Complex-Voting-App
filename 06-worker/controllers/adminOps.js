const Candidate = require('../models/postgres/candidate');
const Picture = require('../models/mongodb/pictures');

const { genSeedData } = require('../controllers/postgresOps');

const { redisPublisher } = require('../connection');

module.exports = async (data) => {

    try {

        for (const notification of data) {
            // Regen the seed data -> Works on redis automatically
            const adminData = await genSeedData('admin');
            const resultsData = await genSeedData('results');

            if (notification.type === 'add') {
                /// Category added
                /// { category: 'name', type: 'add', candidates: [{name: 'name', picture: 'picture', party: 'party'}, {name: 'name', picture: 'picture', party: 'party'}]}

                // Add the candidates to 'postgres' -> new Category will automatically be added
                // Save image in mongodb and get id
                for (const candidate of notification.candidates) {
                    const pic = await new Picture({
                        userName: candidate.name,
                        picture: candidate.picture
                    }).save();

                    await Candidate.create({
                        name: candidate.name,
                        category: notification.category,
                        party: candidate.party,
                        currentVotes: 0,
                        pictureId: pic._id
                    });
                }

                // Send pulse object with empty current Votes
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

            } else if (notification.type === 'delete') {
                /// Category deleted
                /// { category: 'name', type: 'delete' }

                // Delete category from Candidates table
                const candidates = await Candidate.findAll({ where: { category: notification.category } });

                for (const candidate of candidates) {
                    await Picture.findOneAndRemove({ userName: candidate.name });
                }

                await Candidate.destroy({ where: { category: notification.category } });
                // Generate new seed-data - taks care of redis
                await genSeedData('admin');
                await genSeedData('results');
                await genSeedData('voters');


            } else if (notification.type === 'update' && notification.newName) {
                /// Category name changed
                /// { category: 'name', type: 'update', newName: 'name' }

                /// Change records in each candidate record
                const candidates = await Candidate.findAll({ where: { category: notification.category } });

                for (const candidate of candidates) {
                    candidate.category = notification.newName;

                    await candidate.save();
                }

                /// Generate new seed data
                await genSeedData('admin');
                await genSeedData('results');
                await genSeedData('voters');


            } else if (notification.type === 'update' && !notification.newName) {
                /// Candidate modified -> Includes candidates removed or added
                /// { category: 'name', type: 'update', candidates: [{name: 'name', picture: 'picture', party: 'party'}, {name: 'name', picture: 'picture', party: 'party'}]}

                // Do candidate checks
                const candidates = await Category.findAll({ where: { category: notification.category } });

                const persistentGuys = [];

                for (const candidate of candidates) {
                    const deleted = notification.candidates.findIndex(person => person.name === candidate.name) === -1;

                    if (deleted) {
                        //// Delete pictures from mongodb
                        await Picture.findByIdAndRemove({ userName: candidate.name });
                        /// Delete candidates not in the list
                        await Candidate.destroy({ where: { name: candidate.name } });
                    } else {
                        persistentGuys.push(notification.candidates[deleted]);
                    }
                }

                /// Find added candidates
                for (const candidate of notification.candidates) {
                    const added = candidates.findIndex(person => person.name === candidate.name) === -1;

                    if (added) {
                        //// Add pictures to mongodb
                        const pic = await new Picture({
                            userName: candidate.name,
                            picture: candidate.picture
                        }).save();
                        //// Update all user info in postgress and picture for mongodb
                        await Candidate.create({
                            name: candidate.name,
                            category: candidate.category,
                            party: candidate.party,
                            currentVotes: 0,
                            pictureId: pic._id
                        });
                    }
                }

                /// For existing guys, update their information accordingly too
                for (const person of persistentGuys) {
                    let candidate = await Candidate.findAll({ where: { name: person.name } });
                    candidate = candidate[0];

                    if (candidate) {
                        candidate.name = person.name;
                        candidate.category = notification.category;
                        candidate.party = person.party;

                        await Picture.findOneAndUpdate({ userName: candidate.name }, { $set: { picture: person.picture } });
                        // id is still the same

                        await candidate.save();
                    }

                }

                // Regen the seed data -> Works on redis automatically
                const adminData = await genSeedData('admin');
                const resultsData = await genSeedData('results');
                // Send pulse object with empty current Votes
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

            // Send notifications to right places
            redisPublisher.publish('response', JSON.stringify({
                type: 'update',
                data: { room: 'voters', type: 'notification', data: notification } // should be an array object
            }));

            redisPublisher.publish('response', JSON.stringify({
                type: 'update',
                data: { room: 'results', type: 'notification', data: notification } // should be an array object
            }));

            return;
        }

    } catch (e) {
        throw new Error(e);
    }
}