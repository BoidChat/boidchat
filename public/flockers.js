let myNameIs = "";
socket.on('myName', (name) =>{
	myNameIs = name;
});
socket.on('cluster_info', (data) => {
	const parent = document.getElementById("flockers");
	while (parent.firstChild) {
		parent.removeChild(parent.lastChild);
	}
	for (let i = 0; i < data.length; i++) {
		let div = document.createElement("div");
		div.id = "flockers" + i;
		let node = document.createElement("p");
		node.innerText = data[i];
		node.style.display = "inline-block";
		node.style.color = text_to_color(data[i]);
		div.appendChild(node);
		if (i != -1) {
			if(myNameIs == ""){
				console.log("gotMyName");
				console.log(myNameIs);
				socket.emit('getMyName');
			}
			if(data[i] != myNameIs){
				let notBlocked = true;
				for(let e = 0; e < blocked.length; e++){
					if(data[i] == blocked[e]){
						notBlocked = false;
					}
				}
				if(notBlocked){
					let bl = document.createElement("button");
					bl.id = "blockButton";
					bl.textContent = "Blokuoti";
					bl.value = data[i];
					bl.onclick = function() {block(event);};
					div.appendChild(bl);
				}
				else{
					let bl = document.createElement("button");
					bl.id = "blockButton";
					bl.textContent = "Atblokuoti";
					bl.value = data[i];
					bl.onclick = function() {unBlock(event);};
					div.appendChild(bl);
				}
			}
		}
		document.getElementById("flockers").appendChild(div);
		// document.getElementById("flockers").appendChild(div.cloneNode(true));
		// document.getElementById("flockers").appendChild(div.cloneNode(true));
		// document.getElementById("flockers").appendChild(div.cloneNode(true));
		// document.getElementById("flockers").appendChild(div.cloneNode(true));
		// document.getElementById("flockers").appendChild(div.cloneNode(true));
		// document.getElementById("flockers").appendChild(div.cloneNode(true));
	}
});
