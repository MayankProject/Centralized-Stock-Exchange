import express from "express"
import cors from "cors"
import { orderRouter } from "./Router/Order"
import { depthRouter } from "./Router/Depth"
import { requestPayload } from "@repo/types"
import RedisManager from "./RedisManager"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (_, res) => {
    return res.json("Healthy!")
})

app.use("/order", orderRouter)
app.use("/depth", depthRouter)
app.get("/balance", async (req, res) => {
    const { clientId } = req.query as { clientId: string }
    const payload: Omit<requestPayload, "id"> = {
        message: {
            Action: "GET_BALANCE",
            Data: {
                id: clientId
            }
        },
        clientId
    }
    const response = await RedisManager.getInstance().pushAndWait(payload)
    res.json(response)
})


// todo: store request somewhere which came while server was preparing 
async function start() {
    app.listen(3000, () => {
        console.log("API Server ready.");
    })
}
start()
