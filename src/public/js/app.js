// Frontend

const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");
// Connect to the backend
const fSocket = new WebSocket(`ws://${window.location.host}`);

fSocket.addEventListener("open", () => {
  console.log("Connected to the Server ✅");
});

fSocket.addEventListener("message", (msg) => {
  console.log("New message:", msg.data);
});

fSocket.addEventListener("close", () => {
  console.log("Disconnected from the Server ❌");
});

const handleSubmit = (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  fSocket.send(input.value);
  input.value = "";
};

messageForm.addEventListener("submit", handleSubmit);
