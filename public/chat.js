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
	node.id = "message";
	let marked_text = name + ": " + linkify(data);
	node.innerHTML = marked_text;
	var chat = document.getElementById("chatBox");
	var toScroll = chat.scrollTop + chat.clientHeight - chat.scrollHeight;
	chat.appendChild(node);
	if(toScroll > -20 && toScroll < 20)
		chat.scrollTop = chat.scrollHeight;
});

function linkify(text, element) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
}

function hideChat(){
	document.getElementById("chatBox").style.visibility = "hidden";
	var head = document.getElementById("chatHeader");
	head.style.bottom = document.getElementById("textBox").offsetHeight + "px";
	document.getElementById("minmize").style.visibility = "hidden";
	document.getElementById("maximize").style.visibility = "visible";

}

function showChat(){
	document.getElementById("chatBox").style.visibility = "visible";
	var head = document.getElementById("chatHeader");
	head.style.bottom = document.getElementById("chatBox").offsetHeight + head.offsetHeight +"px" ;
	document.getElementById("minmize").style.visibility = "visible";
	document.getElementById("maximize").style.visibility = "hidden";
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize(){
	var head = document.getElementById("chatHeader");
	if(document.getElementById("chatBox").style.getPropertyValue("visibility") == "hidden"){
		head.style.bottom = document.getElementById("textBox").offsetHeight + "px";
	}
	else{
		head.style.bottom = document.getElementById("chatBox").offsetHeight + head.offsetHeight +"px" ;
	}
}




