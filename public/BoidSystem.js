const max_velocity = 0.5;
const min_velocity = 0.2;
const base_free_movement_radius = 30; //radius where icentric force(not limited by max_force) starts
// const base_free_movement_radius = 20; //radius where icentric force(not limited by max_force) starts
// const free_movement_radius = 20; //radius where icentric force(not limited by max_force) starts
const max_force = 0.03;
const noise_const = 1 / 10;


function Boid(geom, base) {
	this.position = rand_vect(30); //need changes
	// this.position = rand_vect(20); //need changes
	this.velocity = rand_vect(0.5);
	this.acceleration = new THREE.Vector3();
	this.perception = 10;
	// this.perception = 8;
	this.geom = geom;
	this.geom.position.set(this.position.x, this.position.y, this.position.z);
	this.name = base.name;
	this.id = base.id;
	this.cluster_id = base.cluster_id;
	this.neighbors = new Array();
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
	// this.acceleration = normalize_vect(this.acceleration, max_force);
	this.regress_to_averedge();
	this.velocity.add(this.acceleration);
	// this.velocity = normalize_vect(this.velocity, max_velocity);
	this.velocity = normalize_vect2(this.velocity, max_velocity, min_velocity);
	this.update_neighbors(data);
	this.position.add(this.velocity);
	this.geom.position.set(this.position.x, this.position.y, this.position.z);
	this.acceleration.set(0, 0, 0);
	// console.log(window.performance.now);
	return {
		id: this.id,
		name: this.name,
		cluster_id: this.cluster_id,
		position: this.position.toArray(),
		velocity: this.velocity.toArray(),
		neighbors: this.neighbors
	};
};

Boid.prototype.regress_to_averedge = function() {
	let avg = (max_velocity + min_velocity) / 2;
	let l = this.velocity.length();
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
		this.acceleration.add(streach_vect(to_center, -max_force));
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
	let dist_to_center = this.position.length();
	let outer_radius = free_movement_radius * 0.3; //coordinate center should be (0 0 0)
	if (dist_to_center > free_movement_radius) {
		let diff = free_movement_radius - dist_to_center;
		let d = normalize_vect(this.position.clone(), max_force * (diff / outer_radius));
		this.acceleration.add(d);
	}
};
