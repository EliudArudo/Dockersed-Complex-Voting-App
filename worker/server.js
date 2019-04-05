const { sequelize, redisSubscriber } = require('./connection');



/* 
---- seed-data
// Check redis if it exists
// If yes, get redis object 'seed-data -> voters -> data' (hash)
// If no, generate seed-data from postgres and store in redis then send object
  --- voters
  --- admin
  --- results
  
---- voterIds
// Check if voterIds in redis exists
// If yes, get redis object 'voterIds -> array' (Not hash)
// If no, check mongodb for array
/// If yes, return array and update redis
/// If no, return empty array

---- update
  --- admin -- returns 'notification objects' + 'pulse objects'
  // on success, 'notification objects' are sent out
  // Seed-Data Function: regenerate seed-data on all instances and put in REDIS
  // Send admin seed data for settings regeneration
     --- category add - no pulse object
     --- category deleted - no pulse object
     --- category name change - no pulse object
     --- category updated (candidates added / removed) - send pulse object

  --- voters -- returns only 'pulse objects' (No candidate structural changes)
  // POSTGRES - add vote to candidate
  // REDIS - add id to voterIds array
  // Notification Function: use Vote objects to generate Pulse objects

---- shutdown
// Clear postgress databases, mongodb databases, redis databases
// Send empty seed data for all rooms
*/

redisSubscriber.on('message', (channel, message) => {

});
redisSubscriber.subscribe('worker');

sequelize
    .sync()
    .then(() => {
        console.log('Sequelize + postgres initialized');
    })
    .catch(console.log)


