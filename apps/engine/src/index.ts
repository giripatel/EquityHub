import { createClient } from 'redis'
import { Engine } from './trade/Engine'


async function main() {
    const engine = new Engine();
    const client = createClient();
    client.connect();

    while(true){

        const response = await client.rPop("messages" as string);
        if (!response) {

        } else {
            engine.process(JSON.parse(response))
        }
    }
}

main()