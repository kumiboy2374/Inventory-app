const mongoose = require("mongoose")

const MONGO_URI =
	"mongodb+srv://sykumail04:kumail123@inventory-app.4wog6a7.mongodb.net/?retryWrites=true&w=majority&appName=inventory-app"

mongoose
	.connect(MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("MongoDB connection error:", err))

module.exports = mongoose
