import { createClient, RedisClientType } from "redis";
import { MessageToEngine } from "./types/to";
import { v4 as uuid } from "uuid";
import { MessageFromOrderbook } from "./types";

export class RedisManager {
  private clinet: RedisClientType;
  private publisher: RedisClientType;
  private static instance: RedisManager;
  private constructor() {
    this.clinet = createClient();
    this.clinet.connect();
    this.publisher = createClient();
    this.publisher.connect();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RedisManager();
    }
    return this.instance;
  }

  public sendMessage(message: MessageToEngine) {
    const id = uuid();
    console.log(id);
    
    return new Promise<MessageFromOrderbook>((resolve) => {
        this.clinet.subscribe(id,(message) => {
           this.clinet.unsubscribe(id)
           resolve(JSON.parse(message));
        })
        this.publisher.lPush("messages", JSON.stringify(message));
      })
  }
}
