var plane_count = 0;
const planes = [];
var plane;
var ready = false
var main_boid = undefined;
var boid_base = undefined;

const socket = io.connect();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new THREE.OrbitControls(camera, renderer.domElement);

//<<<<<<<<<<<<<<template boid
// const template_boid_geometry = new THREE.Geometry();
// template_boid_geometry.vertices.push(
//   new THREE.Vector3(0, 0, -0.4),     // 0
//   new THREE.Vector3( 0.4,-0.2, 1),   // 1
//   new THREE.Vector3(-0.4, -0.2, 1),  // 2
//   new THREE.Vector3( 0, 0.6, 0.9)    // 3
// );
// template_boid_geometry.faces.push(
// 	new THREE.Face3(0, 1, 2), //bottom
// 	new THREE.Face3(0, 3, 1), //right
// 	new THREE.Face3(0, 2, 3), //left
// 	new THREE.Face3(1, 3, 2), //back
//   );
//   const template_boid_material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
//   template_boid = new THREE.Mesh(template_boid_geometry, template_boid_material); 
// //>>>>>>>>>>>>>>template boid

scene.background = new THREE.CubeTextureLoader().setPath('images/panorama/').load(['px.png', 'nx.png',
'py.png', 'ny.png', 'pz.png', 'nz.png']);
scene.background.minFilter = THREE.LinearFilter;

var loadingManager = new THREE.LoadingManager();
loadingManager.onStart = function() {
	ready = false;
}
loadingManager.onLoad = function(){
	main_boid = new Boid(planes[0], boid_base);
	scene.add(main_boid.geom);
	socket.emit('update_info', main_boid.get_base());
	main_boid.geom.rotation.reorder("YXZ");
	ready = true;
}

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

function add_figures() {
	const geometry = new THREE.BoxGeometry(1, 1, 1);
	const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
	const cube = new THREE.Mesh(geometry, material);
	scene.add(cube);
	
	const geometry2 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
	const material2 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	const cube2 = new THREE.Mesh(geometry2, material2);
	cube2.position.x = 1;
	scene.add(cube2);
	
	const geometry3 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
	const material3 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	const cube3 = new THREE.Mesh(geometry3, material3);
	cube3.position.y = 1;
	scene.add(cube3);
	
	const geometry4 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
	const material4 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
	const cube4 = new THREE.Mesh(geometry4, material4);
	cube4.position.z = 1;
	scene.add(cube4);
}

let mouse = {
	x: screen.width / 2,
	y: screen.height / 2
};
onmousemove = (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
};

socket.on('init', (data) => {
	boid_base = data.base;
	mtlLoader.load('Plane.mtl', (materials) => {
		materials.preload();
		objLoader.setMaterials(materials);
		objLoader.load('Plane.obj', (object) => {
			plane = object.clone();
			for(var e = 0; e < data.count; e++){
				pl = plane.clone();
				pl.children[0].material = plane.children[0].material;
				scene.add(pl);
				planes.push(pl);
				plane_count++;
			}
		});
	});
})

let data = undefined;
socket.on('live', (d) => {
	if(ready){
		data = d;
			
		// socket.emit('send_message', main_boid.name); //demonstration, need to put this somewhere else
		requestAnimationFrame(animate);
	}
})

socket.on('receive_message', (data) => {
	console.log(data);
})

socket.emit('register' /**insert user name here as parameter*/);

// socket.on('NewConnection', function(){
// 	var pl = plane.clone();
// 	pl.children[0].material = plane.children[0].material;;
// 	scene.add(pl);
// 	planes.push(pl);
// 	plane_count++;
// })

function animate(){
	if (data.length != planes.length){
		while (data.length > planes.length){
			var pl = plane.clone();
			pl.children[0].material = plane.children[0].material;;
			scene.add(pl);
			planes.push(pl);
			plane_count++;
		}
		while (data.length < planes.length){
			let pl = planes.pop();
			scene.remove(pl);
			plane_count--;
		}
	}
	let my_data = main_boid.live(data);
	socket.emit('update_info', my_data);
	
	//<<<<<<<<<<others
	let plane_index = 1
	for(var i = 0; i < data.length; i++){
		
		if (main_boid.id != data[i].id){
			let other_boid = data[i];
			let dir_vect = to_vector3(other_boid.velocity).normalize();
			planes[plane_index].position.set(other_boid.position[0], other_boid.position[1], other_boid.position[2]);
			planes[plane_index].rotation.setFromQuaternion((new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir_vect)));
			plane_index++;
		}
	}
	//>>>>>>>>>>others
	
	var dir_vect = main_boid.velocity.clone().normalize();
	var body_x_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion((new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, -1), (new THREE.Vector3(0, dir_vect.y, -1)).normalize()));
	var body_y_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion((new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, -1), (new THREE.Vector3(dir_vect.x, 0, dir_vect.z)).normalize()));
	main_boid.geom.rotation.setFromRotationMatrix(body_y_matrix.multiply(body_x_matrix));
	
	camera_dist = 10;
	var x_rotation = ((mouse.y / window.innerHeight) - 0.5) * Math.PI * 2;
	var y_rotation = ((mouse.x / window.innerWidth) - 0.5) * Math.PI * 2;
	//old version
	// camera.position.x = main_boid.position.x + Math.cos(0.5 * x_rotation) * camera_dist * Math.sin(-y_rotation);
	// camera.position.z = main_boid.position.z + Math.cos(0.5 * x_rotation) * camera_dist * Math.cos(-y_rotation);
	// camera.position.y = main_boid.position.y + camera_dist * Math.sin(0.5 * x_rotation);
	
	var y_matrix = (new THREE.Matrix4()).makeRotationY(-y_rotation);
	var x_matrix = (new THREE.Matrix4()).makeRotationX(x_rotation/2);
	var q = (new THREE.Quaternion()).setFromUnitVectors( new THREE.Vector3(0, 0, 1), dir_vect);
	var velocity_camera_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion(q);
	
    dir_vect.set(0, 0, -camera_dist);
	dir_vect.applyMatrix4(x_matrix.multiply(y_matrix));
	dir_vect.applyMatrix4(velocity_camera_matrix);
	
	camera.position.x = main_boid.position.x + dir_vect.x;
	camera.position.y = main_boid.position.y + dir_vect.y;
	camera.position.z = main_boid.position.z + dir_vect.z;
	
	controls.target.copy(main_boid.position);
	controls.update();
	renderer.render(scene, camera);
};
