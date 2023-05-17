import { Router } from 'express';
import http, { IncomingMessage, ServerResponse } from 'http';
import { Parser } from 'htmlparser2';
import { getPolygonArchiveLinks, getPolygonLinks } from '../parser/polygonPagesWrapper'
import { getArticalArray, Artical } from '../parser/polygonArticalsWrapper'
import { Console } from 'console';
import { Server } from 'https';
import * as WebSocket from 'ws';
import { UUID, randomUUID } from 'crypto';
const router = Router();

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4|5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

var Articals: Artical[] = new Array<Artical>();

var serverReference: Server<typeof IncomingMessage, typeof ServerResponse>;


function updateServerReference(value: Server<typeof IncomingMessage, typeof ServerResponse>): void{
    serverReference = value;
}

router.get('/UpdateArticalsData/:uuid', async (req, res): Promise<void> => {
    
    var uuid: string = req.params.uuid;
    var client: WebSocket | null = null;

    function callBackWebSocket(msg: string){
        client?.send(msg);
    }

    // if(!uuidRegex.test(id)){
    //     res.send('Ты дебил?');
    //     return;
    // }

    var wss:WebSocket.Server | null = new WebSocket.Server({
        server: serverReference,
        path: `/process/${uuid}`
    });


    function connectedHandler(ws: WebSocket) {
        client = ws;

        ws.on('message', (message: string) => {
          console.log('Получено сообщение от клиента:', message);
          
          ws.send('Сообщение получено');
        });
      
        ws.on('close', () => {
            console.log('Соединение закрыто');
        });
    };

    wss.on('connection', connectedHandler);

    var links    = await getPolygonLinks(callBackWebSocket);
    var articals = await getArticalArray(links, callBackWebSocket);

    Articals = articals;

    if (client !== null) {
        var t:any = client;
        t.close();
    }

    wss.removeAllListeners();
    wss.close();
    wss = null;
    
    res.send(true);
});


router.get('/GetArticalsTableData', async (req, res): Promise<void> => {
    res.send(JSON.stringify(Articals));
});


router.get('/GetArtical/:index', async (req, res): Promise<void> => {
    

    try {
        var index: number = parseInt(req.params.index);
        var article = Articals[index];
        res.send(JSON.stringify(article));
    }
    catch {
        res.send("index error");
    }
    
});

export { 
    router, 
    updateServerReference
};