const socket = io.connect('http://localhost:3000/');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new THREE.OrbitControls(camera, renderer.domElement);

//<<<<<<<<<<<<<<template boid
const template_boid_geometry = new THREE.Geometry();
template_boid_geometry.vertices.push(
  new THREE.Vector3(0, 0, -0.4),        // 0
  new THREE.Vector3( 0.4,-0.2, 1),   // 1
  new THREE.Vector3(-0.4, -0.2, 1),  // 2
  new THREE.Vector3( 0, 0.6, 0.9)    // 3
);
template_boid_geometry.faces.push(
	new THREE.Face3(0, 1, 2), //bottom
	new THREE.Face3(0, 3, 1), //right
	new THREE.Face3(0, 2, 3), //left
	new THREE.Face3(1, 3, 2), //back
  );
  const template_boid_material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const template_boid = new THREE.Mesh(template_boid_geometry, template_boid_material); 
//>>>>>>>>>>>>>>template boid



//<<<<<<<<<<<<<should be on the server
var boid_env = new Enviroment();
for(var i = 0; i < 100; i++){
	boid = new Boid(template_boid.clone(), "Boid Nr." + i, i);
	scene.add(boid.geom);
	boid_env.add_boid(boid);
}
main_boid = boid_env.population[0];
main_boid.geom.rotation.reorder("YXZ");
//>>>>>>>>>>>>>should be on the server

scene.background = new THREE.CubeTextureLoader().setPath('images/panorama/').load(['px.png', 'nx.png',
	'py.png', 'ny.png', 'pz.png', 'nz.png']);

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

add_figures();

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
	socket.emit('mouse', mouse);
};

socket.on('mouse', (_mouse) => {
	mouse.x = _mouse.x;
	mouse.y = _mouse.y;
})

var t = 0.01;
const animate = () => {
	requestAnimationFrame(animate);
	//<<<<<<<<<<other clients

	for(var i = 1; i < boid_env.population.length; i++){
		boid_env.population[i].live(boid_env);
		var dir_vect = boid_env.population[i].velocity.clone().normalize();
		// boid_env.population[i].geom.rotation.setFromQuaternion(two_vectors_to_quaternion(new THREE.Vector3(0, 0, -1), dir_vect));
		boid_env.population[i].geom.rotation.setFromQuaternion((new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir_vect)));
	}
	//>>>>>>>>>>other clients

	// boid_env.population[0].position.set(5, 5, 5);
	boid_env.population[0].live(boid_env);
	var dir_vect = boid_env.population[0].velocity.clone().normalize();
	var body_x_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion((new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, -1), (new THREE.Vector3(0, dir_vect.y, -1)).normalize()));
	var body_y_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion((new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, -1), (new THREE.Vector3(dir_vect.x, 0, dir_vect.z)).normalize()));
	boid_env.population[0].geom.rotation.setFromRotationMatrix(body_y_matrix.multiply(body_x_matrix));

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
animate();
