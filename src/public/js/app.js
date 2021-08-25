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

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector("input");
  const value = input.value;
  fSocket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const form = room.querySelector("form");
  form.addEventListener("submit", handleMessageSubmit);
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

fSocket.on("bye", () => {
  addMessage("someone left");
});

fSocket.on("new_message", addMessage);
