import { messageFromAPI, requestPayload } from "@repo/types"
import { createClient, RedisClientType } from "redis"
export default class RedisManager{
    private static instance: RedisClientType;
    private constructor(){
        RedisManager.instance = createClient();
    }
    static getInstance(){
        if(!RedisManager.instance){
            RedisManager.instance = createClient();
        }
        return RedisManager.instance;
    }
    static pushAndWait(payload : Omit<requestPayload, "id">){
        const id = Math.random().toString()
        const updatedPayload : requestPayload = {...payload, id}
        RedisManager.instance.lPush("Process", JSON.stringify(updatedPayload))
    }
}