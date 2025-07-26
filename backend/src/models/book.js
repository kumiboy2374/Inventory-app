const mongoose = require("../config/dbconfig")

const bookSchema = new mongoose.Schema(
	{
		module: { type: String, required: true },
		band: { type: String, required: true },
		barcode: { type: String, required: true },
		lessonNumber: { type: Number, required: false },
		copyNumber: { type: Number, required: true },
	},
	{ timestamps: true }
)

module.exports = mongoose.model("Book", bookSchema)
