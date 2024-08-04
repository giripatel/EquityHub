import { createClient, RedisClientType } from 'redis'

export class SubscriptionManager {
    private static instance: SubscriptionManager;
    private subscriptions: Map<string,string[]> = new Map();
    private reverseSubscriptions: Map<string,string[]> = new Map();
    private redisClient: RedisClientType;

    private constructor() {
        this.redisClient = createClient();
        this.redisClient.connect();
    }

    public static getInstance(){
        if (!this.instance) {
            this.instance = new SubscriptionManager();
        }
        return this.instance;
    }

    public subscribe(userId: string, symbol: string){
        const userSubs = this.subscriptions.get(userId);
        if(!userSubs){
            this.subscriptions.set(userId,[]);
        }
        userSubs?.push(symbol);
    }

    public unsubscribe(userId: string, symbol: string){

    }
}