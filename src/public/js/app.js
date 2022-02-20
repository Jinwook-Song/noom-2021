const fSocket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');

const call = document.getElementById('call');

// initialize
call.hidden = true;
let myStream;
let muted = true;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras() {
  try {
    await navigator.mediaDevices.enumerateDevices();
  } catch (error) {
    console.log(error);
  }
}

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = myStream;
    await getCameras();
  } catch (error) {
    console.log(error);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (muted) {
    muteBtn.innerText = 'Unmute';
    muted = false;
  } else {
    muteBtn.innerText = 'Mute';
    muted = true;
  }
}

function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = 'Turn Camera Off';
    cameraOff = false;
  } else {
    cameraBtn.innerText = 'Turn Camera On';
    cameraOff = true;
  }
}

muteBtn.addEventListener('click', handleMuteClick);
cameraBtn.addEventListener('click', handleCameraClick);

// Welcome Form (join a room)

const welcome = document.getElementById('welcome');
const welcomeForm = welcome.querySelector('form');

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event?.preventDefault();
  const input = welcomeForm.querySelector('input');
  await initCall();
  fSocket.emit('join_room', input.value ?? 'test room');
  roomName = input.value;
  input.value = '';
}

welcomeForm.addEventListener('submit', handleWelcomeSubmit);

// Socket Code

fSocket.on('welcome', async () => {
  // Peer A
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  // Send offer to Peer B
  fSocket.emit('offer', offer, roomName);
});

// Peer B
fSocket.on('offer', async (offer) => {
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  // Send answer to Peer A
  fSocket.emit('answer', answer, roomName);
});

// Peer A
fSocket.on('answer', (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

// RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    // Free Stun Server provided by google, only for test
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302',
        ],
      },
    ],
  });
  myPeerConnection.addEventListener('icecandidate', handleIce);
  myPeerConnection.addEventListener('track', handleAddStream);
  // Peer Connection에  Audio, Video Track을 추가
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

// send ICE candidate
function handleIce(ice) {
  // send ice candidate to the other browser
  fSocket.emit('ice', ice.candidate, roomName);
}

// receive ICE candidate
fSocket.on('ice', (ice) => {
  myPeerConnection.addIceCandidate(ice);
});

// handle strem from peer's
function handleAddStream(data) {
  const peerFace = document.getElementById('peerFace');
  peerFace.srcObject = data.streams[0];
}

// Create && Join the room
handleWelcomeSubmit();
