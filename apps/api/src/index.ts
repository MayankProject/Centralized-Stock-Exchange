import express from "express"
import cors from "cors"
import RedisManager from "./RedisManager"
import { orderRouter } from "./Router/Order"
import { depthRouter } from "./Router/Depth"

const app = express()
const redis = RedisManager.getInstance()

app.use(cors())
app.use(express.json())

app.get("/", (_, res)=>{
    return res.json("Healthy!")
})

app.use("/order", orderRouter)
app.use("/depth", depthRouter)


// todo: store request somewhere which came while server was preparing 
async function start(){
    app.listen(3000, ()=>{
        console.log("API Server ready.");
    })
}
start()