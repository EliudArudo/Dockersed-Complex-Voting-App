const Candidate = require('../models/postgres/candidate');
const Picture = require('../models/mongodb/pictures');

const { setHash } = require('../controllers/redisOps');

const genSeedData = async (forWho) => {

    try {

        const Candidates = await Candidate.findAll().map(el => el.get({ plain: true }));

        if (!Candidates || Candidates.length === 0) {
            await setHash('seed-data', forWho, JSON.stringify([]));
            return [];
        }

        let Categories = [];

        // returning a function with an async call
        for (const person of Candidates) {
            let categoryIndex = Categories.findIndex(item => item.name === person.category);

            const pictureData = await Picture.findOne({ userName: person.name });

            if (categoryIndex === -1) {

                Categories.push({
                    name: person.category,
                    currentVotes: 0, // sort out at last,
                    candidates: [{
                        name: person.name,
                        picture: pictureData.picture, // get from mongodb
                        party: person.party,
                        currentVotes: person.currentVotes
                    }]
                })


            } else {

                Categories[categoryIndex].candidates.push({
                    name: person.name,
                    picture: pictureData.picture, // get from mongodb
                    party: person.party,
                    currentVotes: person.currentVotes
                });

            }
        }

        // Get total Categories votes
        Categories = Categories.map(item => {

            let sum = 0;
            for (let person of item.candidates) {
                sum += person.currentVotes;
            }
            item.currentVotes = sum;

            if (forWho === 'voters') {
                /// Category
                /// remove Category current votes
                /// change 'name' field to 'category'
                /// Candidate
                /// remove current votes
                /// add checked: false 
                delete item['currentVotes'];
                item['category'] = item.name;
                delete item['name'];

                item.candidates = item.candidates.map(person => {
                    delete person['currentVotes'];
                    person['checked'] = false;

                    return person;
                });
            }
            return item;
        });
        /// store this in redis
        await setHash('seed-data', forWho, JSON.stringify(Categories));

        return Categories;

    } catch (e) {
        throw new Error(e);
    }

}


module.exports = {
    genSeedData
}