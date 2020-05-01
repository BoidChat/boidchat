import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { THREE } from 'three.js';
import { DOCUMENT } from '@angular/common';
import {Socket, SocketIoConfig }from 'ngx-socket-io';

@Component({
  selector: 'app-sketch-screen',
  templateUrl: './sketch-screen.component.html',
  styleUrls: ['./sketch-screen.component.css']
})


export class SketchScreenComponent implements OnInit {
  config: SocketIoConfig = { url: 'http://localhost:80/', options: {} };
  private plane_count = 0;
  private planes = [];
  private plane;
  private ready = false;
  private main_boid = undefined;
  private boid_base = undefined;

  private socket2=new Socket(this.config);

  private scene ;
  private camera;
  private renderer ;
  
  private controls ;
  private mouse;
  constructor(@Inject(DOCUMENT) private document: Document) {
    

   }
  @HostListener('document:mousemove', ['$event'])
  onMousemove(event) {
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;
  }

  ngOnInit(): void {
    this.socket2 = this.socket2.connect()

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.document.body.appendChild(this.renderer.domElement);
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)


    this.scene.background = new THREE.CubeTextureLoader().setPath('images/panorama/').load(['px.png', 'nx.png',	'py.png', 'ny.png', 'pz.png', 'nz.png']);
    this.scene.background.minFilter = THREE.LinearFilter;
    let mouse = {
      x: screen.width / 2,
      y: screen.height / 2
    };

    let loadingManager = new THREE.LoadingManager();
    loadingManager.onStart = function() {
      this.ready = false;
    };
    loadingManager.onLoad = function() { //triggers when plane model is loaded
      this.main_boid = new Boid(this.planes[0], this.boid_base); //makes current client plane/boid
      this.scene.add(this.main_boid.geom);
      this.socket2.emit('update_info', this.main_boid.get_base());
      this.main_boid.geom.rotation.reorder("YXZ");//requered orientation
      this.ready = true;
    };

    const objLoader = new THREE.OBJLoader(loadingManager);
    objLoader.setPath('models/');

    const mtlLoader = new THREE.MTLLoader(loadingManager);
    mtlLoader.setPath('models/');

    const light = new THREE.AmbientLight(0x404040, 7); // soft white light
    this.scene.add(light);

    window.addEventListener('resize', this.onWindowResize, false);

  
       
    this.socket2.on('init', (data) => { //server acknowledging new boid initialisation send by 'register'
      this.boid_base = data.base;
      mtlLoader.load('Plane.mtl', (materials) => {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('Plane.obj', (object) => {
          this.plane = object.clone();
          for (let e = 0; e < data.count; e++) { //preliminary adds other users boids
            var pl = this.plane.clone();
            pl.children[0].material = this.plane.children[0].material;
            this.scene.add(pl);
            this.planes.push(pl);
            this.plane_count++;
          }
        });
      });
    });

    this.socket2.on('live', (d) => {
      if (this.ready) {		 //TODO need to put as argument to 'animate' instead of global variable

        // socket2.emit('send_message', main_boid.name); //demonstration, need to put this somewhere else
        requestAnimationFrame(() => this.animate(d));
      }
    });

    this.socket2.on('receive_message', (data) => { //does what it says
      console.log(data);
    });

    this.socket2.emit('register' /**insert user name here as parameter*/); //sends request to server to create new boid, initialisation

  }

  

  animate(data) {
    if (data.length != this.planes.length) { //adjusts planes to comply with data
      while (data.length > this.planes.length) {
        let pl = this.plane.clone();
        pl.children[0].material = this.plane.children[0].material;;
        this.scene.add(pl);
        this.planes.push(pl);
        this.plane_count++;
      }
      while (data.length < this.planes.length) {
        let pl = this.planes.pop();
        this.scene.remove(pl);
        this.plane_count--;
      }
    }
    let my_data = this.main_boid.live(data);
    this.socket2.emit('update_info', my_data);
  
    //<<<<<<<<<<others
    let plane_index = 1;
    let dir_vect = undefined;
    for (var i = 0; i < data.length; i++) {
      if (this.main_boid.id != data[i].id) {
        let other_boid = data[i];
        dir_vect = this.to_vector3(other_boid.velocity).normalize();
        this.planes[plane_index].position.set(other_boid.position[0], other_boid.position[1], other_boid.position[2]);
        let body_x_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion((new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, -1), (new THREE.Vector3(0, dir_vect.y, -1)).normalize()));
        let body_y_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion((new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, -1), (new THREE.Vector3(dir_vect.x, 0, dir_vect.z)).normalize()));
        this.planes[plane_index].rotation.setFromRotationMatrix(body_y_matrix.multiply(body_x_matrix));
        plane_index++;
      }
    }
    //>>>>>>>>>>others
    //main boid rotations
    dir_vect = this.main_boid.velocity.clone().normalize();
    let body_x_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion((new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, -1), (new THREE.Vector3(0, dir_vect.y, -1)).normalize()));
    let body_y_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion((new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, -1), (new THREE.Vector3(dir_vect.x, 0, dir_vect.z)).normalize()));
    this.main_boid.geom.rotation.setFromRotationMatrix(body_y_matrix.multiply(body_x_matrix));
  
    //camera movement around boid
    var camera_dist = 10;
    
    let x_rotation = ((this.mouse.y / window.innerHeight) - 0.5) * Math.PI * 2;
    let y_rotation = ((this.mouse.x / window.innerWidth) - 0.5) * Math.PI * 2;
    //old version
    // camera.position.x = main_boid.position.x + Math.cos(0.5 * x_rotation) * camera_dist * Math.sin(-y_rotation);
    // camera.position.z = main_boid.position.z + Math.cos(0.5 * x_rotation) * camera_dist * Math.cos(-y_rotation);
    // camera.position.y = main_boid.position.y + camera_dist * Math.sin(0.5 * x_rotation);
  
    let y_matrix = (new THREE.Matrix4()).makeRotationY(-y_rotation);
    let x_matrix = (new THREE.Matrix4()).makeRotationX(x_rotation / 2);
    let q = (new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir_vect);
    let velocity_camera_matrix = (new THREE.Matrix4()).makeRotationFromQuaternion(q);
  
    dir_vect.set(0, 0, -camera_dist);
    dir_vect.applyMatrix4(x_matrix.multiply(y_matrix));
    dir_vect.applyMatrix4(velocity_camera_matrix);
  
    this.camera.position.x = this.main_boid.position.x + dir_vect.x;
    this.camera.position.y = this.main_boid.position.y + dir_vect.y;
    this.camera.position.z = this.main_boid.position.z + dir_vect.z;
  
    this.controls.target.copy(this.main_boid.position);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    };

    to_vector3(arr) {
      return new THREE.Vector3(arr[0], arr[1], arr[2]);
    }
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export class Boid{
  //placeholder
  private max_velocity = 0.5;
  private free_movement_radius = 35; //radius where icentric force(not limited by max_force) starts
  // private free_movement_radius = 20; //radius where icentric force(not limited by max_force) starts
  private outer_radius = this.free_movement_radius * 0.2; //coordinate center should be (0 0 0)
  private max_force = 0.03;
  private noise_const = 1 / 10;

  private position;
  private velocity;
  private acceleration;
  private perception;
  private geom;
  private name;
  private id;
  private cluster_id;
  private neighbours;

  constructor(geom,base){
    this.position = this.rand_vect(30); //need changes
    // this.position = rand_vect(20); //need changes
    this.velocity = this.rand_vect(0.5);
    this.acceleration = new THREE.Vector3();
    // this.perception = 6;
    this.perception = 8;
    this.geom = geom;
    this.geom.position.set(this.position.x, this.position.y, this.position.z);
    this.name = base.name;
    this.id = base.id;
    this.cluster_id = base.cluster_id;
    this.neighbours = new Array();
  }

  get_base(){
    return {
      id: this.id,
      name: this.name,
      cluster_id: this.cluster_id,
      position: this.position.toArray(),
      velocity: this.velocity.toArray(),
      neighbors: this.neighbours
    };
  }

  live(data) {
    // this.acceleration = rand_vect(oise_const * max_force * Math.pow(3, (-1/3)));//add noise;
    this.apply_alignment(data);
    this.apply_separation(data);
    this.apply_cohesion(data);
    this.acceleration = this.normalize_vect(this.acceleration, data.max_force);
    this.apply_attraction_to_center(); //modifies acceleration, repels from border
    // this.acceleration = normalize_vect(this.acceleration, max_force);
    this.velocity.add(this.acceleration);
    this.velocity = this.normalize_vect(this.velocity, data.max_velocity);
    this.position.add(this.velocity);
    this.geom.position.set(this.position.x, this.position.y, this.position.z);
    this.acceleration.set(0, 0, 0);
    this.update_neighbors(data);
    return {
      id: this.id,
      name: this.name,
      cluster_id: this.cluster_id,
      position: this.position.toArray(),
      velocity: this.velocity.toArray(),
      neighbors: this.neighbours
    };
  }

  update_neighbors(data) {
    this.neighbours = new Array();
    let position = this.position.toArray();
    for (let i = 0; i < data.length; i++) {
      if (this.distance(position, data[i].position) <= this.perception && data[i].id != this.id) {
        this.neighbours.push(data[i].id);
      }
    }
  }

  apply_alignment(data) {
    let all_vectors = [0, 0, 0];
    let count = 0;
    let position = this.position.toArray();
    for (let i = 0; i < data.length; i++) {
      if (this.distance(position, data[i].position) <= this.perception && data[i].id != this.id) {
        this.add_to(all_vectors, data[i].velocity);
        count++;
      }
    }
    if (count != 0) {
      let steer_vel = this.to_vector3(this.divide_scalar(all_vectors, count));
      this.normalize_vect(steer_vel, this.max_velocity);
      this.acceleration.add(steer_vel.sub(this.velocity));
    }
  }

  apply_separation(data) {
    let all_vectors = [0, 0, 0];
    let count = 0;
    let position = this.position.toArray();
    for (let i = 0; i < data.length; i++) {
      if (this.distance(position, data[i].position) < this.perception && data[i].id != this.id) {
        this.add_to(all_vectors, data[i].position);
        count++;
      }
    }
    if (count != 0) {
      let from_center = this.position.clone().sub(this.to_vector3(this.divide_scalar(all_vectors, count)));
      let proportion = 1 - (from_center.length() / this.perception);
      this.acceleration.add(this.normalize_vect(from_center, this.max_force * proportion ** 2));
    }
  }

  apply_cohesion(data) {
    let all_vectors = [0, 0, 0];
    let count = 0;
    let position = this.position.toArray();
    for (let i = 0; i < data.length; i++) {
      if (this.distance(position, data[i].position) < this.perception && data[i].id != this.id) {
        this.add_to(all_vectors, data[i].position);
        count++;
      }
    }
    if (count > 0) {
      let to_center = this.to_vector3(this.divide_scalar(all_vectors, count)).sub(this.position);
      this.acceleration.add(this.normalize_vect(to_center, this.max_force * 0.25));
    }
  }

  apply_attraction_to_center(){
    let dist_to_center = this.position.length();
    if (dist_to_center > this.free_movement_radius) {
      let diff = this.free_movement_radius - dist_to_center;
      let d = this.normalize_vect(this.position.clone(), this.max_force * (diff / this.outer_radius));
      this.acceleration.add(d);
    }
  }

  rand_vect(multiplier) {
    let vect = new THREE.Vector3();
    for (let i = 0; i < 3; i++) {
      let a = (Math.random() - 0.5) * 2 * multiplier;
      vect.setComponent(i, a);
    }
    return vect;
  }

  normalize_vect(vect, max_length) {
    if (vect.length() > max_length) {
      vect = vect.multiplyScalar(max_length / vect.length());
    }
    return vect;
  }
  
  distance(a, b) {
    var sum = 0;
    for (let i = 0; i < 3; i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }
  
  divide_scalar(vect, scalar) {
    for (let i = 0; i < 3; i++) {
      vect[i] /= scalar;
    }
    return vect;
  }
  
  multiply_scalar(vect, scalar) {
    for (let i = 0; i < 3; i++) {
      vect[i] *= scalar;
    }
    return vect;
  }
  
  add_to(a, b) {
    for (let i = 0; i < 3; i++) {
      a[i] += b[i];
    }
    return a;
  }
  
  sub_from(a, b) {
    for (let i = 0; i < 3; i++) {
      a[i] -= b[i];
    }
    return a;
  }
  
  to_vector3(arr) {
    return new THREE.Vector3(arr[0], arr[1], arr[2]);
  }
  
}
