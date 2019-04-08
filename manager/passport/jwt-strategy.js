const passport = require('passport');
const passportJWT = require('passport-jwt');
const bcrypt = require('bcryptjs');

const config = require('../env');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.JWT_SECRET,
    passReqToCallback: true
};

const strategy = new JwtStrategy(options, async (req, payload, next) => {


    try {

        if (!payload.email || !payload.password) {
            return next("Token is invalid");
        }

        const crypt_res = await bcrypt.compare(config.ADMIN_PASSWORD, payload.password);

        if (!crypt_res) {
            return next("Passwords encryption check failed");
        }

        const user = {
            email: payload.email,
            password: config.ADMIN_PASSWORD
        }

        return next(null, user, payload);

    } catch (e) {

        return next(e);

    }


});

passport.use(strategy);