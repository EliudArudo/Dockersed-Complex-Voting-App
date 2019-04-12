/// Important - WS Server is a One way to Voter, Admin, Results
/// ---> It ONLY gets updates from manager, sends to clients

///// https://socket.io/docs/rooms-and-namespaces/

/// SERVER
// Create a namespace
// var nsp = io.of('/my-namespace');
// nsp.on('connection', function (socket) {
//     console.log('someone connected');
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

app.use(bodyParser.json());

async function getSeedData(type) {

    try {

        let res = await axios.default({
            method: 'post',
            url: `${env.MANAGER}/get-seed-data`,
            data: { type }
        });
        res = res.data;

        return res;
    } catch (e) {
        return e.response ? e.response.data : e;
    }
}

votersRoom.on('connection', function (socket) {
    console.log('Someone connected to voting room');
    getSeedData('voters').then((data) => {
        socket.emit('seed-data', data)

        if (!data.data || data.data.length === 0) {
            votersRoom.emit('seed-data', data);
        } else {
            socket.emit('seed-data', data);
        }
    }).catch(e => {
        console.log(e);
    })
});

adminRoom.on('connection', function (socket) {
    console.log('Someone connected to admin room');
    getSeedData('admin').then((data) => {

        if (!data.data || data.data.length === 0) {
            adminRoom.emit('seed-data', data);
        } else {
            socket.emit('seed-data', data);
        }
    }).catch(e => {
        console.log(e);
    })
});

resultsRoom.on('connection', function (socket) {
    console.log('Someone connected to results room');
    getSeedData('results').then((data) => {
        if (!data.data || data.data.length === 0) {
            resultsRoom.emit('seed-data', data);
        } else {
            socket.emit('seed-data', data);
        }

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

    let room;
    if (req.body.room === 'voters') {
        room = votingRoom;
    } else if (req.body.room === 'admin') {
        room = adminRoom;
    } else if (req.body.room === 'results') {
        room = resultsRoom;
    }

    room.emit('update', {
        type: req.body.data, // either pulse or notification
        data: req.body.data,
    });

    res.send('Successful');
});

app.post('/shutdown', (req, res) => {

    if (req.body.shutdown === true) {
        resultsRoom.emit('seed-data', { data: null });
        adminRoom.emit('seed-data', { data: null });
        votersRoom.emit('seed-data', { data: null });
    }

    res.send('OK');

});


server.listen(port, () => {
    console.log(`Server running on port ${port}`)
});