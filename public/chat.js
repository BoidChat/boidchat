function sendMessage(evt) {
	if (evt.keyCode === 13) {
		if(evt.target.value != "")
			socket.emit('send_message', evt.target.value);
		evt.target.value = "";
	}
}

function sendButton(){
	if(document.getElementById("textBox").value != "")
	{
		socket.emit('send_message', document.getElementById("textBox").value);
	}
	document.getElementById("textBox").value = "";
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




