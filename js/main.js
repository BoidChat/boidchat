var scene, camera, render, controls;
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
class Boid {
	constructor(object, name, id) {
		this.object = object;
		this.name = name;
		this.id = id;
	}
}

scene = new THREE.Scene();
var cubeTexture = new THREE.CubeTextureLoader()
.setPath( './images/panorama/' )
.load( [
    'px.png',
    'nx.png',
    'py.png',
    'ny.png',
    'pz.png',
    'nz.png'
] );
scene.background = cubeTexture;

camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshNormalMaterial();

renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
window.addEventListener('resize', onResize, false);

controls = new PointerLockControls( camera, document.body );

let boidai = [];
addBoids();
function addBoids() {
	for (var i = 0; i < 30; i++) {
		boidai[i] = new Boid(new THREE.Mesh(geometry, material), "Boidas" + i, i);
		boidai[i].object.position.x = 2 * i;
		scene.add(boidai[i].object);
	}
}

function onResize( event ) {

	const width = window.innerWidth;
	const height = window.innerHeight;
	
    camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize( width, height );
				
}

function animate() {
	requestAnimationFrame(animate);
	for (var i = 0; i < boidai.length; i++) {
		boidai[i].object.rotation.x += 0.05;
        boidai[i].object.rotation.y += 0.05;
    }
    camera.position.x = boidai[14].object.position.x;
    camera.position.y = boidai[0].object.position.y;
    camera.position.z = boidai[0].object.position.z + 10;

	renderer.render(scene, camera);
}
animate();
