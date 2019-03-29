const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const axios = require('axios');

const { redisClient } = require('./connection')

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


app.post('/get-seed-data', (req, res) => {
    if (!req.body || !req.body.type) {
        res.status(401).send('Body or type is missing in request body')
        return;
    }

    /// Check shutdown status, if shutdown active, send [] 
    /// Get seed data from redis and send back
});

app.post('/voter-in', (req, res) => {
    if (!req.body || !req.body.id) {
        res.status(401).send('Body or id is missing in request body')
        return;
    }

    /// Vote object is {id: 'myId', CategoryA: 'James Willis', CategoryB: 'Martin Legos'};

    /// Check id id has voted before
    //  If yes, return 401 - 'You already voted'
    // If no
    //// send this info to worker - who should send back data through pub-sub
    // return ok status

});

app.post('/admin-in', (req, res) => {
    if (!req.body || !req.body.notifications) {
        res.status(401).send('Body or notifications is missing in request body')
        return;
    }

    // Admin can shut down voting process or make changes
    // Make shutdown process

    // Admin in object is [{ category: 'A', type: 'Add', candidates: [...]}]
    //// send this info to worker - who should send back data through pub-sub
    // return ok status
});


app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
})