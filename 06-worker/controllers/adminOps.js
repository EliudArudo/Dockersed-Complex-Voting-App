const Candidate = require('../models/postgres/candidate');
const Picture = require('../models/mongodb/pictures');

const { genSeedData } = require('../controllers/postgresOps');

const { redisPublisher } = require('../connection');

module.exports = async (data, callback) => {

    try {


        // Regen the seed data -> Works on redis automatically
        await genSeedData('admin');
        let resultsData = await genSeedData('results');

        data.forEach(async (notification, index, array) => {

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
                        pictureId: pic._id.toString()
                    });

                }

                resultsData = await genSeedData('results');
                await genSeedData('admin');
                await genSeedData('voters');

                // Send pulse object with empty current Votes
                let resultsPulse = {};

                if (resultsData) {
                    resultsPulse = resultsData.find(item => item.name === notification.category);

                    if (resultsPulse) {
                        redisPublisher.publish('response', JSON.stringify({
                            type: 'update',
                            data: { room: 'results', type: 'pulse', data: resultsPulse } // should be an array object
                        }));
                    }
                }

            } else if (notification.type === 'delete') {
                /// Category deleted
                /// { category: 'name', type: 'delete' }

                // Delete category from Candidates table
                const candidates = await Candidate.findAll({ where: { category: notification.category } }).map(el => el.get({ plain: true }));
        
                for (const candidate of candidates) {
                    await Picture.findOneAndRemove({ userName: candidate.name });

                    const s_candidate = await Candidate.findOne({where: { name: candidate.name}});
                    await s_candidate.destroy();
                    
                }
                
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
                const candidates = await Candidate.findAll({ where: { category: notification.category } }).map(el => el.get({ plain: true }));

                const persistentGuys = [];

                for (const candidate of candidates) {
                    const deleted = notification.candidates.findIndex(person => person.name === candidate.name);

                    if (deleted === -1) {
                        //// Delete pictures from mongodb
                        await Picture.findOneAndRemove({ userName: candidate.name });
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
                            category: notification.category,
                            party: candidate.party,
                            currentVotes: 0,
                            pictureId: pic._id.toString()
                        });
                    }
                }

                /// For existing guys, update their information accordingly too
                for (const person of persistentGuys) {
                    let candidate = await Candidate.findOne({ where: { name: person.name } });

                    if (candidate.name) {
                        candidate.name = person.name;
                        candidate.category = notification.category;
                        candidate.party = person.party;

                        await Picture.findOneAndUpdate({ userName: candidate.name }, { $set: { picture: person.picture } });
                        // id is still the same

                        await candidate.save();
                    }

                }



                // Regen the seed data -> Works on redis automatically
                await genSeedData('admin');
                await genSeedData('voters');
                let resultsData = await genSeedData('results');
                // Send pulse object with empty current Votes
                // Send pulse object with empty current Votes

                let resultsPulse = {};

                if (resultsData) {
                    resultsPulse = resultsData.find(item => item.name === notification.category);

                    if (resultsPulse) {
                        redisPublisher.publish('response', JSON.stringify({
                            type: 'update',
                            data: { room: 'results', type: 'pulse', data: resultsPulse } // should be an array object
                        }));
                    }

                }

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

            if (index === array.length - 1) {
                callback();
            }

        });

    } catch (e) {
        throw new Error(e);
    }
}
