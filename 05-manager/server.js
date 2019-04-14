const express = require('express');
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser')
const axios = require('axios');

const { redisClient, redisPublisher, redisSubscriber } = require('./connection')
const env = require('./env');

const sign = require('./passport/jwt-sign');

const port = 3004;

const app = express();

app.use(cors());
app.use(bodyParser.json());

require('./passport/jwt-strategy');

app.use(passport.initialize());

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
redisPublisher.publish('worker', { message: 'seed-data', data: { seedData: 'voters' } });
redisPublisher.publish('worker', { message: 'seed-data', data: { seedData: 'admin' } });
redisPublisher.publish('worker', { message: 'seed-data', data: { seedData: 'results' } });
redisPublisher.publish('worker', { message: 'voterIds', data: { voterIds: true } });

// ----- redisEvents ------ //
redisSubscriber.on('message', async (channel, message) => {


    console.log('MANAGER: Got message from WORKER', { message });

    switch (message.type) {
        // message object is { type: '', data: object}
        case 'shutdown':
            await axios.default({
                method: 'post',
                url: `${env.WSSERVER}/shutdown`,
                data: { shutdown: message.status }
            });
            break;
        case 'seed-data':
            // Should update frequently (on every admin and voter update)
            seedData[message.type] = message.data;
            break;
        case 'voterIds':
            voterIds = message.data;
            break;
        case 'voterStatus':
            break;
        case 'update':
            // Should update frequently (on every admin and voter update)
            if (message.data.type === 'pulse') {
                pulseBuffer.push(message.data);

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

app.get('/', (req, res) => {
    res.send('manager healthy');
});


app.post('/get-seed-data', (req, res) => { // Might need a direct route
    if (!req.body || !req.body.type) {
        res.status(401).send('Body or type is missing in request body')
        return;
    }

    console.log(`MANAGER: Requesting seed-data from WS-SERVER ---- '/get-seed-data' route, current 'process.env.VOTING_ACTIVE' value`, {
        body: req.body,
        activeStatus: process.env.VOTING_ACTIVE
    });

    redisPublisher.publish('worker', { message: 'seed-data', data: { seedData: 'voters' } });
    redisPublisher.publish('worker', { message: 'seed-data', data: { seedData: 'admin' } });
    redisPublisher.publish('worker', { message: 'seed-data', data: { seedData: 'results' } });

    if (process.env.VOTING_ACTIVE) {
        res.send({ data: seedData[req.body.type] });
    } else {
        res.send({ data: [] });
    }
});

app.post('/voter-in', async (req, res) => {
    if (!req.body || !req.body.id) {
        res.status(401).send('Body or id is missing in request body')
        return;
    }

    console.log(`MANAGER: Voter in data from VOTER client ---- '/voter-in' route, current 'process.env.VOTING_ACTIVE' value`, {
        body: req.body,
        activeStatus: process.env.VOTING_ACTIVE
    });

    if (!process.env.VOTING_ACTIVE) {
        res.status(403).send('Voting process stopped');
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
        redisPublisher.publish('worker', {
            message: 'update', data: {
                type: 'voters',
                data: { ...req.body }
            }
        });

        return res.send('Great!!!');

    } catch (e) {
        console.log(e);
        return res.status(500).send('Server error, please try again');
    }

});

app.post('/admin-login', (req, res) => {
    if (!req.body) { // --> body contains either notifications or shutdown
        res.status(401).send('Request body does not contain anything');
        return;
    }

    console.log(`MANAGER: Admin client trying to login ---- '/admin-login' route, current 'process.env.VOTING_ACTIVE' value`, {
        body: req.body,
        activeStatus: process.env.VOTING_ACTIVE
    });


    if (req.body.email !== env.ADMIN_EMAIL || req.body.password !== env.ADMIN_PASSWORD) {
        res.status(401).send("You're not admin!!!");
        return;
    }

    /// Send a token which will be used
    const { email, password } = req.body;
    sign(email, password).then(token => {
        res.send({ token });
    }).catch(e => {
        console.log(e);
        res.status(500).send(e);
    })

});

app.post('/admin-in', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    if (!req.body) { // --> body contains either notifications or shutdown
        res.status(401).send('Body or notifications is missing in request body')
        return;
    }

    console.log(`MANAGER: Admin client submitting changes ---- '/admin-in' route, current 'process.env.VOTING_ACTIVE' value`, {
        body: req.body,
        activeStatus: process.env.VOTING_ACTIVE
    });

    try {
        // Admin can shut down voting process or make changes
        // --> Send signal to worker to --> Clear all databases
        // --> Send request to ws-server to shutdown everything
        if (req.body.hasOwnProperty('shutdown')) {

            if (req.body.shutdown) {
                redisClient.publish('worker', { message: 'shutdown', data: { shutdown: req.body.shutdown } });

                await axios.default({
                    method: 'post',
                    url: `${env.WSSERVER}/shutdown`,
                    data: { shutdown: req.body.shutdown }
                });
            }
            process.env.VOTING_ACTIVE = req.body.shutdown;

        } else {
            // Admin in object isarray object of  [{ category: 'A', type: 'Add', candidates: [...]}]
            //// send this info to worker - who should send back data through pub-sub
            redisClient.publish('worker', { message: 'update', data: { type: 'admin', data: req.body.notifications } });

        }

        const { email, password } = req.body.user;

        sign(email, password).then(token => res.send({ token })).catch(e => {
            console.log(e);
            res.status(500).send(e)
        });

    } catch (e) {
        console.log(e.response ? e.response.data : e);
        /// Do not send anything
        res.status(500).send('MANAGER: Server error, please try again later');
    }

});


app.listen(port, () => {
    console.log(`MANAGER: Listening on port: ${port}`);
})