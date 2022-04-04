const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});
const router = require("./router");
const port = process.env.PORT || 3003;

const users = [];
const rooms = [];

app.use(router);

app.get("/", (req, res) => {
  res.send("<h1>Hey Socket.io</h1>");
});

io.on("connection", (socket) => {
  //join room
  socket.on("join-room", (roomName) => {
    socket.join(roomName);
  });

  // creates new room
  socket.on("create-room", (roomName, showcase, admin) => {
    rooms.push(roomName);
    socket.join(roomName);
    io.emit("created-room", roomName, showcase, admin, rooms);
  });

  /// message for user leaving
  socket.on("disconnect", () => {
    io.emit("leave-message", `Guest-${socket.id.split("", 1)} left.`);
    io.emit("leave-message-2", count);
  });

  /// message for the user joining
  socket.broadcast.emit(
    "join-message",
    `Guest-${socket.id.split("", 1)} has joined.`
  );

  /// syncing video
  socket.on("sync-audio", (played, songs, upNext, Duration) => {
    socket.broadcast.emit("syncing-audio", played, songs, upNext, Duration);
  });

  /// message for the user joining
  socket.broadcast.emit(
    "join-message",
    `Guest-${socket.id.split("", 1)} has joined.`
  );

  // skipping songs
  socket.on("send-skip", (skip) => {
    io.emit("skip", skip);
  });

  /// sending messages
  socket.on("send-message", (message, name) => {
    if (!name) {
      io.emit("receive-message", message, `Guest-${socket.id.split("", 1)}`);
    } else {
      io.emit("receive-message", message, name);
    }
  });

  // sends song submission
  socket.on("song-submit", (songSubmission, songSubmissionTitle, song) => {
    io.emit(
      "song-recieved",
      songSubmission,
      songSubmissionTitle,
      song,
      `${socket.id}`
    );
  });

  // sends song submission notification
  socket.on("submit-notification", (songSubmissionTitle) => {
    io.emit(
      "send-notification",
      `${songSubmissionTitle} was submitted by Guest-${socket.id.split("", 1)}.`
    );
  });

  let count = io.engine.clientsCount;
  io.emit("user-count", count);
});

http.listen(port, () => {
  console.log(`Socket.IO server running at PORT:${port}/`);
});
