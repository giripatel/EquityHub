import { Client } from "pg";
import { createClient } from "redis";
import { DbMessage } from "./types";
import dotenv from 'dotenv'

const pgClient = new Client({
    user: "your_user",
    host: "localhost",
    database: "postgres",
    password: process.env.DATA_BASE_URL
})

async function main(){
    const subscriber = createClient();
    await subscriber.connect();
    
    while (true) {
       const response =  await  subscriber.rPop("db_messages");
       if (response) {
            const parsedResponse: DbMessage = JSON.parse(response);
            if (parsedResponse.type === "TRADE_ADDED") {
                const price = parsedResponse.data.price;
                const timestamp = new Date(parsedResponse.data.timestamp);
                const quantity = parsedResponse.data.quantity;
                const id = parsedResponse.data.id;
                const query = `INSERT INTO tata_prices (time, prie, quantity, id) VALUES ($1, $2, $3, $4)`;

                const values = [timestamp, price, quantity, id]
                pgClient.query(query,values);
            } 
            if (parsedResponse.type === "ORDER_UPDATE") {
                const orderId = parsedResponse.data.orderId;
                const executedQty = parsedResponse.data.executedQty;
                const price = parsedResponse.data.price;
                const quantity = parsedResponse.data.quantity;
                const side = parsedResponse.data.side;

                const query = `UPDATE TABLE tata_prices (orderId, executeQty, price, quantity, side) VALUES ($1, $2, $3, $4, $5)`

                const values = [orderId, executedQty, price, quantity, side];
                pgClient.query(query, values);
            }
       }
    }

}