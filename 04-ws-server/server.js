/// Important - WS Server is a One way to Voter, Admin, Results
/// ---> It ONLY gets updates from manager, sends to clients

///// https://socket.io/docs/rooms-and-namespaces/

/// SERVER
// Create a namespace
// var nsp = io.of('/my-namespace');
// nsp.on('connection', function (socket) {
// });
// nsp.emit('hi', 'everyone!');
// ---> Create a namespace, or socket connecting, get and send seed data back (Just using axios)
// ---> On getting seed data, store it in data, on another connection, check if data is the same, if not, get fresh seed from manager
// ---> On route post from Manager, npm.emit(message, val);

/// CLIENT
// var socket = io('/my-namespace');

// STEPS
// Create socket.io with 'voters', 'admin', and 'results' rooms
// Add client side connections to clients
// On each rooms - client connecting, send request to manager to get seed data and send back data
// ---> Manager gets data from redis
//  Create routes for updating each room according to different types of data

const http = require('http');
const socketIO = require('socket.io');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const port = 3003;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const votersRoom = io.of('/voters-room');
const adminRoom = io.of('/admin-room');
const resultsRoom = io.of('/results-room');

const env = require('./env');

app.use(cors());

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

// app.use(bodyParser.json());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

async function getSeedData(type, noAdmin) {

    try {

        let res = await axios.default({
            method: 'post',
            url: `manager://${env.MANAGER}:3004/get-seed-data`,
            data: { type, noAdmin }
        });
        res = res.data;

        return res;
    } catch (e) {
        throw new Error(e.response ? e.response.data : e);
    }
}

votersRoom.on('connection', function (socket) {
    console.log(`WS-SERVER -> voters room: New connection '${socket.id}' connected`);
    getSeedData('voters').then((data) => {

        console.log(`WS-SERVER -> voters room: Data got from MANAGER, about to be sent to VOTER of socket '${socket.id}'`, { data });
        socket.emit('seed-data', data);
    }).catch(e => {
        console.log(e);
    })
});

adminRoom.on('connection', function (socket) {
    console.log(`WS-SERVER -> admin room: New connection '${socket.id}' connected`);
    getSeedData('admin').then((data) => {

        console.log(`WS-SERVER -> admin room: Data got from MANAGER, about to be sent to ADMIN of socket ${socket.id}`, { data });
        socket.emit('seed-data', data);
    }).catch(e => {
        console.log(e);
    })
});

resultsRoom.on('connection', function (socket) {
    console.log(`WS-SERVER -> results room: New connection '${socket.id}' connected`);
    getSeedData('results').then((data) => {

        console.log(`WS-SERVER -> results room: Data got from MANAGER, about to be sent to RESULTS of socket ${socket.id}`, { data });
        socket.emit('seed-data', data);


    }).catch(e => {
        console.log(e);
    })
});

// votingRoom.emit('seed', data);
// adminRoom.emit('seed', data);
// resultsRoom.emit('seed', data);

app.get('/', (req, res) => {
    res.send('ws-server healthy');
});

app.post('/ws-updates', (req, res) => {
    // req.body has -> {room: '', type:'pulse/notification', data}
    // pulse is category object with current votes
    // notification is update notifications
    if (!req.body || !req.body.room || !req.body.type || !req.body.data) {
        res.status(401).send('A property missing from request object');
        return;
    }

    console.log(`WS-SERVER: Update from MANAGER ---- '/ws-updates' route`, {
        room: req.body.room,
        type: req.body.type,
        data: req.body.data
    });

    let room;
    if (req.body.room === 'voters') {
        room = votersRoom;
    } else if (req.body.room === 'admin') {
        room = adminRoom;
    } else if (req.body.room === 'results') {
        room = resultsRoom;
    }

    console.log(`WS-SERVER: About to send update to '${req.body.room}' room`, {
        type: req.body.type, // either pulse or notification
        data: req.body.data,
    });

    room.emit('update', {
        type: req.body.type, // either pulse or notification
        data: req.body.data,
    });

    res.send('Successful');
});

app.post('/admin-seed-update', async (req, res) => {
    // req.body has -> {room: '', type:'pulse/notification', data}
    // pulse is category object with current votes
    // notification is update notifications
    if (!req.body || !req.body.data) {
        res.status(401).send('A property missing from request object');
        return;
    }

    console.log(`WS-SERVER: Got admin seed data and about to send to 'admins' room ---- '/admin-seed-update' route`, {
        data: req.body.data
    });

    adminRoom.emit('seed-data', { data: req.body.data });

    if (req.body.data.length === 0) { // send empty seed data to everyone
        resultsRoom.emit('shutdown', true);
        votersRoom.emit('shutdown', true);
    } else { // If there's new seed data

        try {
            const resultData = await getSeedData('results', true);
            const votersData = await getSeedData('voters', true);

            resultsRoom.emit('seed-data', resultData);
            votersRoom.emit('seed-data', votersData);

        } catch (e) {
            console.log(e);
        }


    };

    res.send('Successful');
});

app.post('/shutdown', (req, res) => {

    console.log(`WS-SERVER: Shutdown signal from MANAGER ---- '/shutdown' route`, {
        shutdown: req.body.shutdown
    });

    if (req.body.shutdown === true) {
        resultsRoom.emit('seed-data', { data: null });
        adminRoom.emit('seed-data', { data: null });
        votersRoom.emit('seed-data', { data: null });
    }

    res.send('OK');

});


server.listen(port, () => {
    console.log(`WS-SERVER: Server running on port ${port}`)
});