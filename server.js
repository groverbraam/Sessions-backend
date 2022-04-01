const app = require('express')();
const http = require('http').Server(app);

const io = require('socket.io')(http, {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"]
    }
})
users = [];
connections = [];
rooms = [];
// Store all of the sockets and their respective room numbers
userrooms = {}

const port = process.env.PORT || 3003;

io.on('connection', socket => {
  
  /// message for user leaving
  socket.on('disconnect', () => {
    io.emit('leave-message', `${socket.id} left.`)
    io.emit('leave-message-2', count)
  })

  /// message for the user joining
  socket.broadcast.emit('join-message', `${socket.id} has joined.`)

  /// sending messages
  socket.on('send-message', (message,name) => {
    if(!name){
      io.emit('receive-message', message,`${socket.id}`)
    }else{
      io.emit('receive-message', message, name)
    }
  })

  // sends song submission
  socket.on('song-submit', (songSubmission, songSubmissionTitle, song) => {
      io.emit('song-recieved', songSubmission, songSubmissionTitle, song, `${socket.id}`)
      // console.log(song)
      // console.log(songSubmission)
      // console.log(songSubmissionTitle)
  })


  socket.on('joined', (played) => {
    if(played === 0){
      io.emit('video-sync', played)
    }else{
      null
    }
  })

  let count = io.engine.clientsCount;
  io.emit('user-count', count)
  // console.log(count)

})

http.listen(port, () => {
  console.log(`Socket.IO server running at PORT:${port}/`);
});