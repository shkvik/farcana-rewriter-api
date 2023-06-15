import { Router } from 'express';
import http, { IncomingMessage, ServerResponse } from 'http';
import https from 'https';
import { Parser } from 'htmlparser2';
import { getPolygonArchiveLinks, getPolygonLinks } from '../parser/polygonPagesWrapper'
import { getArticalArray, Artical } from '../parser/polygonArticalsWrapper'
import { Console } from 'console';
import { Server } from 'https';
import WebSocket from 'ws';
import { Configuration, OpenAIApi, CreateChatCompletionRequest } from 'openai';
import { UUID, randomUUID } from 'crypto';
//import { OpenAI } from "openai-streams";
import fs from 'fs';
import { ExecException } from 'child_process';
import { json } from 'stream/consumers';
import { ChatStream, ChatGPT, ChatMsg } from '../uitils/OpenAI';
import { WebSocketStream } from '../uitils/WebSocketStram';
import { Readable } from 'stream';
import { WordTokenizer } from 'natural';


function countTokens(text: string): number {
    const tokenizer = new WordTokenizer();
    const tokens = tokenizer.tokenize(text);
    return tokens != null ? tokens.length : 0;
}

const router = Router();

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4|5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

var Articals: Artical[] = new Array<Artical>();

var serverReference: Server<typeof IncomingMessage, typeof ServerResponse>;


function updateServerReference(value: Server<typeof IncomingMessage, typeof ServerResponse>): void{
    serverReference = value;
}

router.get('/UpdateArticalsData/:uuid', async (req, res): Promise<void> => {
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    // var uuid: string = req.params.uuid;
    // var client: WebSocket | null = null;

    function callBackWebSocket(msg: string){
        res.write(msg);
        // client?.send(msg);
    }

    // if(!uuidRegex.test(id)){
    //     res.send('Ты дебил?');
    //     return;
    // }

    // var wss:WebSocket.Server | null = new WebSocket.Server({
    //     server: serverReference,
    //     path: `/process/${uuid}`
    // });


    // function connectedHandler(ws: WebSocket) {
    //     client = ws;

    //     ws.on('message', (message: string) => {
    //       console.log('Получено сообщение от клиента:', message);
          
    //       ws.send('Сообщение получено');
    //     });
      
    //     ws.on('close', () => {
    //         console.log('Соединение закрыто');
    //     });
    // };

    // wss.on('connection', connectedHandler);

    var links    = await getPolygonLinks(callBackWebSocket);
    var articals = await getArticalArray(links, callBackWebSocket);

    Articals = articals;

    // if (client !== null) {
    //     var t:any = client;
    //     t.close();
    // }

    // wss.removeAllListeners();
    // wss.close();
    // wss = null;

    res.end();
    //res.send(true);
});



router.get('/GetArticalsTableData', async (req, res): Promise<void> => {
    res.send(JSON.stringify(Articals));
});



router.get('/TestStreamResponse', async (req, res): Promise<void> => {
    const repetitions = 8; // Количество повторений
    let currentRepetition = 0;

    res.setHeader('Content-Type', 'application/json');

    const articalsStream = new Readable({
        read() {
          if (currentRepetition < repetitions) {
            const articals = JSON.stringify(currentRepetition);

            setTimeout(() => {
                this.push(articals);
                currentRepetition++;
              }, 1000);

          } else {
            this.push(null);
          }
        },
      });

    articalsStream.pipe(res);
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

const apiKey: string = fs.readFileSync('./openai/key.txt', 'utf8');


const configuration = new Configuration({
    apiKey: apiKey,
  });

const openai = new OpenAIApi(configuration);

interface OpenAIResponse {
    id?: string | null;
    object?: string | null;
    created?: number | null;
    model?: string | null;
    choices?: [
        {
            delta?: { content: string | null; } | null;
            index?: number | null;
            finish_reason?: string | null;
        }
    ] | null;
}


interface FrameOpenAI {
    id:  number;
    msg: string;
}

// router.get('/RewriteArtical/:id', async (req, res): Promise<void> => {

//     var stream = new WebSocketStream({
//         serverReference: serverReference,
//         path: `/rewrite`
//     });


//     try {
//         var index: number = parseInt(req.params.id);
//         var article = Articals[index];
//         var counter: number = 0;
        
//         function callB(message: string): void {

//             const tmpFrame: FrameOpenAI = {
//                 id: counter,
//                 msg: message
//             }
//             stream.callBackSend(JSON.stringify(tmpFrame));
//         }
        
//         async function ChatResultHandler(originalLength: number, chatMessage: string): Promise<string> {
//             return new Promise<string>(async(resolve, reject)=> {

//                 await ChatStream({
//                     apiKey: apiKey,
//                     message: `rewrite ${chatMessage}`,
//                     callback: callB
//                 }).then((value)=> {
//                     // if(value.length < originalLength){
//                     //     ChatResultHandler(originalLength, 'continue');
//                     // };
//                     resolve(value);
//                 });
//             });
//         }

//         stream.on('opened', async ()=> {
//             console.log('я тут?');

//             // var result = await ChatStream({
//             //     apiKey: apiKey,
//             //     message: chatMessage,
//             //     callback: callB
//             // });
//             var result = await ChatResultHandler(article.article.length, article.article);

//             Articals[index].rewrited = result;
//             res.send(result);
//             stream.close();
//         });
//     }
//     catch {
//         stream.close();
//         res.send("error");
//     }
// });

router.get('/GetRewritedArtical/:id', async (req, res): Promise<void> => {
    try {
        var index: number = parseInt(req.params.id);
        var article = Articals[index];

        if(article.rewrited !== '') {
            res.send(JSON.stringify(article.rewrited));
        }
        else {
            res.send(null);
        }
    }
    catch {
        res.send("index error");
    }
});


router.get('/RewriteArtical/:id', async (req, res): Promise<void> => {

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
        var index: number = parseInt(req.params.id);
        var article = Articals[index].article;

        var counter: number = 0;
        
        const callvb = (chunk: string) => {

            

            const tmpFrame: FrameOpenAI = {
                id: counter,
                msg: chunk
            }
            res.write(JSON.stringify(tmpFrame));

            
            counter++;
        }

        var context: Array<ChatMsg> = 
        [
          {role: "system",    content: "You are a helpful assistant."},
          {role: "user",      content: "Write the text only in English"},
          {role: "assistant", content: 'OK, now I will write only in English'},
          {role: "user",      content: `rewrite ${article}` }
        ];

        var result = await ChatStream({
            apiKey: apiKey,
            message: `rewrite ${article}`,
            context: context,
            callback: callvb
        });

        if(countTokens(result) < countTokens(article)){

            const tmpFrame: FrameOpenAI = {
                id: counter,
                msg: ' '
            }
            res.write(JSON.stringify(tmpFrame));

            context.push({role: "assistant", content: result});
            context.push({role: "user", content: "continue"});

            var result = await ChatStream({
                apiKey: apiKey,
                message: `rewrite ${article}`,
                context: context,
                callback: callvb
            });
        }

        res.end();
    }
    catch(error: any) {
        console.log('ловим ошибку здесь');
        res.end();
        console.log(error);

    }
});



export { 
    router, 
    updateServerReference
};
