const mongoose = require("../config/dbconfig")

const bookSchema = new mongoose.Schema(
	{
		_id: { type: String, required: true },
		module: { type: String, required: true },
		band: { type: String, required: true },
		barcode: { type: String, required: true },
		lessonNumber: { type: Number, required: false },
		copyNumber: { type: Number, required: true },
		status: { type: Boolean, default: true }, // true for available, false for lent
		studentName: { type: String, required: false },
	},
	{ timestamps: true }
)

module.exports = mongoose.model("Book", bookSchema)
