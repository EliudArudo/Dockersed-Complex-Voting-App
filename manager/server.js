const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const axios = require('axios');

const { redisClient, redisPublisher, redisSubscriber } = require('./connection')
const env = require('./env');

const port = 5005;

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Requests IN + RES
// Voter
// -> Get voter object, do checks and validate
// Admin
// -> Get login credentials
// -> Get admin change object for worker

// Requests OUT
// WS-Server - axios
// Worker - redis-pub-sub
// RedisDB (used for validation -- voterid, admin-login)

const seedData = {
    voters: [],
    admin: [],
    results: []
}

const voterIds = [];

const notificationBuffer = [];
const pulseBuffer = [];

// On initialisation, publish for seed-data and wait for response
redisPublisher.publish('seed-data', { seedData: 'voters' });
redisPublisher.publish('seed-data', { seedData: 'admin' });
redisPublisher.publish('seed-data', { seedData: 'results' });
redisPublisher.publish('voterIds', { voterIds: true });

// ----- redisEvents ------ //
redisSubscriber.on('message', (channel, message) => {
    switch (message.type) {
        // message object is { type: '', data: object}
        case 'shutdown':
            await axios.default({
                method: 'post',
                url: `${env.WSSERVER}/shutdown`,
                data: { shutdown: message.data.status }
            });
            break;
        case 'seed-data':
            // Should update frequently (on every admin and voter update)
            seedData[message.data.type] = message.data.data;
            break;
        case 'voterIds':
            voterIds = message.data;
            break;
        case 'voterStatus':
            break;
        case 'update':
            // Should update frequently (on every admin and voter update)
            if (message.data.type === 'pulse') {
                pulseBuffer.push(message.data.data);

                if (pulseBuffer.length === 10) {
                    await axios.default({
                        method: 'post',
                        url: `${env.WSSERVER}/ws-updates`,
                        data: { room: message.data.room, type: message.data.type, data: message.data.data }
                    });
                }
            } else if (message.data.type === 'notification') {
                notificationBuffer.push(message.data.data);
                if (notificationBuffer.length === 10) {
                    await axios.default({
                        method: 'post',
                        url: `${env.WSSERVER}/ws-updates`,
                        data: { room: message.data.room, type: message.data.type, data: message.data.data }
                    });
                }
            }
            break;
    }
});

// events -> 'shutdown' | 'seed-data' | 'voterIds' | 'voterStatus' | 'update'
/* 
---------- redis publisher response objects --------------
 ----seed-data
 - worker checks redis and mongodb if seed-data exists
 - returns {type: 'seed-data', data: { type: 'voters' | 'admin' | 'results', data: object}}
 ----shutdown
 - worker clears everything and sends 'ok'
 - returns {type: 'shutdown', data: { status: true | false}}
 ----voterIds
 - worker checks mongodb and redis for already voteed array, ends array
 - returns {type: 'voterIds', data: ['id1', 'id2', 'id3'...]}
 ----voterStatus
 - worker adds data, updates everything and sends back 'ok' or error
 ----update
 - after admin or voter action, it sends back the updates (should be an array);---> Create a buffer
 - returns {type: 'update', data: {type: 'pulse' | 'notification', data: object, room: 'voters' | 'admin' | 'results'}}

 ---------- redis publisher request objects --------------
 ----shutdown
 {shutdown: true}
 ----seed-data
 {seedData: 'admin' | 'voters' | 'results'}
 ----voterIds
 {voterIds: true}
 ----voterStatus
 {voterStatus: true | false}
 ----update
 {update: true, type: 'admin' | 'voters', data: object }
 
*/
redisSubscriber.subscribe('response');
// ----- redisEvents ------ //


app.post('/get-seed-data', (req, res) => { // Might need a direct route
    if (!req.body || !req.body.type) {
        res.status(401).send('Body or type is missing in request body')
        return;
    }

    res.send({ data: seedData[req.body.type] });
});

app.post('/voter-in', async (req, res) => {
    if (!req.body || !req.body.id) {
        res.status(401).send('Body or id is missing in request body')
        return;
    }

    /// Vote object is {id: 'myId', CategoryA: 'James Willis', CategoryB: 'Martin Legos'};

    try {

        if (voterIds.includes(req.body.id)) {
            return res.status(401).send('Thank you, you already voted');
        }

        // If no
        //// send this info to worker - who should send back data through pub-sub
        // return ok status
        redisPublisher.publish('update', {
            update: true,
            type: 'voters',
            data: { ...req.body }
        });

        return res.send('Great!!!');

    } catch (e) {
        console.log(e);
        return res.status(500).send('Server error, please try again');
    }

});

app.post('/admin-in', async (req, res) => {
    if (!req.body) { // --> body contains either notifications or shutdown
        res.status(401).send('Body or notifications is missing in request body')
        return;
    }

    try {
        // Admin can shut down voting process or make changes
        // --> Send signal to worker to --> Clear all databases
        // --> Send request to ws-server to shutdown everything
        if (req.body.shutdown) {
            redisClient.publish('shutdown', { shutdown: req.body.shutdown });

            await axios.default({
                method: 'post',
                url: `${env.WSSERVER}/shutdown`,
                data: { shutdown: req.body.shutdown }
            });


        } else {
            // Admin in object is [{ category: 'A', type: 'Add', candidates: [...]}]
            //// send this info to worker - who should send back data through pub-sub
            redisClient.publish('update', { update: true, type: 'admin', data: req.body.notifications });

        }

        return res.send('OK');

    } catch (e) {
        console.log(e.response ? e.response.data : e);
        /// Do not send anything
        res.status(500).send('Server error, please try again later');
    }


});


app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
})