const max_velocity = 0.5;
const min_velocity = 0.2;
const base_free_movement_radius = 50; //radius where icentric force(not limited by max_force) starts
let current_free_movement_radius = 50; //radius where icentric force(not limited by max_force) starts
const max_force = 0.03;
const noise_const = 1 / 10;
const max_angular_velocity = Math.PI / 2000; //rad./ms


function Boid(geom, base) {
	this.position = rand_vect(50); //need changes
	this.velocity = rand_vect(0.5);
	this.acceleration = new THREE.Vector3();
	this.perception = 10;
	this.geom = geom;
	this.geom.position.set(this.position.x, this.position.y, this.position.z);
	this.name = base.name;
	this.id = base.id;
	this.cluster_id = base.cluster_id;
	this.neighbors = new Array();
	this.last_live = Date.now();
}

Boid.prototype.get_base = function() {
	return {
		id: this.id,
		name: this.name,
		cluster_id: this.cluster_id,
		position: this.position.toArray(),
		velocity: this.velocity.toArray(),
		neighbors: this.neighbors
	};
};

Boid.prototype.live = function(data) {
	// this.acceleration = rand_vect(noise_const * max_force * Math.pow(3, (-1/3)));//add noise;
	this.apply_alignment(data);
	this.apply_separation(data);
	this.apply_cohesion(data);
	this.acceleration = normalize_vect(this.acceleration, max_force);
	this.apply_attraction_to_center(data.length); //modifies acceleration, repels from border
	this.add_obstacles();
	this.regress_to_averedge();
	this.adjust_by_time();
	this.velocity = normalize_vect2(this.velocity, max_velocity, min_velocity);
	this.update_neighbors(data);
	this.position.add(this.velocity);
	this.geom.position.set(this.position.x, this.position.y, this.position.z);
	this.acceleration.set(0, 0, 0);
	return {
		id: this.id,
		name: this.name,
		cluster_id: this.cluster_id,
		position: this.position.toArray(),
		velocity: this.velocity.toArray(),
		neighbors: this.neighbors
	};
};

Boid.prototype.adjust_by_time = function() {
	let new_time = Date.now();
	let elapsed = new_time - this.last_live;
	this.last_live = new_time;
	let new_vel = this.velocity.clone().add(this.acceleration);
	let current_angle = this.velocity.angleTo(new_vel);
	let target_angle = elapsed * max_angular_velocity;
	if (current_angle > target_angle) {
		let vel_length = new_vel.length();
		let rotation_axis = this.velocity.clone().cross(new_vel).normalize();
		this.velocity.applyAxisAngle(rotation_axis, target_angle);
		streach_vect(this.velocity, vel_length);
	}
	else {
		this.velocity.add(this.acceleration);
	}
};

Boid.prototype.add_obstacles = function() {
	let live_obstacles = get_active();
	let all_vectors = new THREE.Vector3();
	let count = 0;
	let position = this.position;
	for (let i = 0; i < live_obstacles.length; i++) {
		let ob_position = to_vector3(live_obstacles[i].position).multiplyScalar(current_free_movement_radius);
		// console.log(position.distanceTo(ob_position), live_obstacles[i].current_radius);
		if (position.distanceTo(ob_position) < live_obstacles[i].current_radius) {
			// let ob_position = to_vector3(ob_position);
			let from_obstacle = (position.clone()).sub(ob_position);
			let k = from_obstacle.length();
			let multiplier = 5 * ((1 - (from_obstacle.length() / live_obstacles[i].current_radius)) ** 2);
			all_vectors.add(from_obstacle.multiplyScalar(multiplier * max_force));
			count++;
		}
	}
	if (count > 0) {
		all_vectors.divideScalar(count);
		this.acceleration.add(all_vectors);
	}
};

Boid.prototype.regress_to_averedge = function() {
	let avg = (max_velocity + min_velocity) / 2;
	let diff = (avg - this.velocity.length()) / avg;
	this.acceleration.add(streach_vect(this.velocity.clone(), max_force * diff));
};

Boid.prototype.update_neighbors = function(data) {
	this.neighbors = new Array();
	let position = this.position.toArray();
	for (let i = 0; i < data.length; i++) {
		if (distance(position, data[i].position) <= this.perception && data[i].id != this.id) {
			this.neighbors.push(data[i].id);
		}
	}
};

Boid.prototype.apply_alignment = function(data) {
	let all_vectors = [0, 0, 0];
	let count = 0;
	let position = this.position.toArray();
	for (let i = 0; i < data.length; i++) {
		if (distance(position, data[i].position) <= this.perception && data[i].id != this.id) {
			add_to(all_vectors, data[i].velocity);
			count++;
		}
	}
	if (count != 0) {
		let steer_vel = to_vector3(divide_scalar(all_vectors, count));
		normalize_vect(steer_vel, max_velocity);
		this.acceleration.add(steer_vel.sub(this.velocity));
	}
};

Boid.prototype.apply_separation = function(data) {
	let all_vectors = [0, 0, 0];
	let count = 0;
	let position = this.position.toArray();
	for (let i = 0; i < data.length; i++) {
		if (distance(position, data[i].position) < this.perception / 2 && data[i].id != this.id) {
			add_to(all_vectors, data[i].position);
			count++;
		}
	}
	if (count > 0) {
		let to_center = to_vector3(divide_scalar(all_vectors, count)).sub(this.position);
		// this.acceleration.add(streach_vect(to_center, -max_force));
		this.acceleration.add(streach_vect(to_center, (this.perception - to_center.length()) * -max_force / this.perception));
	}
};

Boid.prototype.apply_cohesion = function(data) {
	let all_vectors = [0, 0, 0];
	let count = 0;
	let position = this.position.toArray();
	for (let i = 0; i < data.length; i++) {
		if (distance(position, data[i].position) < this.perception && data[i].id != this.id) {
			add_to(all_vectors, data[i].position);
			count++;
		}
	}
	if (count > 0) {
		let to_center = to_vector3(divide_scalar(all_vectors, count)).sub(this.position);
		this.acceleration.add(normalize_vect(to_center, max_force * 0.5));
	}
};

Boid.prototype.apply_attraction_to_center = function(count) {
	let free_movement_coafitient = Math.pow(base_free_movement_radius, 3) / (5 * Math.pow(this.perception, 3));
	let free_movement_radius;
	if (count <= 5) {
		free_movement_radius = base_free_movement_radius;
	}
	else {
		free_movement_radius = Math.pow((free_movement_coafitient * count * Math.pow(this.perception, 3)), 1 / 3);
	}
	current_free_movement_radius = free_movement_radius;
	let dist_to_center = this.position.length();
	let outer_radius = free_movement_radius * 0.5; //coordinate center should be (0 0 0)
	if (dist_to_center > free_movement_radius) {
		let diff = free_movement_radius - dist_to_center;
		let d = normalize_vect(this.position.clone(), max_force * (diff / outer_radius));
		this.acceleration.add(d);
	}
};
