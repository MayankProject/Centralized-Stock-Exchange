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
export type DepthResponse = {
    e: "DEPTH",
    s: string,
    bids: [number, number][],
    asks: [number, number][]
}
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
