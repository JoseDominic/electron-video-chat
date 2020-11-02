var inputRoomNumber = document.getElementById("roomNumber");
var btnGoRoom = document.getElementById("goRoom");
const videoGrid = document.getElementById('video-grid')
//const { v4: uuidV4 } = require('uuid')

const socket = io('https://video-sock-server.herokuapp.com/') //arg of io is url of signalling server

btnGoRoom.addEventListener('click', (event) => {
  if(inputRoomNumber === '') {
    alert('Enter a room number')
  }
  else{
    const ROOM_ID = inputRoomNumber.value
    console.log(ROOM_ID)
    //specify second argument object {host:domainname,port:value} to Peer() to use custom peer server
    //default is peerjs open cloud server if no second argument is specified
    const myPeer = new Peer(undefined,{
      host:'video-peer-server.herokuapp.com',
      port:443,
      secure:true,
      path:'/'
    })
    const myVideo = document.createElement('video')
    myVideo.muted = true
    const peers = {}
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      addVideoStream(myVideo, stream)
      myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
      })
    
      socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
      })
    })
    
    socket.on('user-disconnected', userId => {
      if (peers[userId]) peers[userId].close()
    })
    
    myPeer.on('open', id => {
      socket.emit('join-room', ROOM_ID, id)
    })
  }
})




function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

