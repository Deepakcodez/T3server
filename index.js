const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Define allowed origins for CORS
const allowedOrigins = [
  "https://chatter-ji.vercel.app",
  "http://localhost:5173",
];

// CORS options
const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.IO with CORS options
const io = new Server(server, {
  cors: corsOptions,
});

// Handle connection event
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for custom events
  socket.on("message", (data) => {
    console.log("Message received:", data);

    // Broadcast the message to all clients except the sender
    socket.broadcast.emit("message", data);
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
