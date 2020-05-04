//makes random array
function rand_vect(multiplier) {
	let vect = new THREE.Vector3();
	for (let i = 0; i < 3; i++) {
		let a = (Math.random() - 0.5) * 2 * multiplier;
		vect.setComponent(i, a);
	}
	return vect;
}

function streach_vect(vect, new_length) {
	let length =  vect.length();
	if (length > 0){
		return vect.multiplyScalar(new_length / vect.length());
	}
	return vect;
}

function normalize_vect(vect, max_length) {
	if (vect.length() > max_length) {
		vect = vect.multiplyScalar(max_length / vect.length());
	}
	return vect;
}

function normalize_vect2(vect, max_length, min_length) {
	let length = vect.length();
	if (length > max_length) {
		vect = vect.multiplyScalar(max_length / length);
	}
	else if (length < min_length) {
		vect = vect.multiplyScalar(min_length / length);
	}
	return vect;
}

function arr_length(arr) {
	sum = 0;
	for (let i = 0; i < arr.length; i++) {
		sum += arr[i] ** 2;
	}
	return Math.sqrt(sum);
}

function distance(a, b) {
	sum = 0;
	for (let i = 0; i < 3; i++) {
		sum += (a[i] - b[i]) ** 2;
	}
	return Math.sqrt(sum);
}

function divide_scalar(vect, scalar) {
	for (let i = 0; i < vect.length; i++) {
		vect[i] /= scalar;
	}
	return vect;
}

function multiply_scalar(vect, scalar) {
	for (let i = 0; i < 3; i++) {
		vect[i] *= scalar;
	}
	return vect;
}

function add_to(a, b) {
	if(a.length == 0){
		a = new Array(b.length);
		a.fill(0);
	}
	for (let i = 0; i < b.length; i++) {
		a[i] += b[i];
	}
	return a;
}

function sub_from(a, b) {
	for (let i = 0; i < 3; i++) {
		a[i] -= b[i];
	}
	return a;
}

function to_vector3(arr) {
	return new THREE.Vector3(arr[0], arr[1], arr[2]);
}
