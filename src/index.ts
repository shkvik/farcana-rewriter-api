import express, { Express } from 'express';
import rewriterRowter from './routes/rewriterRouter'
import https from 'https';
import fs from 'fs';

const privateKey = fs.readFileSync('./ssl/key.pem', 'utf8');
const certificate = fs.readFileSync('./ssl/cert.pem', 'utf8');

const credentials = {
    key:  privateKey,
    cert: certificate,
};

const app: Express = express();

app.use('/rewriter', rewriterRowter);

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

const httpsServer = https.createServer(credentials, app);
const port = 443; // Порт HTTPS-сервера

httpsServer.listen(port, () => {
    console.log(`HTTPS server is running on port ${port}`);
});

var clui = require('clui');

var Progress = clui.Progress;

var thisProgressBar = new Progress(40);

console.log(thisProgressBar.update(1));