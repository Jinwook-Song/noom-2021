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

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on('connection', (bSocket) => {
  bSocket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  bSocket.on('join_room', (roomName) => {
    bSocket.join(roomName);
    bSocket.to(roomName).emit('welcome', bSocket.nickname, countRoom(roomName));
    wsServer.sockets.emit('room_change', publicRooms());
  });
  bSocket.on('disconnecting', () => {
    bSocket.rooms.forEach((room) =>
      bSocket.to(room).emit('bye', bSocket.nickname, countRoom(room) - 1)
    );
  });
  bSocket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', publicRooms());
  });

  bSocket.on('offer', (offer, roomName) => {
    bSocket.to(roomName).emit('offer', offer);
  });
  bSocket.on('answer', (answer, roomName) => {
    bSocket.to(roomName).emit('answer', answer);
  });
  bSocket.on('ice', (ice, roomName) => {
    bSocket.to(roomName).emit('ice', ice);
  });
});

const handleListen = () => console.log(`✅ Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
