import { Depth, Ticker } from "./types";

const BASE_URL = "wss://ws.backpack.exchange/"

export class SignalingManager {

    private ws: WebSocket;
    private static instance: SignalingManager;
    private bufferedMessages: any[] = [];
    private callbacks: {[type: string]: any[]} = {};
    private id: number;
    private initialized: boolean = false;

    private constructor(){
        this.ws = new WebSocket(BASE_URL);
        this.bufferedMessages = [];
        this.id = 1;
        this.init();
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new SignalingManager();
        }
        return this.instance
    }

    init(){
        this.ws.onopen = () => {
            this.initialized = true;
            console.log("Web Socket is open");
            
            this.bufferedMessages.map(message => {
                console.log("From buffered");
                console.log(message);
                
                // console.log(JSON.stringify(message));
                
                this.ws.send(message)
            })
            this.bufferedMessages = []
        }
        this.ws.onmessage = (event) => {
            console.log(event);
            
            const message = JSON.parse(event.data);
            const type = message.data.e;
            // console.log(type)
            
            if (this.callbacks[type]) {
                this.callbacks[type].map(({callback}) => {
                    if (type === "ticker") {
                        const newTicker: Partial<Ticker> = {
                            lastPrice: message.data.c,
                            high: message.data.h,
                            low: message.data.l,
                            volume: message.data.V,
                            quoteVolume: message.data.v,
                            symbol: message.data.s,
                            priceChange: message.priceChange
                        }
                        callback(newTicker)
                    }
                    if (type === "depth") {
                        const depth: Partial<Depth> = {
                            asks: message.data.a,
                            bids: message.data.b
                        }
                        callback(depth)
                    }
                })
            }
        }
    }

    registerCallback(type: string, callback: any, id: string){
        
        this.callbacks[type] = this.callbacks[type] || []
        this.callbacks[type].push({callback, id})
    }
    
    deregisterCallback(type: string, id: string){
        if(this.callbacks[type]){
            const index = this.callbacks[type]?.findIndex(callback => callback.id == id);
            if(index !== -1){
                this.callbacks[type]?.slice(index,1)
            }
        }
        
    }
    sendMessage(message: any) {

        // const sendMessage = {
        //     ...message,
        //     id: this.id++
        // }
        if(!this.initialized){
            this.bufferedMessages.push(message);
            return;
        }
        // this.ws.send(JSON.stringify(sendMessage));
        // this.ws.send(JSON.stringify(message));
        this.ws.send(message);
    }

}