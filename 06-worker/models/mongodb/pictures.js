const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const picturesSchema = new Schema({
    userName: String,
    picture: String
})

module.exports = mongoose.model('picture', picturesSchema)