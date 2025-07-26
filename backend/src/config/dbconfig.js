const mongoose = require("mongoose")

const MONGO_URI = process.env.NEXT_MONGO_URI

mongoose
	.connect(MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("MongoDB connection error:", err))

module.exports = mongoose
