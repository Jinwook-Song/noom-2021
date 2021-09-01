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

wsServer.on("connection", (bSocket) => {
  bSocket.on("join_room", (roomName, done) => {
    bSocket.join(roomName);
    done();
    bSocket.to(roomName).emit("welcome");
  });
  bSocket.on("offer", (offer, roomName) => {
    bSocket.to(roomName).emit("offer", offer);
  });
});

const handleListen = () => console.log(`Listening on http://localhost:4000 ✅`);
httpServer.listen(4000, handleListen);
