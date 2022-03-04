const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, "Please enter an email"],
		unique: true,
		lowercase: true,
		validate: [isEmail, "Please enter a valid email"],
	},
	password: {
		type: String,
		required: [true, "Please enter an password"],
		minlength: [6, "Minimum password length is 6 characters"],
	},
	role: {
		type: String,
		default: "BASIC",
		required: false,
	},
});

// Hash the users password
userSchema.pre("save", async function (next) {
	try {
		const salt = await bcrypt.genSalt();
		this.password = await bcrypt.hash(this.password, salt);
	} catch (error) {
		console.error(error);
	}

	next();
});

// Static method to login user
userSchema.statics.login = async function (email, password) {
	const user = await this.findOne({ email });
	if (user) {
		const auth = await bcrypt.compare(password, user.password);
		if (auth) {
			return user;
		}
		throw Error("Incorrect password");
	}
	throw Error("Incorrect email");
};

const User = mongoose.model("testUser", userSchema);
module.exports = User;
