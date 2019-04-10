const io = require("socket.io-client");

// sets up the connection
const socket_default = io("/wsserver/admin-room");

module.exports = socket_default;