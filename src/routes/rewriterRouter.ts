import { Router } from 'express';
import http from 'http';
import { Parser } from 'htmlparser2';
import { getPolygonArchiveLinks, getPolygonLinks } from '../parser/polygonPagesWrapper'
import { getArticalArray } from '../parser/polygonArticalsWrapper'
import { Console } from 'console';
const router = Router();


router.get('/', async (req, res) => {
    
    var links = await getPolygonLinks();
    var articals = await getArticalArray(links);
    
    res.send(articals);
    //res.send(`<div class=\'test\'> Hello, rewriter! </div> `);
});


export default router;