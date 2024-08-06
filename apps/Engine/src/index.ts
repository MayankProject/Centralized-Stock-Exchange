import { Engine } from "./trade/Engine";
import RedisManager from "./RedisManager";
import { RedisClientType } from "redis";

const client: RedisClientType = RedisManager.getInstance()
const engine = Engine.getInstance()
async function submitProcesses(){ 
    while(1){
        console.log("-------");
        const Process: {
            key: string,
            element: string
        } = await client.brPop("Process", 0) || {
            key: "",
            element: ""
        } 
        console.log("-------");
        console.log(Process.element);
        await engine.Process(JSON.parse(Process.element))
    }
}

async function start(){
    await client.connect()
    submitProcesses()
} 
start()