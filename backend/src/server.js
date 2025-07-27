require("./config/dbconfig.js")
const express = require("express")
const swaggerUi = require("swagger-ui-express")
const swaggerJsdoc = require("swagger-jsdoc")
const book = require("./models/book.js")

const app = express()
const cors = require("cors")
app.use(cors())
app.use(express.json())

// Swagger setup
const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Inventory API",
			version: "1.0.0",
		},
	},
	apis: ["./src/server.js"], // path to this file
}
const swaggerSpec = swaggerJsdoc(options)

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

/**
 * @swagger
 * /api/books/add-book:
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               module:
 *                 type: string
 *               band:
 *                 type: string
 *               barcode:
 *                 type: string
 *               lessonNumber:
 *                 type: number
 *               copyNumber:
 *                 type: number
 *     responses:
 *       200:
 *         description: Book added
 */
app.post("/api/books/add-book", async (req, res) => {
	console.log("Adding book:", req.body)
	try {
		const newBook = await book.create(req.body)
		console.log("Book created:", newBook)
		res.json(newBook)
	} catch (e) {
		console.error(e)
		res.status(400).json({ error: e.message })
	}
})

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   module:
 *                     type: string
 *                   band:
 *                     type: string
 *                   barcode:
 *                     type: string
 *                   lessonNumber:
 *                     type: number
 *                   copyNumber:
 *                     type: number
 *                   status:
 *                     type: string
 *                   studentName:
 *                     type: string
 *                     nullable: true
 */
app.get("/api/books", async (_req, res) => {
	console.log("Getting books")
	try {
		const books = await book.find()
		console.log("Books found:", books)
		res.json(books)
	} catch (e) {
		console.error("Error fetching books", e)
		res.status(500).json({ error: e.message })
	}
})

app.delete("/api/books/delete-book", async (req, res) => {
	console.log("Deleting book:", req.body)
	try {
		const bookId = req.body.id

		if (!bookId) return res.status(400).json({ error: "Book ID is required" })

		const deletedBook = await book.findByIdAndDelete(bookId)

		if (!deletedBook) return res.status(404).json({ error: "Book not found" })

		res.json({ message: "Book deleted successfully", book: deletedBook })
	} catch (e) {
		console.error("Error deleting book:", e)
		res.status(500).json({ error: "Server error" })
	}
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
	console.log(`Swagger docs at http://localhost:${PORT}/api-docs`)
})
