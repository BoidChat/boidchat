var scene, camera, render;
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
scene.background = new THREE.CubeTextureLoader()
	.setPath( './images/panorama/' )
	.load( [
		'px.png',
		'nx.png',
		'py.png',
		'ny.png',
		'pz.png',
		'nz.png'
	] );

camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshNormalMaterial();

renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.addEventListener('mousemove', onMouseMove, true);
window.addEventListener('resize', onResize, false);

let boidai = [];
addBoids();
function addBoids() {
	for (var i = 0; i < 30; i++) {
		boidai[i] = new Boid(new THREE.Mesh(geometry, material), "Boidas" + i, i);
		boidai[i].object.position.x = 2 * i;
		scene.add(boidai[i].object);
	}
}

function onMouseMove( event ) {

	mouse.x = ( event.clientX - (window.innerHeight / 2) );
	mouse.y = ( event.clientY - (window.innerHeight / 2) );

}

function onMouseWheel( event ) {

  camera.position.z += event.deltaY * 0.1; // move camera along z-axis

}

function onResize( event ) {

	const width = window.innerWidth;
	const height = window.innerHeight;
  
  windowHalf.set( width / 2, height / 2 );
	
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
    
    target.x = ( 1 - mouse.x ) * 0.002;
    target.y = ( 1 - mouse.y ) * 0.002;
    
    camera.rotation.x += 0.05 * ( target.y - camera.rotation.x );
    camera.rotation.y += 0.05 * ( target.x - camera.rotation.y );

	renderer.render(scene, camera);
}
animate();
