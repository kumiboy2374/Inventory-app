import apiClient from "@/api/apiClient"
import { useState } from "react"
import type { AxiosRequestConfig, AxiosResponse } from "axios"

export default function useApi() {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse> {
		setLoading(true)
		setError(null)

		try {
			const res = await apiClient.request<T>({
				method: config.method,
				url: config.url,
				data: config.data,
			})

			return res
		} catch (e) {
			throw e
		} finally {
			setLoading(false)
		}
	}

	return { loading, error, request }
}
