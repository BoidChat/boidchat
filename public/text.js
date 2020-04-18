function process(evt) {
	if (evt.keyCode === 13) {
		console.log(evt);
		var node = document.createElement("p");
		node.id = "chat";
		var textnode = document.createTextNode(evt.target.value);
		node.appendChild(textnode);
		document.getElementById("chatBox").appendChild(node);
	}
}
