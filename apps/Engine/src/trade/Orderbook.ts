import { fill, order, side } from "../types";

export const quoteAsset = "INR"
export class Orderbook {
    bids: order[];
    asks: order[];
    baseAsset: string;
    quoteAsset: string = quoteAsset;
    symbol: string;
    constructor(baseAsset: string){
        this.bids = [];
        this.asks = [];
        this.baseAsset = baseAsset
        this.symbol = `${baseAsset}_${this.quoteAsset}`
    }
    createOrder( order : order & {side: side}) : {fills: fill[], executedQuantity: number}{

        const {fills, executedQuantity} = this.matchOrder({...order})
        //Adding to OrderBook if not completely executed

        if (executedQuantity <  order.quantity) {
            switch (order.side) {
                case "bid":
                    this.addToOrderBook({...order, quantity: order.quantity-executedQuantity}, this.bids)
                    break;
                case "ask":
                    this.addToOrderBook({...order, quantity: order.quantity-executedQuantity}, this.asks)
                    break;
                }
        }

        return {fills, executedQuantity}
    }
    cancelOrder(orderId: string){
        const index = this.bids.findIndex(o => o.orderId === orderId)
        if (index===-1) {
            const index = this.asks.findIndex(o => o.orderId === orderId)
            const order = {...this.asks[index], side: "ask" as side}
            this.asks.splice(index, 1)
            return order
        }
        const order = {...this.bids[index], side: "bid" as side}
        this.bids.splice(index, 1)
        return order
    }
    matchOrder(order: order & {side: side}) : {
        fills: fill[],
        executedQuantity: number
    }{
        
        let {executedQuantity, fills} : {executedQuantity: number, fills: fill[]} = {executedQuantity:0, fills: []}
        switch(order.side){
            case "bid":                
                const matched_bid = this.compareOrderWithBook(this.asks.sort((a, b)=> a.amount - b.amount), order, (compare_order: order, order: order)=>{
                    return compare_order.amount<=order.amount && order.clientId!==compare_order.clientId
                })
                executedQuantity = matched_bid.executedQuantity
                fills = matched_bid.fills
                break

            case "ask":
                const matched_ask = this.compareOrderWithBook(this.bids.sort((a, b)=> b.amount - a.amount), order, (compare_order: order, order: order)=>{
                    return (order.amount <= compare_order.amount && order.clientId!==compare_order.clientId)
                })   
                executedQuantity = matched_ask.executedQuantity
                fills = matched_ask.fills
                break

        }
        return {
            fills,
            executedQuantity
        }
    }
    compareOrderWithBook(book: order[], order: order & { side: side }, compare: (a: order, b: order) => boolean) : {fills: fill[], executedQuantity: number}{
        // Matches the order with orderbook
        let executedQuantity = 0
        let fills : fill[] = []
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
                    completed: compare_order.quantity? false :  true
                })
                if (order.quantity === 0) {
                    break
                }
                if (compare_order.quantity === 0) {
                    //logic
                }
            }   
        }
        return {
            fills,
            executedQuantity
        }
    }
    addToOrderBook(order: order, book: order[]){
        if (order.quantity) {
            book.push({
                orderId: order.orderId,
                amount: order.amount,
                quantity: order.quantity,
                clientId: order.clientId
            })
        }
    }
    removeOrder(orderId: string, side: side){
        switch(side){
            case "bid":
                this.bids = this.bids.filter(order => order.orderId!== orderId)
                break
            case "ask":
                this.asks = this.asks.filter(order => order.orderId!== orderId)
                break
        }
    }
}