socket.on('cluster_info', (data) => {
	const parent = document.getElementById("flockers");
	while (parent.firstChild) {
		parent.removeChild(parent.lastChild);
	}
	for (let i = 0; i < data.length; i++) {
		let div = document.createElement("div");
		div.id = "flockers" + i;
		let node = document.createElement("p");
		node.innerHTML = '<font color="FFFFFF">' + data[i];
		node.style.display = "inline-block";
		div.appendChild(node);
		if(i != -1){
			let bl = document.createElement("button");
			bl.id = "blockButton";
			bl.textContent = "Blokuoti";
			div.appendChild(bl);
		}
		document.getElementById("flockers").appendChild(div);
	}
});
