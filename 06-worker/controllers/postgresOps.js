const Candidate = require('../models/postgres/candidate');
const Picture = require('../models/mongodb/pictures');

const { setHash } = require('../controllers/redisOps');

const genSeedData = async (forWho) => {

    try {

        const Candidates = await Candidate.findAll({});

        if (!Candidates || Candidates.length === 0) {
            return [];
        }

        const Categories = [];

        // returning a function with an async call
        return Candidates.forEach(async (person, index, array) => {

            const categoryIndex = Categories.findIndex(item => item.name === person.category);

            try {

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

                if (index === array.length - 1) {
                    // Get total Categories votes
                    Categories = Categories.map(item => {

                        const sum = 0;
                        for (const person of item.candidates) {
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
                    setHash('seed-data', forWho, JSON.parse(Categories));
                    return Categories;
                }

            } catch (e) {
                throw new Error(e);
            }

        });

    } catch (e) {
        throw new Error(e);
    }

}


module.exports = {
    genSeedData
}