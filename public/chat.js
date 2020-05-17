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
	let marked_text = name + ": " + linkify(data);
	node.innerHTML = marked_text;
	document.getElementById("chatBox").appendChild(node);
});

function linkify(text, element) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
}

function hideChat(){
	document.getElementById("chatBox").style.visibility = "hidden";
	document.getElementById("chatHeader").style.bottom = "50px";
	document.getElementById("minmize").style.visibility = "hidden";
	document.getElementById("maximize").style.visibility = "visible";

}

function showChat(){
	document.getElementById("chatBox").style.visibility = "visible";
	document.getElementById("chatHeader").style.bottom = "450px";
	document.getElementById("minmize").style.visibility = "visible";
	document.getElementById("maximize").style.visibility = "hidden";
}




