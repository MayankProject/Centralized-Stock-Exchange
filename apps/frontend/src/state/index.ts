import { atom } from "recoil";
export const user = atom<string>({
	key: 'textState', // unique ID (with respect to other atoms/selectors)
	default: String(1), // default value (aka initial value)
});
export const symbol = atom<string>({
	key: "symbol",
	default: "TATA_INR"
})
