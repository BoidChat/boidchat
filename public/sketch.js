let plane_count = 0;
const planes = [];
let plane;
let ready = false;
let main_boid = undefined;
let boid_base = undefined;

const socket = io.connect();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
const camera_queue = new ML_Queue(60);
const mouse_queue = new ML_Queue(60);


 scene.background = new THREE.CubeTextureLoader().setPath('images/panorama/').load(['px.png', 'nx.png',
 	'py.png', 'ny.png', 'pz.png', 'nz.png']);
 scene.background.minFilter = THREE.LinearFilter;

let loadingManager = new THREE.LoadingManager();
loadingManager.onStart = function() {
	ready = false;
};
loadingManager.onLoad = function() { //triggers when plane model is loaded
	main_boid = new Boid(planes[0], boid_base); //makes current client plane/boid
	scene.add(main_boid.geom);
	socket.emit('update_info', main_boid.get_base());
	main_boid.geom.rotation.reorder("YXZ");//requered orientation
	ready = true;
};

const objLoader = new THREE.OBJLoader(loadingManager);
objLoader.setPath('models/');

const mtlLoader = new THREE.MTLLoader(loadingManager);
mtlLoader.setPath('models/');

const light = new THREE.AmbientLight(0x404040, 7); // soft white light
scene.add(light);

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

let mouse = {
	x: screen.width / 2,
	y: screen.height / 2
};
onmousemove = (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
};
socket.on('init', (data) => { //server acknoledging new boid initialisation send by 'register'
	boid_base = data.base;
	mtlLoader.load('Plane.mtl', (materials) => {
		materials.preload();
		objLoader.setMaterials(materials);
		objLoader.load('Plane.obj', (object) => {
			plane = object.clone();
			for (let e = 0; e < data.count; e++) { //preliminary adds other users boids
				pl = plane.clone();
				pl.children[0].material = plane.children[0].material;
				scene.add(pl);
				planes.push(pl);
				plane_count++;
			}
		});
	});
	$('#loginModal').modal('hide');
});
let data = undefined;
let inter_data = undefined;
socket.on('live', (d) => {
	if (ready) {
		data = d; //TODO need to put as argument to 'animate' instead of global varieble
		inter_data = interpolate(data, main_boid.id);
		let my_data = main_boid.live(data);
		socket.emit('update_info', my_data);
		requestAnimationFrame(animate);
	}
});

// socket.on('registration_failed', (response) => { // response.error contains error message
// 	let name = undefined;
// 	//your code in case of registration failure here
// 	socket.emit('register' , Math.floor(Math.random() * 100000).toString()/**insert user name here as parameter*/); //sends request to server to create new boid, initialisation
// 	// socket.emit('register' , name); //sends request to server to create new boid, initialisation
// });

// function registration(name){
// 	//socket.emit('register' , Math.floor(Math.random() * 100000).toString()/**insert user name here as parameter*/); //sends request to server to create new boid, initialisation
// 	socket.emit('register' , name); //sends request to server to create new boid, initialisation
// }

//registration("username");

function animate() {

	if (data.length != planes.length) { //adjusts planes to comply with data
		while (data.length > planes.length) {
			let pl = plane.clone();
			pl.children[0].material = plane.children[0].material;;
			scene.add(pl);
			planes.push(pl);
			plane_count++;
		}
		while (data.length < planes.length) {
			let pl = planes.pop();
			scene.remove(pl);
			plane_count--;
		}
	}
	
	// let my_data = main_boid.live(data);
	// socket.emit('update_info', my_data);
	//<<<<<<<<<<others
	let plane_index = 1;
	let dir_vect = undefined;
	//<<<<<<<<<<raw data
	// for (var i = 0; i < data.length; i++) {
	// 	if (main_boid.id != data[i].id) {
	// 		let other_boid = data[i];
	// 		dir_vect = to_vector3(other_boid.velocity).normalize();
	// planes[plane_index].position.set(other_boid.position[0], other_boid.position[1], other_boid.position[2]);
	//>>>>>>>>>>raw data
	//<<<<<<<<<<interpolated data
	for (var i = 0; i < inter_data.length; i++) {
		if (main_boid.id != inter_data[i].id) {
			let other_boid = inter_data[i];
			dir_vect = (other_boid.velocity.clone()).normalize();
			planes[plane_index].position.set(other_boid.position.x, other_boid.position.y, other_boid.position.z);
			//>>>>>>>>interpolated data
			let body_x_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion((new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, -1), (new THREE.Vector3(0, dir_vect.y, -1)).normalize()));
			let body_y_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion((new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, -1), (new THREE.Vector3(dir_vect.x, 0, dir_vect.z)).normalize()));
			planes[plane_index].rotation.setFromRotationMatrix(body_y_matrix.multiply(body_x_matrix));
			plane_index++;
		}
	}
	//>>>>>>>>>>others
	//main boid rotations
	dir_vect = main_boid.velocity.clone().normalize();
	camera_queue.push(dir_vect.clone());
	let body_x_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion((new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, -1), (new THREE.Vector3(0, dir_vect.y, -1)).normalize()));
	let body_y_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion((new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, -1), (new THREE.Vector3(dir_vect.x, 0, dir_vect.z)).normalize()));
	main_boid.geom.rotation.setFromRotationMatrix(body_y_matrix.multiply(body_x_matrix));

	//camera movement around boid
	camera_dist = 10;
	mouse_queue.push([mouse.x, mouse.y]);
	let mouse_average = mouse_queue.get_average_arr();
	// console.log(mouse.x, mouse.y, mouse_average);
	//with mouse delay
	let x_rotation = ((mouse_average[1] / window.innerHeight) - 0.5) * Math.PI * 2;
	let y_rotation = ((mouse_average[0] / window.innerWidth) - 0.5) * Math.PI * 2;
	//without muse delay
	// let x_rotation = ((mouse.y / window.innerHeight) - 0.5) * Math.PI * 2;
	// let y_rotation = ((mouse.x / window.innerWidth) - 0.5) * Math.PI * 2;
	//old version
	// camera.position.x = main_boid.position.x + Math.cos(0.5 * x_rotation) * camera_dist * Math.sin(-y_rotation);
	// camera.position.z = main_boid.position.z + Math.cos(0.5 * x_rotation) * camera_dist * Math.cos(-y_rotation);
	// camera.position.y = main_boid.position.y + camera_dist * Math.sin(0.5 * x_rotation);

	let y_matrix = (new THREE.Matrix4()).makeRotationY(-y_rotation);
	let x_matrix = (new THREE.Matrix4()).makeRotationX(x_rotation / 2);
	// let q = (new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir_vect); // without camera delay
	let q = (new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, 1), camera_queue.get_average_V3()); // with camera delay
	let velocity_camera_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion(q);

	dir_vect.set(0, 0, -camera_dist);
	dir_vect.applyMatrix4(x_matrix.multiply(y_matrix));
	dir_vect.applyMatrix4(velocity_camera_matrix); // tracking camera

	camera.position.x = main_boid.position.x + dir_vect.x;
	camera.position.y = main_boid.position.y + dir_vect.y;
	camera.position.z = main_boid.position.z + dir_vect.z;

	controls.target.copy(main_boid.position);
	controls.update();
	renderer.render(scene, camera);
};
