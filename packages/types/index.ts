export type side = "bid" | "ask"
export type Balance = {
    balance: {
        available: number,
        locked: number
    },
    [key: string]: {
        available: number,
        locked: number
    },

}
export type messageFromAPI = {
    Action: "CREATE_ORDER",
    Data: {
        side: side,
        amount: number,
        quantity: number,
        symbol: string
    }
} | {
    Action: "CANCEL_ORDER",
    Data: {
        orderId: string,
        symbol: string
    }
} | {
    Action: "GET_DEPTH",
    Data: {
        symbol: string
    }
} | {
    Action: "GET_BALANCE",
    Data: {
        id: string
    }
} | {
    Action: "GET_TICKER",
    Data: {
        symbol: string
    }
}
export type order = {
    orderId: string,
    amount: number,
    quantity: number,
    clientId: string
}

export type fill = {
    orderId: string,
    price: number,
    quantity: number,
    clientId: string,
    completed: boolean
}

export type requestPayload = {
    message: messageFromAPI,
    clientId: string,
    id?: string
}
export type Trade = {
    amount: string,
    quantity: string
}
export type TradeApiResponse = Trade[]

export type createOrderAPI = {
    side: "bid" | "ask",
    amount: number,
    quantity: number,
    symbol: string,
    clientId: string
}
export type OrderResponse = {
    fills: Omit<fill, "clientId">[]
    executedQuantity: number,
    orderId: string
}
// Engine to Pubsub
export type TradeStreamResponse = {
    e: "TRADE",
    s: string,
    p: string,
    q: string
}
export type DepthResponse = {
    e: "DEPTH",
    s: string,
    bids: [number, number][],
    asks: [number, number][]
}
export type BalanceResponse = {
    e: "BALANCE",
    id: string,
    balance: number
}
export type tickerResponse = {
    e: "TICKER",
    s: string,
    price: number
}
