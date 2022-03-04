require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const { requireAuth, requireRole, changeRole } = require("./middleware/auth");

app.use(express.json());

// Connect to DB
const DBURI = process.env.DB_URI;
mongoose
	.connect(DBURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		autoIndex: true,
	})
	.then((result) =>
		app.listen(3000, () => console.log("listening at port 3000"))
	)
	.catch((err) => {
		console.log(err);
	});

app.get("/", (req, res) => {
	res.send("Home page");
});

app.post("/user", requireAuth, (req, res) => {
	res.send("User page");
});

app.post("/admin", requireAuth, requireRole("ADMIN"), (req, res) => {
	res.send("Admin page");
});

app.post("/auth/change-role", requireAuth, changeRole);

app.use(authRoutes);
