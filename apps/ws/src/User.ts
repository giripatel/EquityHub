import { WebSocket } from "ws"
import { IncomingMessage, SUBSCRIBE } from "./types/in";
import { SubscriptionManager } from "./SubscriptionManager";


export class User {
    id: string;
    socket: WebSocket;
    subscribed: string[] =[];

    constructor(id: string, socket: WebSocket){
        this.id = id,
        this.socket = socket
    }

    getSubscription(){
        return this.subscribed;
    }

    public subscribe(event: string){
        this.subscribed.push(event);
    }

    public unscubscribe(event: string){
        const isSubcribed =  this.subscribed.includes(event);
        if(isSubcribed){
            this.subscribed = this.subscribed.filter(s => s === event);
        }
    }

    emit(message: OutgoingMessage) {
        this.socket.send(JSON.stringify(message));
    }

    private adddListener(){
        this.socket.on("message", (event: string) => {
            const message: IncomingMessage = JSON.parse(event);
            if (message.method === SUBSCRIBE) {
                message.params.forEach(s => SubscriptionManager.getInstance().subscribe(this.id,s));
            } else {
                message.params.forEach(s => SubscriptionManager.getInstance().unsubscribe(this.id,s))
            }
        })
    }

}