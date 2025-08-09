import { MODULES } from "@/enum/module"

export type Book = {
	_id: string
	module: MODULES
	barcode: string
	band: "A" | "B" | "C" | "D" | "E" | "F"
	copyNumber: number
	lessonNumber: number
	status: boolean
	studentName?: string | null
	coverImage: string
}

export type UserRole = "Main" | "Band A" | "Band B"

export type User = {
	username: string
	role: UserRole
}
