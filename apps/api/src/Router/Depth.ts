import express from "express"
import RedisManager from "../RedisManager"
import { requestPayload } from "@repo/types"
export const depthRouter= express.Router()
const redis = RedisManager.getInstance()

// {
//       "symbol": "TEST_INR"
//       "clientId": "1"
// }

depthRouter.get("/", async (req, res)=>{
    const {clientId, symbol} = req.body
    const payload : Omit<requestPayload, "id"> = {
        message: {
            Action: "GET_DEPTH",
            Data: {
                symbol
            }
        },
        clientId
    }
    const response = await RedisManager.pushAndWait(payload)
    res.json("Done!")
})