const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuid } = require('uuid');
const path = require('path');

const port = process.env.PORT || 3000;
const staticPath = path.join(__dirname, './public');
app.set('view engine', 'ejs');
app.use(express.static(staticPath));

app.use('/peerjs', require('peer').ExpressPeerServer(server, {
  debug: true
}));

app.get('/', (req, res) => {
  res.redirect(`/${uuid()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    console.log(userId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });
});

server.listen(port);