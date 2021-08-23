// Backend

import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000 ✅`);

// http & ws on the save port (create ws server on http server)
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// fake DB
const sockets = [];

// listening who connected
wss.on("connection", (bSocket) => {
  sockets.push(bSocket);
  console.log("Connected to the Browser ✅");
  bSocket.on("close", () => console.log("Disconnected from the Browser ❌"));
  bSocket.on("message", (msg) => {
    sockets.forEach((bSocket) => bSocket.send(msg.toString()));
  });
});

server.listen(3000, handleListen);
