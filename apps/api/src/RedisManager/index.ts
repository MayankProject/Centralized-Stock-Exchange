import { messageFromAPI, requestPayload } from "@repo/types"
import { createClient, RedisClientType } from "redis"
export default class RedisManager{

    private publisher: RedisClientType;
    private client: RedisClientType;
    private static instance: RedisManager;
    private constructor(){
        this.client = createClient();
        this.publisher = createClient();
        this.client.connect()
        this.publisher.connect()
    }
    static getInstance(){
    if(!this.instance){
            this.instance = new RedisManager();
        }
        return this.instance;
    }
    async pushAndWait(payload : Omit<requestPayload, "id">){
        const id = Math.random().toString()
        const updatedPayload : requestPayload = {...payload, id}
        this.publisher.lPush("Process", JSON.stringify(updatedPayload))
        return new Promise((resolve)=>{
            this.client.subscribe(id, (message, channel)=>{
                this.client.unsubscribe(id)
                resolve(JSON.parse(message))
            })
        })
    }
}