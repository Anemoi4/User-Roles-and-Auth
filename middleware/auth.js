const jwt = require("jsonwebtoken");
const User = require("../models/User");
const roleConstants = require("../roleConstants");

function requireAuth(req, res, next) {
	const { token } = req.body;

	// Check json web token exist & is verified
	if (token) {
		jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
			if (err) {
				console.log(err.message);
				res.status(403).json("No token");
			} else {
				console.log(decodedToken);
				req.id = decodedToken.id;
				next();
			}
		});
	} else {
		res.status(403).json("No token");
	}
}

function requireRole(role) {
	return async (req, res, next) => {
		// Fetch users role
		try {
			const user = await User.findOne({ _id: req.id });
			console.log("user found... ", user);
			if (user.role !== role) return res.status(401).send("Not allowed");
			next();
		} catch (error) {
			console.log(error);
		}
	};
}

async function changeRole(req, res) {
	let { authSecret, newRole } = req.body;
	newRole = newRole.toUpperCase();
	//Make sure new role is valid
	const isValidRole = Object.values(roleConstants).find((role) => {
		return role === newRole;
	});

	if (!isValidRole) return res.status(400).send("Not valid role");

	if (authSecret !== process.env.AUTH_SECRET)
		return res.status(403).send("Forbidden");

	try {
		const user = await User.findOne({ _id: req.id }).exec();
		// Make sure user is not already the given role
		if (user.role === newRole)
			return res.status(400).send("User is already " + newRole + " role");

		user.role = newRole;
		await user.save();
		user.role = res.send("New role has been assigned");
	} catch (error) {
		console.log(error);
	}
}

module.exports = {
	requireAuth,
	requireRole,
	changeRole,
};
