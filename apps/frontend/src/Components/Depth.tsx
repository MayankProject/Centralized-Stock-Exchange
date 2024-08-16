import { useEffect, useState } from "react"
import { DepthResponse } from "@repo/types"
import { getDepth } from "../utils"
import { useRecoilValue } from "recoil"
import { symbol, user } from "../state"
import { WebSocketManager } from "../utils/WebSocketManager"
function TwoDArrayToObject(arr: [number, number][]) {
    return arr.reduce((acc: { [key: string]: string }, [key, value]) => {
        acc[String(key)] = String(value);
        return acc;
    }, {})
}
export default function() {
    const [Depth, setDepth] = useState<DepthResponse>({ e: "DEPTH", s: "", bids: [], asks: [] })
    const userId = useRecoilValue(user)
    const _symbol = useRecoilValue(symbol)
    const depthUpdateCallback = (message: DepthResponse) => {
        const { bids, asks } = { ...Depth }
        console.log(bids, asks, Depth)
        const UpdatedDepth = {
            bids: TwoDArrayToObject(message.bids),
            asks: TwoDArrayToObject(message.asks)
        }
        // Updating the existing ones
        asks.forEach((ask) => {
            if (UpdatedDepth.asks[ask[0]]) {
                ask[1] = Number(UpdatedDepth.asks[ask[0]])
                delete UpdatedDepth.asks[ask[0]]
            }
        })
        bids.forEach((bid) => {
            if (UpdatedDepth.bids[bid[0]]) {
                bid[1] = Number(UpdatedDepth.bids[bid[0]])
                delete UpdatedDepth.bids[bid[0]]
            }
        })
        // Pushing the new ones
        Object.entries(UpdatedDepth.asks).forEach(([price, quantity]) => {
            asks.push([Number(price), Number(quantity)])
        })
        Object.entries(UpdatedDepth.bids).forEach(([price, quantity]) => {
            bids.push([Number(price), Number(quantity)])
        })

        // Removing the empty ones
        const _bids = bids.filter((a) => a[1] !== 0)
        const _asks = asks.filter((a) => a[1] !== 0)

        // Arranging in order
        _bids.sort((a, b) => b[0] - a[0])
        _asks.sort((a, b) => b[0] - a[0])
        setDepth({ ...Depth, bids: _bids, asks: _asks })
    }
    useEffect(() => {
        getDepth(userId, _symbol).then((response) => {
            response.data.bids.sort((a, b) => b[0] - a[0])
            response.data.asks.sort((a, b) => b[0] - a[0])
            depthUpdateCallback(response.data)
        })
        WebSocketManager.getInstance().sendMessage({
            method: "SUBSCRIBE",
            params: [`depth@${_symbol}`]
        })
        WebSocketManager.getInstance().attachCallback("DEPTH", depthUpdateCallback)
        return () => {
            WebSocketManager.getInstance().sendMessage({
                method: "UNSUBSCRIBE",
                params: [`depth@${_symbol}`]
            })
        }
    }, [])
    return (
        <div className="Depth text-[12px]" >
            <div className="asks" >
                <div className="flex font-semibold justify-between mb-3 mr-2" >
                    <h1>Price(INR) </h1>
                    < h1 className="opacity-50" > Size(TATA) </h1>
                    < h1 className="opacity-50" > TOTAL(TATA) </h1>
                </div>
                {
                    Depth.asks.map((ask) => {
                        return ask.length ? <div className="flex p-1 px-1 pl-0 my-[2px] relative opacity-75 text-[13px] font-medium justify-between" >
                            <div className="w-[40%] h-full graph top-0 right-0 bg-[#291419] absolute" > </div>
                            < h1 className="text-[#fd4b4e]" > {ask[0]} </h1>
                            < h1 className="" > {ask[1]} </h1>
                            < h1 className="" > 227.56 </h1>
                        </div> : ""
                    })
                }
            </div>
            < h1 className="text-xl text-[#02a166] my-2 font-semibold" > 50.125 </h1>
            < div className="bids" >
                {
                    Depth.bids.map((bid) => {
                        return bid.length ? <div className="flex p-1 px-1 pl-0 my-[2px] relative opacity-75 text-[13px] font-medium justify-between" >
                            <div className="w-[10%] h-full graph top-0 right-0 bg-[#0d1d1b] absolute" > </div>
                            < h1 className="text-[#02a166]" > {bid[0]} </h1>
                            < h1 className="" > {bid[1]} </h1>
                            < h1 className="" > 21.56 </h1>
                        </div> : ""
                    })
                }

            </div>
        </div>
    )

}
