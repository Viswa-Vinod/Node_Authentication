const passport = require("passport");
const User = require("../models/user");
const config = require("../config");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local");

//configure strategy
const jwtOptions = {
	//look at request header, specifically the value at key authorization to find the token
	jwtFromRequest: ExtractJwt.fromHeader("authorization"),
	secretOrKey: config.secret //use this to decode payload
};
//create local strategy
const localOptions = { usernameField: "email" };
const localLogin = new LocalStrategy(localOptions, function(
	email,
	password,
	done
) {
	//verify username and password
	User.findOne({ email: email }, function(err, user) {
		if (err) return done(err); //error in searching DB
		if (!user) return done(null, false); //user was not found
		//check if password is equal to user.password? plain text password needs to be compared with encrypted password
		user.comparePassword(password, function(err, isMatch) {
			if (err) return done(err);
			if (!isMatch) return done(null, false);
			return done(null, user); //done callback attaches user to req.user
		});
	});
});
//create jwt Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payLoad, done) {
	//payload is the decoded JWT token - usually has the user id and timestamp
	//see if the userid in the payload exists in the database

	User.findById(payLoad.sub, function(err, user) {
		//err will be generated if there was a problem connecting to the DB. false means no user was found
		if (err) return done(err, false);

		if (user) {
			//if user does exist call 'done' with the user
			done(null, user); //done callback attaches user to req.user
		} else done(null, false); //if user does not exist call 'done' without a user object
	});
});

//tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);
