const io = require("socket.io-client");

// sets up the connection
const socket_default = io("/wsserver/voters-room");

export const socket = socket_default;