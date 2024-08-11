import { Client } from "pg";


const client = new Client({
    database:'postgres',
    host: 'localhost',
    password: 'postgres',
    port: 5432
})
const refresh = async () => {
    await client.query(`REFRESH MATERIALIZED VIEW klines_1m`)
    await client.query(`REFRESH MATERIALIZED VIEW klines_1h`)
    await client.query(`REFRESH MATERIALIZED VIEW klines_1w`)
}

setTimeout(() => {
    refresh();
}, 1000);