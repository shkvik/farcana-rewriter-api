import * as https from 'https';
import * as fs from 'fs';
import * as WebSocket from 'ws';

// Пути к SSL-сертификату и приватному ключу
const sslCertPath = '/путь/к/ssl/сертификату.crt';
const privateKeyPath = '/путь/к/приватному/ключу.key';

// Создание HTTPS сервера с SSL сертификатом
const serverOptions: https.ServerOptions = {
  cert: fs.readFileSync(sslCertPath),
  key: fs.readFileSync(privateKeyPath),
};

const server = https.createServer(serverOptions);

// Создание WebSocket сервера
const wss = new WebSocket.Server({ server });

// Обработчик подключения нового клиента
wss.on('connection', (ws: WebSocket) => {
  // Обработка сообщений от клиента
  ws.on('message', (message: string) => {
    console.log('Получено сообщение от клиента:', message);
    
    // Отправка сообщения обратно клиенту
    ws.send('Сообщение получено');
  });

  // Обработчик закрытия соединения клиента
  ws.on('close', () => {
    console.log('Соединение закрыто');
  });
});

// Запуск сервера на порту 8080
server.listen(8080, () => {
  console.log('WebSocket сервер запущен');
});