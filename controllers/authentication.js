const jwt = require('jwt-simple');
const config = require('../config');
const User = require("../models/user");

function tokenForUser(user) {

	const timestamp = new Date().getTime();
	//json web tokens, by standard, have a subject (sub) property that tells who the token belong to
	//iat - issued at time is another convention of json web token
	return jwt.encode({sub: user.id, iat:timestamp}, config.secret);
}

exports.signup = function(req, res, next) {
	const email = req.body.email;
	const password = req.body.password;

	if (!email || !password)
		return res
			.status(422)
			.send({ error: "You must provide email and password" });
	//see if the user with the given email exists
	User.findOne({ email: email }, function(err, existingUser) {
		if (err) return next(err);

		//if a user with the given email exists then return an error

		//422 means unprocessable entity
		if (existingUser) {
			return res.status(422).send({ error: "email is in use" });
		}

		//if a user with the given email does not exist then create and save user record
		const user = new User({
			email: email,
			password: password
		}); //creats an instance of the User class

		user.save(function(err) {
			if (err) return next(err);
			//respond to request indicating that the user was created
			res.json({ token: tokenForUser(user) });
		});
	});
};

exports.signin = function(req, res, next) {
	//at this point of the code, user has already been authorized
	//just need to give them a token
	res.send({token:tokenForUser(req.user)});
}
