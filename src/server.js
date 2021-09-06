// Backend

import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();
const port = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

// http & ws on the save port (create ws server on http server)
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (bSocket) => {
  bSocket.on("join_room", (roomName) => {
    bSocket.join(roomName);
    bSocket.to(roomName).emit("welcome");
  });
  bSocket.on("offer", (offer, roomName) => {
    bSocket.to(roomName).emit("offer", offer);
  });
  bSocket.on("answer", (answer, roomName) => {
    bSocket.to(roomName).emit("answer", answer);
  });
  bSocket.on("ice", (ice, roomName) => {
    bSocket.to(roomName).emit("ice", ice);
  });
});

const handleListen = () =>
  console.log(`Listening on http://localhost:${port} ✅`);
httpServer.listen(port, handleListen);
