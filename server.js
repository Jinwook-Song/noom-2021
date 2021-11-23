"use strict";

var _http = _interopRequireDefault(require("http"));

var _socket = _interopRequireDefault(require("socket.io"));

var _express = _interopRequireDefault(require("express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Backend
var app = (0, _express["default"])();
var port = 3000;
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", _express["default"]["static"](__dirname + "/public"));
app.get("/", function (req, res) {
  return res.render("home");
});
app.get("/*", function (req, res) {
  return res.redirect("/");
}); // http & ws on the save port (create ws server on http server)

var httpServer = _http["default"].createServer(app);

var wsServer = (0, _socket["default"])(httpServer);
wsServer.on("connection", function (bSocket) {
  bSocket.on("join_room", function (roomName) {
    bSocket.join(roomName);
    bSocket.to(roomName).emit("welcome");
  });
  bSocket.on("offer", function (offer, roomName) {
    bSocket.to(roomName).emit("offer", offer);
  });
  bSocket.on("answer", function (answer, roomName) {
    bSocket.to(roomName).emit("answer", answer);
  });
  bSocket.on("ice", function (ice, roomName) {
    bSocket.to(roomName).emit("ice", ice);
  });
});

var handleListen = function handleListen() {
  return console.log("Listening on http://localhost:".concat(port, " \u2705"));
};

httpServer.listen(port, handleListen);