import { Client } from "pg";

const client = new Client({
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
    port: 5432,
    host: 'localhost'
})

async function createDB() {
    
    await client.connect();

    await client.query(`
        DROP TABLE IF EXISTS "tata_prices";
        CREATE TABLE "tata_prices"(
            time        TIMESTAMP WITH TIME ZONE NULL,
            price   DOUBLE PRECISION,
            volume      DOUBLE PRECISION,
            currency_code   VARCHAR (10))`)


   await client.query(`CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1m AS
                    SELECT time_bucket('1 min',time) AS bucket,
                    first(price, time) AS open,
                    max(price) AS high,
                    min(price) AS low,
                    last(price, time) AS close,
                    sum(vlume) AS volume,
                    currency_code
                    FROM tata_prices
                    GROUP BY bucket, currency_coe;
        `)
   await client.query(`CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1h AS
                    SELECT time_bucket('1 hour',time) AS bucket,
                    first(price, time) AS open,
                    max(price) AS high,
                    min(price) AS low,
                    last(price, time) AS close,
                    sum(vlume) AS volume,
                    currency_code
                    FROM tata_prices
                    GROUP BY bucket, currency_coe;
        `)
   await client.query(`CREATE MATERIALIZED VIEW IF NOT EXISTS klines_12 AS
                    SELECT time_bucket('1 week',time) AS bucket,
                    first(price, time) AS open,
                    max(price) AS high,
                    min(price) AS low,
                    last(price, time) AS close,
                    sum(vlume) AS volume,
                    currency_code
                    FROM tata_prices
                    GROUP BY bucket, currency_coe;
        `)

        await client.end();
}

createDB().catch(console.error);