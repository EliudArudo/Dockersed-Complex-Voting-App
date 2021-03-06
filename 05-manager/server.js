const express = require('express');
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser')
const axios = require('axios');

const { redisPublisher, redisSubscriber } = require('./connection')
const env = require('./env');

const sign = require('./passport/jwt-sign');

const port = 3004;

const app = express();

app.use(cors());
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

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

let voterIds = [];

let notificationBuffer = [];
let pulseBuffer = [];
// Use 10 for testing, and 1 for dev
const bufferLimit = 1;

// On initialisation, publish for seed-data and wait for response

setTimeout(() => { // Wait for worker full connectivity
    redisPublisher.publish('worker', JSON.stringify({ message: 'seed-data', data: { seedData: 'voters' } }));
    redisPublisher.publish('worker', JSON.stringify({ message: 'seed-data', data: { seedData: 'admin' } }));
    redisPublisher.publish('worker', JSON.stringify({ message: 'seed-data', data: { seedData: 'results' } }));
    redisPublisher.publish('worker', JSON.stringify({ message: 'voterIds', data: { voterIds: true } }));
}, 7000);


// ----- redisEvents ------ //
redisSubscriber.on('message', async (channel, message) => {

    message = JSON.parse(message);

    try {

        switch (message.type) {
            // message object is { type: '', data: object}
            case 'shutdown':
                // DO NOTHING, since empty data is sent to ws-server
                // await axios.default({
                //     method: 'post',
                //     url: `wsserver://${env.WSSERVER}:3003/shutdown`,
                //     data: { shutdown: message.status }
                // });

                break;
            case 'seed-data':
                // Should update frequently (on every admin and voter update)

                if (!Array.isArray(message.data)) { // Meaning it's JSON
                    message.data = JSON.parse(message.data);

                    // message.data = message.data.map(item => {
                    //     item.candidates = item.candidates.map(person => {
                    //         person.picture = "data:application/octet-stream;base64," + person.picture;
                    //         return person;
                    //     })
                    //     return item;
                    // });
                }

                seedData[message.room] = message.data;

                /// find a way to send data to admin
                if (message.room === 'admin') {

                    await axios.default({
                        method: 'post',
                        url: `wsserver://${env.WSSERVER}:3003/admin-seed-update`,
                        data: {
                            data: message.data
                        }
                    });
                }

                break;
            case 'voterIds':
                voterIds = message.data;
                break;
            case 'voterStatus':
                break;
            case 'update':
                // Should update frequently (on every admin and voter update)

                if (message.data.voterIds) {

                    voterIds = message.data.voterIds;
                }


                if (message.data.type === 'pulse') {
                    pulseBuffer.push(message.data);

                    if (pulseBuffer.length >= bufferLimit) {
                        await axios.default({
                            method: 'post',
                            url: `wsserver://${env.WSSERVER}:3003/ws-updates`,
                            data: { room: message.data.room, type: message.data.type, data: message.data.data, shutdown: process.env.VOTING_ACTIVE }
                        });

                        pulseBuffer = [];
                    }
                } else if (message.data.type === 'notification') {
                    notificationBuffer.push(message.data.data);
                    /// restore buffer later


                    if (notificationBuffer.length >= bufferLimit) {
                        await axios.default({
                            method: 'post',
                            url: `wsserver://${env.WSSERVER}:3003/ws-updates`,
                            data: { room: message.data.room, type: message.data.type, data: message.data.data, shutdown: process.env.VOTING_ACTIVE }
                        });

                        notificationBuffer = [];
                    }
                }
                break;
        }

    } catch (e) {
        console.log(e.response.data);
        throw new Error(e);
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

    if (!req.body.noAdmin) {
        // Prevent cyclic redundancy
        redisPublisher.publish('worker', JSON.stringify({ message: 'seed-data', data: { seedData: 'admin' } }));
    }

    redisPublisher.publish('worker', JSON.stringify({ message: 'seed-data', data: { seedData: 'voters' } }));
    redisPublisher.publish('worker', JSON.stringify({ message: 'seed-data', data: { seedData: 'results' } }));

    let data = [];

    if (process.env.VOTING_ACTIVE) {
        data = seedData[req.body.type];
    }
    res.send({ data, shutdown: process.env.VOTING_ACTIVE === "false" });

});

app.post('/voter-in', async (req, res) => {

    // Checks

    if (!req.body || !req.body.id) {
        res.status(401).send('Body or id is missing in request body')
        return;
    }

    // In case someone hacks client checks
    if (Object.keys(req.body).length === 1) {
        res.status(401).send('Your vote is not valid, please try again later');
        return;
    }

    if (req.body.id.length < 5) {
        res.status(401).send('Please enter an id of 5 or more characters');
        return;
    }

    // For database checks and uniformity
    req.body.id = String(req.body.id).trim().toLowerCase();

    const unwantedCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    if (unwantedCharacters.test(req.body.id)) {
        res.status(401).send('You id has unexpected characters, please reformat and try again');
        return;
    }

    // Checks

    if (seedData['voters'].length === 0) {
        res.status(403).send('Voting process stopped');
        return;
    }

    /// Vote object is {id: 'myId', CategoryA: 'James Willis', CategoryB: 'Martin Legos'};

    try {

        if (voterIds.includes(req.body.id)) {
            res.status(401).send('Thank you, you already voted');
            return;
        }

        // If no
        //// send this info to worker - who should send back data through pub-sub
        // return ok status
        redisPublisher.publish('worker', JSON.stringify({
            message: 'update', data: {
                type: 'voters',
                data: { ...req.body }
            }
        }));

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

    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
        res.status(500).send('Server not yet initialised, contact your DevOps team for more info');
        return;
    }


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

    // Changed here
    if (!process.env.VOTING_ACTIVE && !req.body.hasOwnProperty('shutdown')) {
        res.status(401).send('Voting Process is on shutdown, please start process to submit data');
        return;
    }


    try {
        // Admin can shut down voting process or make changes
        // --> Send signal to worker to --> Clear all databases
        // --> Send request to ws-server to shutdown everything
        if (req.body.hasOwnProperty('shutdown')) {

            if (req.body.shutdown) {
                // Worke should return empty data for everyone;
                redisPublisher.publish('worker', JSON.stringify({ message: 'shutdown', data: { shutdown: req.body.shutdown } }));

            }
            process.env.VOTING_ACTIVE = String(req.body.shutdown);

        } else { // Updates to voting data
            // Admin in object isarray object of  [{ category: 'A', type: 'Add', candidates: [...]}]
            //// send this info to worker - who should send back data through pub-sub

            redisPublisher.publish('worker', JSON.stringify({ message: 'update', data: { type: 'admin', data: req.body.notifications } }));

        }

        const { email, password } = req.user;

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
