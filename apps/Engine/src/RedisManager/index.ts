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
}