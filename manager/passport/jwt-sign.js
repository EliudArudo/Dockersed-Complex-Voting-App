const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const config = require('../env');
let expiresIn = require('../env').JWT_EXPIRATION;

expiresIn = Number(expiresIn);

module.exports = async (email, password) => {

    try {
        const salt = await bcrypt.genSalt(10);

        password = await bcrypt.hash(user.password, salt);

        // Hash the password first
        return jwt.sign({
            email,
            password
        }, config.JWT_SECRET, { expiresIn });

    } catch (e) {
        return e;
    }
}