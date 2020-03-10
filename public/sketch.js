const socket = io.connect('http://localhost:3000/');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new THREE.OrbitControls(camera, renderer.domElement);

scene.background = new THREE.CubeTextureLoader().setPath('images/panorama/').load(['px.png', 'nx.png',
	'py.png', 'ny.png', 'pz.png', 'nz.png']);

const boid_geometry = new THREE.SphereGeometry(0.1);
const boid_material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const main_boid = new THREE.Mesh(boid_geometry, boid_material);
scene.add(main_boid);

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
});

const animate = () => {
	requestAnimationFrame(animate);
	camera_dist = 5;
	// main_boid.position.x += 0.02; /test
	x_rotation = ((mouse.y / window.innerHeight) - 0.5) * Math.PI * 2;
	y_rotation = ((mouse.x / window.innerWidth) - 0.5) * Math.PI * 2;

	camera.position.x = main_boid.position.x + Math.cos(0.5 * x_rotation) * camera_dist * Math.sin(-y_rotation);
	camera.position.z = main_boid.position.z + Math.cos(0.5 * x_rotation) * camera_dist * Math.cos(-y_rotation);
	camera.position.y = main_boid.position.y + camera_dist * Math.sin(0.5 * x_rotation);
	controls.target.copy(main_boid.position);
	controls.update();

	renderer.render(scene, camera);
};
animate();

