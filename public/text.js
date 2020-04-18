
function process(evt) {
	if (evt.keyCode === 13) {
		console.log(evt);
		alert(evt.target.value);
	}
}
