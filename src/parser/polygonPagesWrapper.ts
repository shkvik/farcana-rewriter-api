import https from 'https';
import { Parser } from 'htmlparser2';
import { Console } from 'console';
import * as WebSocket from 'ws';

export enum step {
    LinkParsing,
    ContentParsing,
}

export interface ProcessMessage {
    step:  step;
    count: number;
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function getHTML(url: string): Promise<string> {

    return new Promise<string>((resolve, reject) => {
        let html = '';
        https.get(url, { rejectUnauthorized: false }, (response) => {
            response.on('data', (chunk) => {   
                html += chunk;
            });

            response.on('end', () => {
                resolve(html);
            });

        })
    })
}


export async function getLinkByClass(targetClass: string, htmlStr: string): Promise<string[]> {

    let articalLinks: string[] = new Array<string>();
    let foundElement: string | null = null;

        const parser = new Parser({

            onopentag(name, attributes) {
    
                if (name === 'a' && attributes.class === targetClass) {
    
                    if(attributes.href != null) {
                        articalLinks.push(attributes.href);
                    }
                }
            },
    
            ontext(text) {
                if (foundElement !== '') {
                    foundElement += text;
                }
            },
    
            onclosetag(tagname) {
                if (foundElement !== '' && tagname === targetClass) {
                    console.log(foundElement);
                    foundElement = '';
                }
            },
        });
    
        parser.write(htmlStr);
        parser.end();

        return articalLinks != null ? articalLinks : new Array<string>();

}


export async function getPolygonLinks(callBack: (msg: string) => void): Promise<string[]> {

    let articalLinks: string[] = new Array<string>();
    var targetClass: string = 'c-entry-box--compact__image-wrapper';
    var PolygonURL = "https://www.polygon.com/";
    var PolygonArchiveURL = "https://www.polygon.com/archives/";

    var PolygonUrlHtml = await getHTML(PolygonURL);
    var result = await getLinkByClass(targetClass, PolygonUrlHtml);

    articalLinks = articalLinks.concat(result);



    var clui = require('clui');

    var Progress = clui.Progress;

    var thisProgressBar = new Progress(40);

    


    var dbgCount: number = 1

    for(let i: number = 0; i < dbgCount; i++) {

        var progressCounter: number = (i * 100)/(dbgCount * 100);

        var tmpHtml: string   = await getHTML(`${PolygonArchiveURL}${i}`);
        var result:  string[] = await getLinkByClass(targetClass, tmpHtml);

        articalLinks = articalLinks.concat(result);

        process.stdout.write('\x1B[1F\x1B[2K');
        console.log(thisProgressBar.update(progressCounter));


        var msg: ProcessMessage = 
        {
            step: step.LinkParsing,
            count: progressCounter
        }
        callBack(JSON.stringify(msg));
    }

    process.stdout.write('\x1B[1F\x1B[2K');
    console.log(thisProgressBar.update(1));

    return articalLinks;
}



export async function getPolygonArchiveLinks(): Promise<string[] | null> {

    const url: string = 'https://www.polygon.com/archives/';
    const targetClass: string = 'c-entry-box--compact__image-wrapper';

    

    return new Promise<string[] | null>((resolve, reject) => {

        https.get(url, { rejectUnauthorized: false }, (response) => {

            console.log('я стартанул');

            let html = '';
            let articalLinks: string[] = new Array<string>();
            let foundElement: string | null = null;

            response.on('data', (chunk) => {
                html += chunk;
            });

            response.on('end', () => {

                const parser = new Parser({

                    onopentag(name, attributes) {

                        if (name === 'a' && attributes.class === targetClass) {
                            if(attributes.href != null) {
                                articalLinks.push(attributes.href);
                            }
                        }

                    },

                    ontext(text) {
                        if (foundElement !== '') {
                            foundElement += text;
                        }
                    },

                    onclosetag(tagname) {
                        if (foundElement !== '' && tagname === targetClass) {
                            console.log(foundElement);
                            resolve(articalLinks);
                            foundElement = '';
                        }
                    },

                    onend() {
                        console.log('Parsing finished');
                        
                    }
                });

                parser.write(html);
                parser.end();
                
                resolve(articalLinks != null ? articalLinks : null);

            })
            
        })
    })
}




        
