const User = require("../models/User");
const jwt = require("jsonwebtoken");

function handleErrors(err) {
	let errors = { email: "", password: "" };
	console.log(err.message, err.code);

	// Incorrect email
	if (err.message === "Incorrect email") {
		errors.email = "That email is not registered";
	}

	// Incorrect password
	if (err.message == "Incorrect password") {
		errors.password = "That password is incorrect";
	}

	// Duplicate rror code
	if (err.code === 11000) {
		errors.email = "That email is already registered";
		return errors;
	}

	// Validation errors
	if (err.message.includes("user validation failed")) {
		Object.values(err.errors).forEach(({ properties }) => {
			errors[properties.path] = properties.message;
		});
	}

	return errors;
}

const maxAge = 3 * 24 * 60 * 60;

function createToken(id) {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: maxAge,
	});
}

async function signUp(req, res) {
	const { email, password } = req.body;

	try {
		let user = await User.create({ email, password });

		// Create JWT and send it to the client
		const token = createToken(user._id);
		console.log(token);
		res.status(201).json({ token });
	} catch (error) {
		let errors = handleErrors(error);
		res.status(400).json({ errors });
	}
}

async function login(req, res) {
	const { email, password } = req.body;

	try {
		const user = await User.login(email, password);
		const token = createToken(user._id);
		console.log(token);
		res.status(200).json({ token });
	} catch (error) {
		const errors = handleErrors(error);
		res.status(400).json({ errors });
	}
}

module.exports = {
	login,
	signUp,
};
