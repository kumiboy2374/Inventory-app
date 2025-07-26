export type Book = {
	id: string
	module: string
	barcode: string
	band: "A" | "B" | "C" | "D" | "E" | "F"
	copyNumber: number
	lessonNumber: number
	status: "available" | "lent"
	studentName?: string
	coverImage: string
}

export type UserRole = "main" | "bandA" | "bandB"

export type User = {
	username: string
	role: UserRole
}
