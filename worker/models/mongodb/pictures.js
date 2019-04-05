const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const picturesSchema = new Schema({
    userName: String,
    picture: Buffer
})

module.exports = mongoose.model('picture', picturesSchema)