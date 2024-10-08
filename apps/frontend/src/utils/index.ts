import { BalanceResponse, DepthResponse, CreateOrderResponse, createOrderPayload, tickerResponse } from "@repo/types"
import { AxiosResponse } from "axios"
import axios from "axios"
export const API_URL = "http://localhost:3000"
//import problem
export function getTicker(symbol: string): Promise<AxiosResponse<tickerResponse>> {
	return axios.get<tickerResponse>(`${API_URL}/ticker`, {
		params: {
			symbol
		}
	})
}
export function getBalance(clientId: string): Promise<AxiosResponse<BalanceResponse>> {
	return axios.get<BalanceResponse>(`${API_URL}/balance`, {
		params: {
			clientId
		}
	})
}
export function getDepth(clientId: string, symbol: string): Promise<AxiosResponse<DepthResponse>> {
	return axios.get<DepthResponse>(`${API_URL}/depth`, {
		params: {
			clientId,
			symbol
		}
	})
}
export async function createOrder(payload: createOrderPayload): Promise<CreateOrderResponse> {
	const { data } = await axios.post<CreateOrderResponse>(`${API_URL}/order`, payload)
	return data
}
