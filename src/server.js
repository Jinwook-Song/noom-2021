// Backend

import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

// http & ws on the save port (create ws server on http server)
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

wsServer.on("connection", (bSocket) => {
  bSocket["nickname"] = "Anonymous";
  bSocket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  bSocket.on("enter_room", (roomName, done) => {
    bSocket.join(roomName);
    done();
    bSocket.to(roomName).emit("welcome", bSocket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  bSocket.on("disconnecting", () => {
    bSocket.rooms.forEach((room) =>
      bSocket.to(room).emit("bye", bSocket.nickname, countRoom(room) - 1)
    );
  });
  bSocket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  bSocket.on("new_message", (msg, roomName, done) => {
    bSocket.to(roomName).emit("new_message", `${bSocket.nickname}: ${msg}`);
    done();
  });
  bSocket.on("nickname", (nickname) => {
    bSocket["nickname"] = nickname;
  });
});

// fake DB
const sockets = [];

// listening who connected
// wss.on("connection", (bSocket) => {
//   sockets.push(bSocket);
//   bSocket["nickname"] = "Anonymous";
//   console.log("Connected to the Browser ✅");
//   bSocket.on("close", () => console.log("Disconnected from the Browser ❌"));
//   bSocket.on("message", (msg) => {
//     const parsedMsg = JSON.parse(msg);
//     switch (parsedMsg.type) {
//       case "new_message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${bSocket.nickname}: ${parsedMsg.payload}`)
//         );
//         break;
//       case "nickname":
//         bSocket["nickname"] = parsedMsg.payload;
//         break;
//     }
//   });
// });

const handleListen = () => console.log(`Listening on http://localhost:4000 ✅`);
httpServer.listen(4000, handleListen);
