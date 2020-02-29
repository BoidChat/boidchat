const socket = io.connect('http://localhost:3000');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5;

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

	cube.rotation.x += (mouse.x / screen.width) * 0.3;
	cube.rotation.y += (mouse.y / screen.height) * 0.3;

	renderer.render(scene, camera);
};
animate();
