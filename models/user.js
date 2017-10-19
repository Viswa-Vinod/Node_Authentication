const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

//Define our model
const userSchema = new Schema({
	email: { type: String, unique: true, lowercase: true },
	//ensures that whenever any string is saved to the DB mongoose will convert it to lower case
	password: String
});

//on Save hook, encrypt password
//before saving the model, run this function
userSchema.pre("save", function(next) {
	//get access to the user model
	const user = this;

	//generate salt, then run callback
	bcrypt.genSalt(10, function(err, salt) {
		if (err) return next(err);

		//hash (encrypt) the password using the salt, then run callback
		bcrypt.hash(user.password, salt, null, function(err, hash) {
			if (err) return next(err);

			//overwrite plain text password with encrypted password
			user.password = hash;
			next();
		});
	});
});

//a method that will compare submitted password and encrypted password
userSchema.methods.comparePassword = function(candidatePassword, callback) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
		if (err) return callback(err);
		callback(null, isMatch);
	});
}
//create the model class i.e. loads the schema to mongoose and informs it
//of the corresponding collection name in the mongooseDB

const model = mongoose.model("user", userSchema);

//export the model
module.exports = model;
