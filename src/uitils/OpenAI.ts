import https from 'https';
import { List } from 'immutable';
import { EventEmitter } from 'events';
import { promisify } from 'util';
import { IncomingMessage } from 'http';


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

interface ChatOptions {
    apiKey: string;
    message: string;
    context: Array<ChatMsg>;
    callback: (message: string) => void;
}

export interface ChatMsg {
  
    role: string;
    content: string; 
  
}

export async function ChatStream(options: ChatOptions): Promise<string> {

    var messages = 
    [
      {role: "system",    content: "You are a helpful assistant."},
      {role: "user",      content: "Write the text only in English"},
      {role: "assistant", content: 'OK, now I will write only in English'},
      {role: "user",      content: options.message }
    ];

    const fullMessage: string[] = new Array<string>();

    return new Promise<string>(async (resolve, reject) => {

        const request = https.request({
            hostname:"api.openai.com",
            port: 443,
            path:"/v1/chat/completions",
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+ options.apiKey  
            }
        }, function(response){

            response.on('data', (chunk) => {
    
                try {
                    
                    const msg: string = chunk.toString();
                    const splitMsg: string[] = msg.split('\n\n');
                    
                    for(const [index, item] of splitMsg.entries()){
                        if(item !== '') {
                            const editMsg = item.replace('data: ', '');
                            const chatResponse: OpenAIResponse = JSON.parse(editMsg);
                            const checkPart = chatResponse.choices?.[0].delta?.content;
                            const needPart = checkPart !== null && checkPart !== undefined ? checkPart : '';
                            
                            if(needPart !== '') {
                                fullMessage.push(needPart);
                                options.callback(needPart);

                            }                        
                        }
                        
                    }
                }
                catch(error: any) {
                    console.log(chunk.toString());
                    console.log(error.message);
                }
                
            });
            response.on('error', (err: Error) => {
              console.log('ошибка запроса');
               console.log(err.message);
            });

            response.on('end', () => {
                resolve(fullMessage.join(''));
            });
        })
    
        const body = JSON.stringify({
            model:"gpt-3.5-turbo",
            messages: messages,
            stream:true
        })
    
        request.on('error', (error: any) => {
            console.error("problem with request:"+ error.message);
        });
    
        request.write(body);
        request.end();

    });
}


enum ChatRole {
    user    = 'user',
    system  = 'system'
}


interface ChatMessage
{
    role: ChatRole;
    content: string;
}


interface ChatGPT_options
{
    apiKey: string;
}


export class ChatGPT {
    
    private historyChat: Array<ChatMessage>;
    private apiKey: string;


    constructor(options: ChatGPT_options) {

        this.historyChat = new Array<ChatMessage>();
        this.apiKey = options.apiKey;

    }   
    
    public StreamResponseChat(message: string): void {
        const current = 0;
        const end = 10;
        const key = this.apiKey;
        var res: EventEmitter;
          
    };

    private static getPostParams(key: string) {
        return {
            hostname:"api.openai.com",
            port: 443,
            path:"/v1/chat/completions",
            method: "POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer " + key  
            }
        }
        
    }

}

class DataEventIterator implements AsyncIterator<any> {

    private buffer: any[] = [];
    private done = false;
    private eventEmitter: EventEmitter;
    private eventName: string;
  
    constructor(eventEmitter: EventEmitter, eventName: string) {
      this.eventEmitter = eventEmitter;
      this.eventName = eventName;
      this.eventEmitter.on(this.eventName, this.handleData);
      this.eventEmitter.on('end', this.handleEnd);
    }
  
    private handleData = (data: any) => {
      this.buffer.push(data);
    };
  
    private handleEnd = () => {
      this.done = true;
      this.eventEmitter.removeListener(this.eventName, this.handleData);
      this.eventEmitter.removeListener('end', this.handleEnd);
    };
  
    public async next(): Promise<IteratorResult<any>> {
      if (this.buffer.length > 0) {
        return { value: this.buffer.shift(), done: false };
      }
  
      if (this.done) {
        return { value: undefined, done: true };
      }
  
      await new Promise<void>((resolve) => {
        this.eventEmitter.once(this.eventName, resolve);
      });
  
      return this.next();
    }
  
    public [Symbol.asyncIterator](): AsyncIterator<any> {
      return this;
    }
  }
  
  const response = new EventEmitter();

  const asyncIterator = new DataEventIterator(response, 'data');


  (async () => {
    for await (const chunk of asyncIterator) {
      console.log('Received chunk:', chunk);
      // Дополнительная логика обработки данных
    }
  })();





const generateNumber = {
    [Symbol.asyncIterator]() {
      let current = 0;
      const end = 10;
  
      return {
        async next(): Promise<{ value: number; done: boolean }> {
          if (current <= end) {
            return Promise.resolve({ value: current++, done: false });
          }
          return Promise.resolve({ value: current, done: true });
        },
      };
    },
  };
  
  async function printNumbers() {
    for await (const n of generateNumber) {
      console.log(n);
    }
  }

  
  
  
//   class ResponseDataIterator implements AsyncIterable<string> {
//     private fullMessage: string[] = [];
//     private options: RequestOptions;
  
//     constructor(options: RequestOptions) {
//       this.options = options;
//     }
  
//     [Symbol.asyncIterator](): AsyncIterator<string> {
//       const fullMessage = this.fullMessage;
//       const options = this.options;
  
//       let currentIndex = 0;
  
//       return {
//         async next(): Promise<IteratorResult<string>> {
//           if (currentIndex < fullMessage.length) {
//             const value = fullMessage[currentIndex++];
//             return Promise.resolve({ value, done: false });
//           } else {
//             return new Promise((resolve, reject) => {
//               const request = https.request(options, (response: IncomingMessage) => {
//                 response.on('data', (chunk) => {
//                   try {
//                     const msg: string = chunk.toString();
//                     const splitMsg: string[] = msg.split('\n\n');
  
//                     for (const [index, item] of splitMsg.entries()) {
//                       if (item !== '') {
//                         const editMsg = item.replace('data: ', '');
//                         const chatResponse: OpenAIResponse = JSON.parse(editMsg);
//                         const checkPart = chatResponse.choices?.[0].delta?.content;
  
//                         const needPart = checkPart !== null && checkPart !== undefined ? checkPart : '';
  
//                         if (needPart !== '') {
//                           fullMessage.push(needPart);
//                           resolve({ value: needPart, done: false });
//                         }
//                       }
//                     }
//                   } catch (error: any) {
//                     reject(error);
//                   }
//                 });
  
//                 response.on('end', () => {
//                   resolve({ value: '', done: true });
//                 });
//               });
  
//               request.on('error', (error: any) => {
//                 reject(error);
//               });
  
//               const body = JSON.stringify({
//                 model: "gpt-3.5-turbo",
//                 messages: [{ "role": "user", "content": options.message }],
//                 stream: true
//               });
  
//               request.write(body);
//               request.end();
//             });
//           }
//         }
//       };
//     }
//   }

//   async function fetchData(): Promise<void> {
//     const iterator = new ResponseDataIterator(options);
  
//     for await (const data of iterator) {
//       // Обработка каждого события данных
//       console.log(data);
//     }
  
//     // Здесь может быть дополнительный код, выполняемый после завершения итерации
//   }