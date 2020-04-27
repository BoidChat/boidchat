socket.on('cluster_info', (data) => {
	const parent = document.getElementById("flockers");
	while (parent.firstChild) {
		parent.removeChild(parent.lastChild);
	}
	for(let i = 0; i < data.length; i++){
		let node = document.createElement("p");
		node.id = "flockers" + i;
		node.innerHTML = '<font color="FFFFFF">' + data[i];
		document.getElementById("flockers").appendChild(node);
	}
});