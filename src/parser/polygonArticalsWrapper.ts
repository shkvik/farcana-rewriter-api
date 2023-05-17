import { getHTML, ProcessMessage, step } from './polygonPagesWrapper'
import { Parser } from 'htmlparser2';
import * as htmlparser2 from "htmlparser2";
import * as cheerio from "cheerio";
import * as WebSocket from 'ws';

export interface Artical {
    id: number;
    title:       string;
    description: string;
    author:      string;
    article:     string;
    rewrited:    string;
    date:        string;
}

export async function getArticalArray(urls: string[], callBack: (msg: string) => void): Promise<Artical[]> {

    var clui = require('clui');

    var Progress = clui.Progress;

    var thisProgressBar = new Progress(40);

    const articalArr: Artical[] = new Array<Artical>();

    // for (const [index, item] of urls.entries()) {
    //     const dom = htmlparser2.parseDocument(await getHTML(item));
    //     const $ = cheerio.load(dom, { xmlMode: true });
    
    //     articalArr.push({
    //         id:          index,
    //         Title:       $("h1.c-page-title").text(),
    //         Description: $("p.c-entry-summary.p-dek").text(),
    //         Author:      $("span.c-byline__author-name").text(),
    //         Article:     $("div.c-entry-content").text(),
    //         Date:        $("time.c-byline__item").text(),
    //         Rewrited:    ''
    //     });
    
    //     process.stdout.write('\x1B[1F\x1B[2K');
    //     console.log(thisProgressBar.update(index, urls.length));
    //   }

    var dbgCount = 10;
    for(var i: number = 0; i < dbgCount; i++){

        const dom = htmlparser2.parseDocument(await getHTML(urls[i]));
        const $ = cheerio.load(dom, { xmlMode: true });
    
        articalArr.push({
            id:          i,
            title:       $("h1.c-page-title").text(),
            description: $("p.c-entry-summary.p-dek").text(),
            author:      $("span.c-byline__author-name").text(),
            article:     $("div.c-entry-content").text().replace(/[\x00-\x1F\x7F-\x9F]/g, ''),
            date:        $("time.c-byline__item").text(),
            rewrited:    ''
        });
    
        process.stdout.write('\x1B[1F\x1B[2K');
        console.log(thisProgressBar.update(i, dbgCount));

        var msg: ProcessMessage = 
        {
            step: step.ContentParsing,
            count: i/dbgCount
        }
        callBack(JSON.stringify(msg));

    }
    process.stdout.write('\x1B[1F\x1B[2K');
    console.log(thisProgressBar.update(dbgCount, dbgCount));
    return await Promise.all(articalArr);
}