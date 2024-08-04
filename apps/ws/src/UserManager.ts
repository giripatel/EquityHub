import { WebSocket } from "ws";
import { User } from "./User";


export class UserManager {
    private static instance: UserManager;
    users: Map<string,User> = new Map();

    public static getInstance() {
        if (this.instance){
            this.instance = new UserManager();
        }
        return this.instance;
    }

    constructor(){

    }

    generateRandomId(){
        return (Math.random().toString().substring(2,15))
    }

    public addUser(ws: WebSocket){
        const id = this.generateRandomId();
        const user = new User(id, ws);
        this.users.set(id, user);
        this.registerOnClose(ws,id);
    }
    
    registerOnClose(ws: WebSocket, id: string){
        ws.on("close", () => {
            this.users.delete(id);
            
        })
    }

    public getUser(id: string){
        return this.users.get(id)
    }
}