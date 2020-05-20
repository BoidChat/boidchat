String.prototype.hashCode = function() {
	let hash = 0;
	for (let i = 0; i < this.length; i++) {
		hash += this.charCodeAt(i) * 999331;
	}
	return Math.abs(hash);
};

function map_range(x, in_min, in_max, out_min, out_max) {
	return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function text_to_color(text) {
	const hash = text.hashCode(), min_b = 150;
	let r = hash & 255, g = (hash >>> 8) & 255, b = (hash >>> 16) & 255;
	if (g > b) {
		if (g > r) g = Math.round(map_range(g, 0, 255, min_b, 255));
		else r = Math.round(map_range(r, 0, 255, min_b, 255));
	} else {
		if (b > r) b = Math.round(map_range(b, 0, 255, min_b, 255));
		else r = Math.round(map_range(r, 0, 255, min_b, 255));
	}
	return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
}

function sendMessage(evt) {
	if (evt.keyCode === 13) {
		if (evt.target.value != "")
			socket.emit('send_message', evt.target.value);
		evt.target.value = "";
	}
}

function sendButton() {
	if (document.getElementById("textBox").value != "") {
		socket.emit('send_message', document.getElementById("textBox").value);
	}
	document.getElementById("textBox").value = "";
}

socket.on('receive_message', (data, name) => {
	let div = document.createElement("div");
	div.id = "message";
	let node = document.createElement("span");
	let time = document.createElement("span");
	let nameT = document.createElement("span");
	time.id = "messageTime";
	nameT.id = "messageName";
	nameT.style.color = text_to_color(name);
	node.id = "messageText";
	nameT.innerText = name + ":";
	let marked_text = linkify(data);
	let today = new Date();
	let h = today.getHours();
	let m = today.getMinutes();
	h = checkTime(h);
	m = checkTime(m);
	time.innerText = h + ":" + m;
	node.innerHTML = marked_text;
	let chat = document.getElementById("chatBox");
	let toScroll = chat.scrollTop + chat.clientHeight - chat.scrollHeight;
	div.appendChild(nameT);
	div.appendChild(node);
	div.appendChild(time);
	chat.appendChild(div);
	if (toScroll > -20 && toScroll < 20)
		chat.scrollTop = chat.scrollHeight;
});
function checkTime(i) {
	if (i < 10) { i = "0" + i; };  // add zero in front of numbers < 10
	return i;
}

function linkify(text) {
	let urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	return text.replace(urlRegex, function(url) {
		return '<a href="' + url + '">' + url + '</a>';
	});
}

function hideChat() {
	document.getElementById("chatBox").style.visibility = "hidden";
	let head = document.getElementById("chatHeader");
	head.style.bottom = document.getElementById("textBox").offsetHeight + "px";
	document.getElementById("minmize").style.visibility = "hidden";
	document.getElementById("maximize").style.visibility = "visible";

}

function showChat() {
	document.getElementById("chatBox").style.visibility = "visible";
	let head = document.getElementById("chatHeader");
	head.style.bottom = document.getElementById("chatBox").offsetHeight + head.offsetHeight + "px";
	document.getElementById("minmize").style.visibility = "visible";
	document.getElementById("maximize").style.visibility = "hidden";
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
	let head = document.getElementById("chatHeader");
	if (document.getElementById("chatBox").style.getPropertyValue("visibility") == "hidden") {
		head.style.bottom = document.getElementById("textBox").offsetHeight + "px";
	}
	else {
		head.style.bottom = document.getElementById("chatBox").offsetHeight + head.offsetHeight + "px";
	}
}




