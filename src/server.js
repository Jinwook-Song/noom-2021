import http from 'http';
import SocketIO from 'socket.io';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on('connection', (bSocket) => {
  bSocket.on('join_room', (roomName) => {
    bSocket.join(roomName);
    bSocket.to(roomName).emit('welcome');
  });
  bSocket.on('offer', (offer, roomName) => {
    bSocket.to(roomName).emit('offer', offer);
  });
  bSocket.on('answer', (answer, roomName) => {
    bSocket.to(roomName).emit('answer', answer);
  });
});

const handleListen = () => console.log(`✅ Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
