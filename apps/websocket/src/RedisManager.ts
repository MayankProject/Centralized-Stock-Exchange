import { createClient, RedisClientType } from "redis"
import { SubscriptionManager } from "./SubscriptionManager";
export default class RedisManager {

        private client: RedisClientType;
        private static instance: RedisManager;
        private constructor() {
                this.client = createClient();
                this.connectToRedis()
        }
        static getInstance() {
                if (!this.instance) {
                        this.instance = new RedisManager();
                }
                return this.instance;
        }
        connectToRedis = async function (this: RedisManager) {
                await this.client.connect()
                console.log("Redis Connected.")
        }
        subscribe(market: string, manager: SubscriptionManager) {
                this.client.subscribe(market, (message, channel) => {
                        manager.getSubscribedData(message, channel)
                })
        }
        unsubscribe(market: string) {
                this.client.unsubscribe(market)
        }

}
