const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voterIdSchema = new Schema({
    name: String,
    array: [{
        type: String
    }]
})

module.exports = mongoose.model('voterId', voterIdSchema)