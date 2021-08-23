// Frontend
// Connect to the backend
const fSocket = new WebSocket(`ws://${window.location.host}`);

fSocket.addEventListener("open", () => {
  console.log("Connected to the Server ✅");
});

fSocket.addEventListener("message", (msg) => {
  console.log("New message:", msg.data, "from the server");
});

fSocket.addEventListener("close", () => {
  console.log("Disconnected from the Server ❌");
});

setTimeout(() => {
  fSocket.send("Hello from the browser!");
}, 3000);
