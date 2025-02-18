const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Define allowed origins for CORS
const allowedOrigins = [
  "exp://192.168.149.246:8081",
  "http://localhost:8081",
  "http://192.168.149.246:3000",
];


// CORS options
const corsOptions = {
  origin: "*",
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

const socketToRoomMap = new Map();
const roomToSocketMap = new Map();
 

console.log("try to connect")
// Handle connection event
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for room creation event
  socket.on("createRoom", (roomId) => {
    console.log(`Room created: ${roomId} by ${socket.id}`);
    roomToSocketMap.set(roomId, socket.id);
    socketToRoomMap.set(socket.id, roomId);
    // Join the room
    socket.join(roomId);

    // Notify the user that the room was created
    socket.emit("roomCreated", roomId);

    // Notify other users in the room (if any)
    socket.to(roomId).emit("userJoined", socket.id);
  });

  socket.on("joinRoom", (roomId) => {
    console.log(`User ${socket.id} joined room ${roomId}`);
    const usersInRoom = roomToUsersMap.get(roomId);
    if (usersInRoom.length >= 2) {
      socket.emit("roomFull", { roomId });
      console.log(`Room ${roomId} is full. User ${socket.id} cannot join.`);
      return;
    }

    // Add the user to the room
    usersInRoom.push(socket.id);
    roomToUsersMap.set(roomId, usersInRoom);
    socketToRoomMap.set(socket.id, roomId);

    // Join the room
    socket.join(roomId);

    // Notify the user that they joined the room
    socket.emit("joinedRoom", { roomId, users: usersInRoom });

    // Notify other users in the room
    socket.to(roomId).emit("userJoined", { roomId, newUser: socket.id });

    console.log(
      `User ${socket.id} joined room ${roomId}. Room users:`,
      usersInRoom
    );

    // Check if the room is full
    if (usersInRoom.length === 2) {
      io.to(roomId).emit("roomReady", { roomId, users: usersInRoom });
      console.log(`Room ${roomId} is ready with 2 users.`);
    }
  });




  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
