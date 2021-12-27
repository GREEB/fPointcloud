import dgram from 'dgram';
import { Buffer } from 'buffer';
setInterval(() => {

// send 324 bytes of fake data to simulate forza running for deving

const message = Buffer.alloc(324);
const client = dgram.createSocket('udp4');
    client.send(message, 5300, 'localhost', (err) => {
        client.close();
    }); 

}, 1000)
