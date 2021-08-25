// Frontend

// connect Server that using socket.io
const fSocket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

// function -->
const addMessage = (msg) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
};

const handleRoomSubmit = (event) => {
  event.preventDefault();
  const input = form.querySelector("input");
  fSocket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
};
// <-- function

form.addEventListener("submit", handleRoomSubmit);

fSocket.on("welcome", () => {
  addMessage("someone joined!");
});
