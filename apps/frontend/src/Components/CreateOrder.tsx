import { useState } from "react"
export default function() {
    const [Tab, setTab] = useState<"Buy" | "Sell">("Buy")
    function changeTab() {
        setTab(Tab === "Buy" ? "Sell" : "Buy")
    }
    return (
        <div className="w-[25%] h-full pb-3 border-l border-gray-800">
            <div className="border-b border-gray-800">
                <div className="flex h-[65px]">
                    <div onClick={changeTab} className={`w-[50%] cursor-pointer ${Tab === "Buy" && "bg-[#0d1d1b]"} text-[#02a166] h-full flex justify-center items-center`}>
                        Buy
                    </div>
                    <div onClick={changeTab} className={`w-[50%] cursor-pointer ${Tab === "Sell" && "bg-[#291419]"} text-[#f3484b] h-full flex justify-center items-center`}>
                        Sell
                    </div>
                </div>
            </div>
            <div className="text-white px-3">
                <div className="py-3 flex gap-4">
                    <div className="border-b-2 pb-1 border-[#4c94ff]">
                        Limit
                    </div>
                    <div>
                        Market
                    </div>
                </div>
                <div className="flex text-[12px] justify-between">
                    <div className="opacity-50">
                        Available Balance
                    </div>
                    <div className="text-white">
                        0.00 SOL
                    </div>
                </div>
                <div className="my-4">
                    <div className="pr-2">
                        <p className="opacity-50 text-sm">Price</p>
                        <input type="text" className="rounded-lg text-sm h-10 w-full p-3 max-w-[100%] text-white outline-none my-2 bg-transparent border-2 border-[#202127]" />
                    </div>
                    <div className="pr-2">
                        <p className="opacity-50 text-sm">Quantity</p>
                        <input type="text" className="rounded-lg w-full text-sm h-10 p-3 max-w-[100%] text-white outline-none my-2 bg-transparent border-2 border-[#202127]" />
                    </div>
                </div>
                {
                    Tab === "Buy" ?

                        <button className="font-semibold w-full bg-[#02a166] px-2 focus:ring-blue-200 focus:none focus:outline-none hover:opacity-90 py-3 disabled:opacity-80 disabled:hover:opacity-80 text-center h-12 rounded-xl text-base ">Buy</button> :

                        <button className="font-semibold w-full bg-[#f3484b] px-2 focus:ring-blue-200 focus:none focus:outline-none hover:opacity-90 py-3 disabled:opacity-80 disabled:hover:opacity-80 text-center h-12 rounded-xl text-base ">Sell</button>
                }
            </div>
        </div>

    )
}
