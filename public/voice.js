let audioContext;
if (typeof AudioContext === 'function') {
	audioContext = new AudioContext();
} else if (typeof webkitAudioContext === 'function') {
	audioContext = new webkitAudioContext(); // eslint-disable-line new-cap
} else {
	console.log('Sorry! Web Audio not supported.');
}

// create a filter node
var filterNode = audioContext.createBiquadFilter();
// see https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#BiquadFilterNode-section
filterNode.type = 'highpass';
// cutoff frequency: for highpass, audio is attenuated below this frequency
filterNode.frequency.value = 10000;

// create a gain node (to change audio volume)
var gainNode = audioContext.createGain();
// default is 1 (no change); less than 1 means audio is attenuated
// and vice versa
gainNode.gain.value = 0.5;


navigator.mediaDevices.getUserMedia({ audio: true }, (stream) => {
	// Create an AudioNode from the stream
	const mediaStreamSource =
		audioContext.createMediaStreamSource(stream);
	mediaStreamSource.connect(filterNode);
	filterNode.connect(gainNode);
	// connect the gain node to the destination (i.e. play the sound)
	gainNode.connect(audioContext.destination);
});

const connection = new RTCPeerConnection();

function callUser(socketId) {
	if (!alreadyCalled(socketId)) {
		connection.addTrack();
	}
}

socket.on("disconnect", () => {
	connection.removeTrack();

});

