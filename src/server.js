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
  console.log(bSocket);
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

const handleListen = () => console.log(`Listening on http://localhost:3000 ✅`);
httpServer.listen(3000, handleListen);
