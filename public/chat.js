function sendMessage(evt) {
	if (evt.keyCode === 13) {
		socket.emit('send_message', evt.target.value);
		evt.target.value = "";
	}
}

socket.on('receive_message', (data, name) => {
	var node = document.createElement("p");
	node.id = "chat";
	var sender = document.createTextNode(name);
	sender.appendData(": ")
	sender.appendData(data)
	node.appendChild(sender);
	document.getElementById("chatBox").appendChild(node);
});



