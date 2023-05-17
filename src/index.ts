import express, { Express } from 'express';
import { router, updateServerReference } from './routes/rewriterRouter'
import * as WebSocket from 'ws';
import * as https from 'https';
import fs from 'fs';


const privateKey = fs.readFileSync('./ssl/key.pem', 'utf8');
const certificate = fs.readFileSync('./ssl/cert.pem', 'utf8');

const serverOptions: https.ServerOptions = {
    key:  privateKey,
    cert: certificate,
};

const app: Express = express();


app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'https://shkrift.com:9000');
    next();
});

app.use('/api/Polygon', router);



app.get('/', (req, res) => {
    res.send('Hello, world!');
});

const server = https.createServer(serverOptions, app);
const port = 443; // Порт HTTPS-сервера




// Обработчик подключения нового клиента

server.listen(port, () => {
    console.log('WebSocket сервер запущен');
    console.log(`HTTPS server is running on port ${port}`);
});

updateServerReference(server);