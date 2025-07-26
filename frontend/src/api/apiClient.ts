import axios from "axios"

const API_BASE_URL = "http://localhost:3000/api"

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 5000,
	headers: {
		"Content-Type": "application/json",
	},
})

export default apiClient
