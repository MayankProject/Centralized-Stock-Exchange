import express from "express"
import cors from "cors"
const app = express()
app.use(cors())
app.get("/", (req, res)=>{
    return res.json("Healthy!")
})
app.listen(3000)