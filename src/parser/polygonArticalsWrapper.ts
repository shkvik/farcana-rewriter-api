import { getHTML } from './polygonPagesWrapper'
import { Parser } from 'htmlparser2';
import * as htmlparser2 from "htmlparser2";
import * as cheerio from "cheerio";

interface Artical {
    id: number;
    Title:       string;
    Description: string;
    Author:      string;
    Article:     string;
    Rewrited:    string;
    Date:        string;
}

export async function getArticalArray(urls: string[]): Promise<Artical[]> {

    var clui = require('clui');

    var Progress = clui.Progress;

    var thisProgressBar = new Progress(40);

    const articalArr: Artical[] = new Array<Artical>();

    for (const [index, item] of urls.entries()) {
        const dom = htmlparser2.parseDocument(await getHTML(item));
        const $ = cheerio.load(dom, { xmlMode: true });
    
        articalArr.push({
            id:          index,
            Title:       $("h1.c-page-title").text(),
            Description: $("p.c-entry-summary.p-dek").text(),
            Author:      $("span.c-byline__author-name").text(),
            Article:     $("div.c-entry-content").text(),
            Date:        $("time.c-byline__item").text(),
            Rewrited:    ''
        });
    
        process.stdout.write('\x1B[1F\x1B[2K');
        console.log(thisProgressBar.update(index, urls.length));
      }

    return await Promise.all(articalArr);
}