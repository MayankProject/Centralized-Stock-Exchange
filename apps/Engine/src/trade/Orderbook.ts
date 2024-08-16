import { DepthResponse, fill, order, side } from "@repo/types";
export const quoteAsset = "INR"
export class Orderbook {
        bids: order[];
        asks: order[];
        baseAsset: string;
        quoteAsset: string = quoteAsset;
        symbol: string;
        constructor(baseAsset: string) {
                this.bids = [];
                this.asks = [];
                this.baseAsset = baseAsset
                this.symbol = `${baseAsset}_${this.quoteAsset}`
        }
        createOrder(order: order & { side: side }): { fills: fill[], executedQuantity: number, updatedDepthParams: DepthResponse } {
                const { fills, executedQuantity, updatedDepthParams } = this.matchOrder({ ...order })
                //Adding to OrderBook if not completely executed
                let accumulatedQuantity
                if (executedQuantity < order.quantity) {
                        switch (order.side) {
                                case "bid":
                                        this.addToOrderBook({ ...order, quantity: order.quantity - executedQuantity }, this.bids)
                                        accumulatedQuantity = this.bids.filter(e => e.amount === order.amount).reduce((total, order) => total + order.quantity, 0)
                                        updatedDepthParams.bids.push([order.amount, accumulatedQuantity])
                                        break;
                                case "ask":
                                        this.addToOrderBook({ ...order, quantity: order.quantity - executedQuantity }, this.asks)
                                        accumulatedQuantity = this.asks.filter(e => e.amount === order.amount).reduce((total, order) => total + order.quantity, 0)
                                        updatedDepthParams.asks.push([order.amount, accumulatedQuantity])
                                        break;
                        }
                }
                return { fills, executedQuantity, updatedDepthParams }
        }
        cancelOrder(orderId: string) {
                const index = this.bids.findIndex(o => o.orderId === orderId)
                if (index === -1) {
                        const index = this.asks.findIndex(o => o.orderId === orderId)
                        const order = { ...this.asks[index], side: "ask" as side }
                        this.asks.splice(index, 1)
                        return order
                }
                const order = { ...this.bids[index], side: "bid" as side }
                this.bids.splice(index, 1)
                return order
        }
        matchOrder(order: order & { side: side }): {
                fills: fill[],
                executedQuantity: number,
                updatedDepthParams: DepthResponse
        } {

                let { executedQuantity, fills }: { executedQuantity: number, fills: fill[] } = { executedQuantity: 0, fills: [] }
                let updatedDepthParams;
                switch (order.side) {
                        case "bid":
                                const matched_bid = this.compareOrderWithBook(this.asks.sort((a, b) => a.amount - b.amount), order, (compare_order: order, order: order) => {
                                        return compare_order.amount <= order.amount && order.clientId !== compare_order.clientId
                                })
                                executedQuantity = matched_bid.executedQuantity
                                fills = matched_bid.fills
                                updatedDepthParams = matched_bid.updatedDepthParams
                                break

                        case "ask":
                                const matched_ask = this.compareOrderWithBook(this.bids.sort((a, b) => b.amount - a.amount), order, (compare_order: order, order: order) => {
                                        return (order.amount <= compare_order.amount && order.clientId !== compare_order.clientId)
                                })
                                executedQuantity = matched_ask.executedQuantity
                                fills = matched_ask.fills
                                updatedDepthParams = matched_ask.updatedDepthParams
                                break

                }
                return {
                        fills,
                        executedQuantity,
                        updatedDepthParams
                }
        }
        compareOrderWithBook(book: order[], order: order & { side: side }, compare: (a: order, b: order) => boolean): { fills: fill[], executedQuantity: number, updatedDepthParams: DepthResponse } {
                // Matches the order with orderbook
                let executedQuantity = 0
                let fills: fill[] = []
                const updatedDepthParams: DepthResponse = {
                        e: "DEPTH",
                        s: "",
                        bids: [],
                        asks: []
                }
                for (let index = 0; index < book.length; index++) {
                        const compare_order = book[index];
                        if (compare(compare_order, order)) {
                                let minimum = Math.min(compare_order.quantity, order.quantity)
                                let executedPrice = Math.min(compare_order.amount, order.amount)
                                executedQuantity += minimum
                                order.quantity -= minimum
                                compare_order.quantity -= minimum
                                fills.push({
                                        orderId: compare_order.orderId,
                                        price: executedPrice,
                                        quantity: minimum,
                                        clientId: compare_order.clientId,
                                        completed: compare_order.quantity ? false : true
                                })
                                if (order.side === "bid") {
                                        updatedDepthParams["asks"].push([compare_order.amount, compare_order.quantity])
                                }
                                else {
                                        updatedDepthParams["bids"].push([compare_order.amount, compare_order.quantity])
                                }
                                if (order.quantity === 0) {
                                        break
                                }
                        }
                }
                return {
                        fills,
                        executedQuantity,
                        updatedDepthParams
                }
        }
        getDepth(data?: {
                bids: order[],
                asks: order[]
        }): DepthResponse {
                const depth: DepthResponse = {
                        e: "DEPTH",
                        s: this.symbol,
                        bids: [],
                        asks: []
                }
                const sortedBids = data?.bids || this.bids.sort((a, b) => b.amount - a.amount)
                const sortedAsks = data?.asks || this.asks.sort((a, b) => a.amount - b.amount)
                if (sortedAsks.length) for (let id = 0; id < sortedAsks.length; id++) {
                        const ask = sortedAsks[id];
                        if (depth.asks.length && depth.asks[depth.asks.length - 1][0] === ask.amount) {
                                depth.asks[depth.asks.length - 1] = [depth.asks[depth.asks.length - 1][0], depth.asks[depth.asks.length - 1][1] + ask.quantity];
                                continue
                        }
                        depth.asks.push([
                                ask.amount, ask.quantity
                        ])
                }

                if (sortedBids.length) for (let id = 0; id < sortedBids.length; id++) {
                        const bid = sortedBids[id];
                        if (depth.bids.length && depth.bids[depth.bids.length - 1][0] === bid.amount) {
                                depth.bids[depth.bids.length - 1] = [depth.bids[depth.bids.length - 1][0], depth.bids[depth.bids.length - 1][1] + bid.quantity];
                                continue
                        }
                        depth.bids.push([
                                bid.amount, bid.quantity
                        ])
                }
                return depth
        }
        addToOrderBook(order: order, book: order[]) {
                if (order.quantity) {
                        book.push({
                                orderId: order.orderId,
                                amount: order.amount,
                                quantity: order.quantity,
                                clientId: order.clientId
                        })
                }
        }
        removeOrder(orderId: string, side: side) {
                switch (side) {
                        case "bid":
                                this.bids = this.bids.filter(order => order.orderId !== orderId)
                                break
                        case "ask":
                                this.asks = this.asks.filter(order => order.orderId !== orderId)
                                break
                }
        }
}
