import { createClient } from 'redis'
import { Engine } from './trade/Engine'


async function main() {
    const engine = new Engine();
    const client = createClient();
    client.connect();

    while(true){

        const message = await client.rPop("message" as string);
        if (message) {
            engine.process(JSON.parse(message))
        }
    }
}