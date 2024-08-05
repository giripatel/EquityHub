import { createClient, RedisClientType } from 'redis'
import { UserManager } from './UserManager';

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

    public subscribe(userId: string, subscription: string){

      /*  if(!this.subscriptions.get(userId)){
            this.subscriptions.set(userId,[subscription]);
        }
        if (this.subscriptions.get(userId)?.includes(subscription)) {
            return;
        }

        this.subscriptions.get(userId)?.push(subscription);
        if(!this.reverseSubscriptions.get(subscription)){
            this.reverseSubscriptions.set(subscription,[userId])
            this.redisClient.subscribe(subscription,(message) => {
                this.eventHandler(subscription, message)
            })
        } */

        if(this.subscriptions.get(userId)?.includes(subscription)){
            return;
        }

        this.subscriptions.set(userId, (this.subscriptions.get(userId) || []).concat(subscription));
        this.reverseSubscriptions.set(subscription, (this.reverseSubscriptions.get(subscription) || []).concat())

        if(this.reverseSubscriptions.get(subscription)?.length === 1){
            this.redisClient.subscribe(subscription, this.eventHandler);
        }

    }

    public unsubscribe(userId: string, subscription: string){
        if (!this.subscriptions.get(userId)?.includes(subscription)) {
            return;
        }
        this.subscriptions.set(userId,(this.subscriptions.get(userId)?.filter(sub => sub !== subscription) || []))
        this.reverseSubscriptions.set(subscription,(this.reverseSubscriptions.get(subscription)?.filter(sub => sub !== userId) || []))
        if(this.reverseSubscriptions.get(subscription)?.length === 0){
            this.redisClient.unsubscribe(subscription);
        } 
    }

    public userLeft(userId: string) {
        this.subscriptions.get(userId)?.forEach(s => this.unsubscribe(userId, s))
    }
    eventHandler(channel: string, message: string){
        const parsedMessage = JSON.parse(message);
        this.reverseSubscriptions.get(channel)?.forEach(user => {
            UserManager.getInstance().getUser(user)?.emit(parsedMessage);
        })
    }

    public getSubscriptions(userId: string) {
        return this.subscriptions.get(userId) || [];
    }
}