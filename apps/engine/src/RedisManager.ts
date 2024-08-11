import { createClient, RedisClientType } from "redis";
import { WsMessage } from "./types/toWS";

export class RedisManager{
    private client: RedisClientType;
    private static instance: RedisManager;

    private constructor(){
        this.client = createClient();
        this.client.connect();
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new RedisManager();
        }
        return this.instance;
    }

    public publishToAPI(clinetId: string, message: any){
        
        this.client.publish(clinetId, JSON.stringify(message))
    }
    
    public pushToDb(message: any){
        this.client.lPush("db_messages", JSON.stringify(message))
    }

    public publishMessage(channel: string, message: WsMessage){
        this.client.publish(channel, JSON.stringify(message))
    }
}