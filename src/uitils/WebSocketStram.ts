import WebSocket from 'ws';
import { Server } from 'https';
import { IncomingMessage, ServerResponse } from 'http';
import EventEmitter from 'events';

export interface WebSocketStreamOptions {
    serverReference: Server<typeof IncomingMessage, typeof ServerResponse>;
    path: string;
}

export class WebSocketStream extends EventEmitter {

    wss: WebSocket.Server | undefined;
    client: WebSocket | undefined;

    constructor(options: WebSocketStreamOptions) {
        super();

        this.wss = new WebSocket.Server({
            server: options.serverReference,
            path: options.path
        });

        this.wss.on('connection', (ws: WebSocket)=>{
            this.connectedHandler(ws);
            this.emit('opened');
        });

    }

    callBackSend(message: string) {
        if(this.client !== undefined || this.client !== null){
            this.client?.send(message);
        }
    }

    close() {
        this.client?.close();
        this.wss?.removeAllListeners();
        this.wss?.close();
        this.wss = undefined;
    }

    connectedHandler(ws: WebSocket) {
        this.client = ws;

        ws.on('message', (message: string) => {

            console.log('Получено сообщение от клиента:', message);
            ws.send('Сообщение получено');
        });
      
        ws.on('close', () => {
            console.log('Соединение закрыто');
        });
    };
}

