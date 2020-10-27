const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
//const { v4: uuidV4 } = require('uuid')

io.on('connection', socket => {
  console.log('User connected')
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(3000)