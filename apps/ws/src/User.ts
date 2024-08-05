import { WebSocket } from "ws"
import { IncomingMessage, SUBSCRIBE } from "./types/in";
import { SubscriptionManager } from "./SubscriptionManager";


export class User {
    id: string;
    socket: WebSocket;

    constructor(id: string, socket: WebSocket){
        this.id = id,
        this.socket = socket
        this.adddListener()
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