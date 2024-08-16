import { DepthResponse, TradeApiResponse } from "@repo/types";
import { atom, GetRecoilValue, selector } from "recoil";
import { getDepth } from "../utils";
export const user = atom<string>({
	key: 'textState', // unique ID (with respect to other atoms/selectors)
	default: String(1), // default value (aka initial value)
});
export const symbol = atom<string>({
	key: "symbol",
	default: "TATA_INR",
})
const DepthData = selector({
	key: "Depth Data",
	get: async ({ get }: { get: GetRecoilValue }) => {
		const response = await getDepth(get(user), get(symbol))
		return (response.data)
	},
	dangerouslyAllowMutability: true
})
export const TradesState = atom<TradeApiResponse>({
	key: "Trades",
	default: []
})
export const DepthState = atom<DepthResponse>({
	key: "Depth",
	default: DepthData,
	dangerouslyAllowMutability: true
})
