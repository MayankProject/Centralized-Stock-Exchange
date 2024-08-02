import { Engine } from "./trade/Engine";
import { side } from "./types";

Engine.getInstance().Process({
    clientId: "1",
    message: {
        Action: "CREATE_ORDER",
        Data: {
            amount: 12,
            quantity: 12,
            side: "bid" as side,
            symbol: "TEST_INR"
        }
    }
})
Engine.getInstance().Process({
    clientId: "1",
    message: {
        Action: "CREATE_ORDER",
        Data: {
            amount: 12,
            quantity: 12,
            side: "bid" as side,
            symbol: "TEST_INR"
        }
    }
})