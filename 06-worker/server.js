const { sequelize, redisSubscriber, redisPublisher, redisClient } = require('./connection');
const { get, set, getHash } = require('./controllers/redisOps');
const { genSeedData } = require('./controllers/postgresOps');

const Picture = require('./models/mongodb/pictures');
const VoterID = require('./models/mongodb/votersId');

const vote = require('./controllers/vote');
const admin = require('./controllers/adminOps');

const Candidate = require('./models/postgres/candidate');

redisSubscriber.on('message', async (channel, message) => {

  try {

    //// Scalability solution /////
    // -> Each request should be unique
    const uniqueRequest = await redisClient.hget("unique_requests", JSON.stringify(message));

    if (uniqueRequest) {
      // If there's the request, return
      return;
    }

    await redisClient.hset("unique_requests", JSON.stringify(message), "true");
    //// Scalability solution /////


    message = JSON.parse(message);

    console.log('WORKER: Got message from MANAGER', { message });

    const data = message.data;
    message = message.message;

    let s_data, s_data2, s_data3;

    if (message === 'seed-data') {
      if (!data) {
        return;
      }

      /*
        ---- seed-data
        // Check redis if it exists
        // If yes, get redis object 'seed-data -> voters -> data' (hash)
        // If no, generate seed-data from postgres and store in redis then send object
          --- voters
          --- admin
          --- results
    */

      //  message = 'seed-data', data.seedData = 'voters | admin | results';
      s_data = await getHash(message, data.seedData);

      // console.log("s_data 1:", s_data);

      if (!s_data) {
        s_data = await genSeedData(data.seedData);
      }

      // console.log("s_data 2:", s_data);

      redisPublisher.publish('response', JSON.stringify({
        type: 'seed-data',
        room: data.seedData,
        data: s_data // should be an array object
      }));
      return;

    } else if (message === 'voterIds') {
      /*
         ---- voterIds
         // Check if voterIds in redis exists
         // If yes, get redis object 'voterIds -> array' (Not hash)
         // If no, check mongodb for array
         /// If yes, return array and update redis
         /// If no, return empty array
      */

      // let prevList = await VoterId.findOne({ name: 'all' });

      // if (!prevList) { // meaning nothing was found
      //   await new VoterId({ name: 'all', array: [] }).save();
      //   prevList = await VoterId.findOne({ name: 'all' });
      // }

      // prevList.array = prevList.array.push(data["id"]);
      // prevList.save();

      // let prevList2 = await get('voterIds');
      // if (!prevList2) {
      //   await set('voterIds', []);
      //   prevList2 = await get('voterIds');
      // }
      // prevList2.push(data["id"]);
      // set('voterIds', prevList2);

      s_data = await get(message);

      if (s_data) {
        return s_data;
      }

      s_data = await VoterID.findOne({ name: 'all' }); // find first object only

      if (!s_data) { // s_data not found
        await new VoterID({ name: 'all', array: [] }).save();
        s_data = await VoterID.findOne({ name: 'all' });
      }

      set('voterIds', s_data.array);
      // Not supposed to be here --- optimisation
      s_data = s_data.array;

      redisPublisher.publish('response', JSON.stringify({
        type: 'voterIds',
        data: s_data // should be an array object
      }));
      return;

    } else if (message === 'update') {

      if (data.type === 'voters') {
        /*
        ---- update
        --- voters -- returns only 'pulse objects' (No candidate structural changes)
          // POSTGRES - add vote to candidate
          // REDIS - add id to voterIds array
          // MONGODB - add id to document array
          // Pulse Function: use Vote objects to generate Pulse objects
       */

        await vote(data.data);
        return;

      } else if (data.type === 'admin') {
        /*
        --- admin -- returns 'notification objects' + 'pulse objects'
        // on success, 'notification objects' are sent out
        // Seed-Data Function: regenerate seed-data on all instances and put in REDIS
        // Send admin seed data for settings regeneration
            --- category add - no pulse object
            --- category deleted - no pulse object
            --- category name change - no pulse object
            --- category updated (candidates added / removed) - send pulse object
       */

        // Sends pulses and notifications only
        admin(data.data, async () => {
          /// Send admin seed data to reset everything on admin side too
          //  message = 'seed-data', data.seedData = 'voters | admin | results';

          s_data = await getHash('seed-data', 'admin');
          s_data2 = await getHash('seed-data', 'voters');
          s_data3 = await getHash('seed-data', 'results');


          // console.log("s_data 1:", s_data);

          if (!s_data) {
            s_data = await genSeedData('admin');
          }

          if (!s_data2) {
            s_data2 = await genSeedData('voters');
          }
          if (!s_data3) {
            s_data3 = await genSeedData('results');
          }

          redisPublisher.publish('response', JSON.stringify({
            type: 'seed-data',
            room: 'admin',
            data: s_data // should be an array object
          }));

          redisPublisher.publish('response', JSON.stringify({
            type: 'seed-data',
            room: 'voters',
            data: s_data2 // should be an array object
          }));

          redisPublisher.publish('response', JSON.stringify({
            type: 'seed-data',
            room: 'results',
            data: s_data3 // should be an array object
          }));

        });

        return;

      }

    } else if (message === 'shutdown') {
      /*
          ---- shutdown
          // Clear postgress databases, mongodb databases, redis databases
          // Send empty seed data for all rooms
      */

      await Candidate.destroy({ where: {}, truncate: true });
      await Picture.remove({});
      await VoterID.remove({});

      await redisClient.flushall();


      const s_data = await genSeedData('admin');
      const s_data2 = await genSeedData('voters');
      const s_data3 = await genSeedData('results');

      redisPublisher.publish('response', JSON.stringify({
        type: 'seed-data',
        room: 'admin',
        data: s_data // should be an empty array object
      }));

      redisPublisher.publish('response', JSON.stringify({
        type: 'seed-data',
        room: 'voters',
        data: s_data2 // should be an empty array object
      }));

      redisPublisher.publish('response', JSON.stringify({
        type: 'seed-data',
        room: 'results',
        data: s_data3 // should be an empty array object
      }));


      redisPublisher.publish('response', JSON.stringify({
        type: 'shutdown' // should be an empty array object
      }));

    }


  } catch (e) {
    console.log(e);
    throw new Error(e);
  } finally {

    //// Scalability solution /////
    // Delete the unique request
    await redisClient.hdel("unique_requests", JSON.stringify(message));
    //// Scalability solution /////
  }

});
redisSubscriber.subscribe('worker');

sequelize
  .sync()
  .then(() => {
    // Remove Candidates table
    console.log('WORKER: Sequelize + postgres initialized');
    /// THIS IS THE ERROR!!!!!
    // require('./connection/resetDatabases');
  })
  .catch(console.log)

