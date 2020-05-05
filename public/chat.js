function sendMessage(evt) {
	if (evt.keyCode === 13) {
		socket.emit('send_message', evt.target.value);
		evt.target.value = "";
	}
}

function sendButton(){
	socket.emit('send_message', document.getElementById("TextBox").value);
	document.getElementById("TextBox").value = "";
}

socket.on('receive_message', (data, name) => {
	var node = document.createElement("p");
	node.id = "chat";
	var sender = document.createTextNode(name);
	sender.appendData(": ");
	sender.appendData(data);
	node.appendChild(sender);
	document.getElementById("chatBox").appendChild(node);
});



