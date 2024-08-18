import CreateOrder from "./CreateOrder";
import Kline from "./Kline";
import BooksAndTrades from "./BooksAndTrades";
import MarketDetails from "./MarketDetails";
import { WebSocketManager } from "../utils/WebSocketManager";
import { useRecoilState, useRecoilValue } from "recoil";
import { DepthState, symbol, TradesState } from "../state";
import { DepthResponse, TradeStreamResponse } from "@repo/types";
import { useEffect } from "react";

function TwoDArrayToObject(arr: [number, number][]) {
    return arr.reduce((acc: { [key: string]: string }, [key, value]) => {
        acc[String(key)] = String(value);
        return acc;
    }, {})
}

function SubscribeUtilities(symbol: string, callbacks: { [key: string]: (arg0: any) => void }) {
    WebSocketManager.getInstance().sendMessage({
        method: "SUBSCRIBE",
        params: [`depth@${symbol}`]
    })
    WebSocketManager.getInstance().sendMessage({
        method: "SUBSCRIBE",
        params: [`trade@${symbol}`]
    })
    for (const trigger in callbacks) {
        WebSocketManager.getInstance().attachCallback(trigger, callbacks[trigger])
    }
}

export default function() {
    const _symbol = useRecoilValue(symbol)
    const [Depth, setDepth] = useRecoilState(DepthState)
    const [Trades, setTrades] = useRecoilState(TradesState)

    const depthUpdateCallback = (message: DepthResponse) => {
        const { bids, asks } = { ...Depth }
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

    function tradeUpdateCallback(data: TradeStreamResponse) {
        setTrades([{ amount: data.p, quantity: data.q }, ...Trades])
    }

    useEffect(() => {
        // Initiating the Existing Depth
        depthUpdateCallback(Depth)

        const callBacks = {
            "DEPTH": depthUpdateCallback,
            "TRADE": tradeUpdateCallback
        }

        SubscribeUtilities(_symbol, callBacks)

        return () => {
            WebSocketManager.getInstance().sendMessage({
                method: "UNSUBSCRIBE",
                params: [`trade@${_symbol}`]
            })
            WebSocketManager.getInstance().sendMessage({
                method: "UNSUBSCRIBE",
                params: [`depth@${_symbol}`]
            })
        }
    }, [symbol])

    return (
        <div className= "flex h-full" >
        <div className="w-[75%] h-full border-b border-gray-800" >
            {/* -- Details Nav --  */ }
            < MarketDetails />
            {/* -- Kline and Books Trades Tab -- */ }
            < div className = "w-full flex border border-gray-800" >
                <div className="Chart flex-1" >
                    <Kline />
                    </div>
    {/* -- Books Trades Tabs --  */ }
    <BooksAndTrades />
        </div>
        </div >
        < CreateOrder />
        </div >
    )
}
