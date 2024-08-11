import RedisManager from "../RedisManager";
import { Orderbook, quoteAsset, updatedDepthParams } from "./Orderbook";
import { Balance, side, order, requestPayload } from "@repo/types/index"

export class Engine {
    private orderBooks: Map<string, Orderbook> = new Map()
    private balances: Map<string, Balance> = new Map();
    private static instance: Engine;
    private constructor() {
        this.fillDummyData()
    }
    static getInstance() {
        if (!Engine.instance) {
            Engine.instance = new Engine();
        }
        return Engine.instance;
    }
    Process({ message, clientId }: requestPayload) {
        let response = Object();
        switch (message.Action) {
            case "CREATE_ORDER":
                response = (this.createOrder({ ...message.Data, clientId }))
                break

            case "CANCEL_ORDER":
                this.cancelOrder({ ...message.Data, clientId });
                response = {
                    message: "Order Cancelled"
                }
                break

            case "GET_DEPTH":
                const depth = this.getDepth(message.Data.symbol, clientId)
                response = depth
                break
        }
        // console.log(this.orderBooks.get("TEST_INR"), this.balances);
        return response

    }
    fillDummyData() {
        const TEST_INR_ORDERBOOK = new Orderbook("TEST");
        this.balances.set("1", {
            balance: {
                available: 6000,
                locked: 0
            },
            "TEST": {
                available: 30,
                locked: 0
            }
        })
        this.balances.set("2", {
            balance: {
                available: 4000,
                locked: 0
            },
            "TEST": {
                available: 10,
                locked: 0
            }
        })
        this.balances.set("3", {
            balance: {
                available: 4000,
                locked: 0
            },
            "TEST": {
                available: 10,
                locked: 0
            }
        })
        this.balances.set("4", {
            balance: {
                available: 4000,
                locked: 0
            },
            "TEST": {
                available: 10,
                locked: 0
            }
        })
        this.balances.set("5", {
            balance: {
                available: 4000,
                locked: 0
            },
            "TEST": {
                available: 10,
                locked: 0
            }
        })
        this.orderBooks.set("TEST_INR", TEST_INR_ORDERBOOK);
    }
    createOrder({ clientId, amount, quantity, side, symbol }: {
        clientId: string,
        amount: number,
        quantity: number,
        side: side,
        symbol: string // TEST_INR
    }) {
        const orderBook = this.orderBooks.get(symbol);
        if (!orderBook) throw new Error(`No order book found for symbol ${symbol}`);

        const User = this.balances.get(clientId)
        if (!User) throw new Error("No User Found!")

        const priceToBuy = amount * quantity
        const Market = symbol.split("_")[0]

        if (((side === "bid" && User.balance.available || 0) >= priceToBuy) || (side === "ask" && this.balances.get(clientId)?.[symbol.split("_")[0]].available || 0 >= quantity)) {

            // Locking Balances
            if (side === "bid") {
                this.lockBalance(User, priceToBuy, clientId)
            }
            else {
                this.lockAsset(User, Market, quantity, clientId)
            }

            const orderId = Math.random().toString()

            const { fills, executedQuantity, updatedDepthParams } = orderBook.createOrder({
                orderId,
                amount,
                quantity,
                side,
                clientId,
            })
            if (side == "bid") {
                User.balance.locked -= executedQuantity * amount;
                User[symbol.split("_")[0] as string].available += executedQuantity
                this.balances.set(clientId, User)
                fills.forEach((fill) => {
                    const User = this.balances.get(fill.clientId)
                    if (fill.completed) {
                        orderBook.removeOrder(fill.orderId, "ask")
                    }
                    if (User) {
                        User.balance.available += fill.quantity * fill.price;
                        User[symbol.split("_")[0] as string].locked -= fill.quantity
                        this.balances.set(fill.clientId, User)
                    }
                })
            }
            else {
                User.balance.available += executedQuantity * amount;
                User[symbol.split("_")[0] as string].locked -= executedQuantity
                this.balances.set(clientId, User)
                fills.forEach((fill) => {
                    const User = this.balances.get(fill.clientId)
                    if (fill.completed) {
                        orderBook.removeOrder(fill.orderId, "bid")
                    }
                    if (User) {
                        User.balance.locked -= fill.quantity * fill.price;
                        User[symbol.split("_")[0] as string].available += fill.quantity
                        this.balances.set(fill.clientId, User)
                    }
                })
            }
            // logic to send data here and there
            updatedDepthParams.s = symbol
            this.publishUpdatedDepth(`trade@${symbol}`, updatedDepthParams)
            return {
                fills: fills.map((fill) => {
                    const { clientId, ...updated_fill } = fill
                    return updated_fill
                }),
                executedQuantity,
                orderId
            }
        }
        else {
            throw new Error("Insufficient Balance")
        }
    }

    publishUpdatedDepth(stream: string, updatedDepthParams: updatedDepthParams) {
        // problem => bids: [[100, 0], [100, 0]]
        const accumulatedData: { bids: { [key: number]: number }, asks: { [key: number]: number } } = {
            bids: {},
            asks: {}
        }
        updatedDepthParams.asks.forEach((ask) => {
            if (!accumulatedData.asks[ask[0]]) {
                accumulatedData.asks[ask[0]] = 0
            }
            accumulatedData.asks[ask[0]] += ask[1]
        })
        updatedDepthParams.bids.forEach((bid) => {
            if (!accumulatedData.bids[bid[0]]) {
                accumulatedData.bids[bid[0]] = 0
            }
            accumulatedData.bids[bid[0]] += bid[1]
        })
        const bids = Object.entries(accumulatedData.bids).map(arr => [Number(arr[0]), arr[1]])
        const asks = Object.entries(accumulatedData.asks).map(arr => [Number(arr[0]), arr[1]])

        RedisManager.getInstance().publishToWs(stream, { ...updatedDepthParams, bids, asks })
    }

    cancelOrder({ orderId, symbol, clientId }: {
        orderId: string,
        symbol: string,
        clientId: string
    }) {
        const orderBook = this.orderBooks.get(symbol);
        if (!orderBook) throw new Error(`No order book found for symbol ${symbol}`);
        const order: order & { side: side } = orderBook.cancelOrder(orderId)
        const User = this.balances.get(order.clientId)
        if (!User) {
            throw new Error("No User Found!")
        }
        switch (order.side) {
            case "bid":
                this.UnlockBalance(User, order.amount * order.quantity, clientId)
                break
            case "ask":
                this.UnlockAsset(User, symbol.split("_")[0], order.quantity, clientId)
                break
        }
    }

    getDepth(symbol: string, clientId: string) {
        const orderbook = this.orderBooks.get(symbol)
        const depth = orderbook?.getDepth()
        return depth
    }

    getOrderBook(symbol: string) {
        return this.orderBooks.get(symbol)
    }
    getBalance() {
        return this.balances
    }

    lockBalance(User: Balance, Amount: number, clientId: string) {
        User.balance.available -= Amount
        User.balance.locked += Amount
        this.balances.set(clientId, User)
    }
    UnlockBalance(User: Balance, Amount: number, clientId: string) {
        User.balance.available += Amount
        User.balance.locked -= Amount
        this.balances.set(clientId, User)
    }
    lockAsset(User: Balance, Market: string, Amount: number, clientId: string) {
        User[Market].available -= Amount
        User[Market].locked += Amount
        this.balances.set(clientId, User)
    }
    UnlockAsset(User: Balance, Market: string, Amount: number, clientId: string) {
        User[Market].available += Amount
        User[Market].locked -= Amount
        this.balances.set(clientId, User)
    }
}
