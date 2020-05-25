const { RTCPeerConnection, RTCSessionDescription } = window;


socket.on('registration_success', function() {
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

	var constraints = { audio: true, video: false };
	navigator.getUserMedia(constraints, (stream) => {
		// Create an AudioNode from the stream
		const mediaStreamSource =
			audioContext.createMediaStreamSource(stream);
		mediaStreamSource.connect(filterNode);
		filterNode.connect(gainNode);
		// connect the gain node to the destination (i.e. play the sound)
		gainNode.connect(audioContext.destination);

	}, function() { console.log("failed to get media"); });


	participant1 = audioContext.createMediaStreamSource(participant1_stream),
		participantN = audioContext.createMediaStreamSource(participantN_stream);

	// Send the stream to MediaStream, which needs to be connected to PC
	var destination_participant1 = audioContext.createMediaStreamDestination();
	mediaStreamSource.connect(destination_participant1); // Send local stream to the mixer
	participantN.connect(destination_participant1); // add all participants to the mix
	// Add the result stream to PC for participant1 , most likely you will want to disconnect the previous one using removeStream
	pc.addStream(destination_participant1.stream);

});
