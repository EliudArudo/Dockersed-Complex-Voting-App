const io = require("socket.io-client");

// sets up the connection
const socket_default = io("/ws/results-room");

export const socket = socket_default;