import { requestPayload } from "@repo/types";
import { createClient, RedisClientType } from "redis"

export default class RedisManager{
    private client: RedisClientType;
    private publisher : RedisClientType;
    private static instance: RedisManager;
    private constructor(){
        this.client = createClient();
        this.publisher = createClient();
    }
    async connectToRedis(){
        await this.client.connect()
        await this.publisher.connect()
    }
    static async getInstance(){
        if(!RedisManager.instance){
            const instance = new RedisManager()
            RedisManager.instance = instance;
            await instance.connectToRedis()
        }
        return RedisManager.instance;
    }
    async getFromQueue() : Promise<requestPayload>{
        return new Promise((resolve)=>{
            this.client.brPop("Process", 0).then((response)=>{
                if (!response) {
                    throw new Error("No Response!")
                }
                resolve(JSON.parse(response.element))
            })
        })
    }
    // Todo: Typecasing for sending to api back
    publishToAPI(id: string, payload: any){
        this.publisher.publish(id, payload)
    }
}