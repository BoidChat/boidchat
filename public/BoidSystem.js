class Enviroment {
    constructor(free_movement_radius=200){
        this.max_velocity = 0.5;
        this.free_movement_radius = free_movement_radius; //radius where icentric force(not limited by max_force) starts
        this.outer_radius = free_movement_radius * 0.2; //coordinate center should be (0 0 0)
        this.population = [];
        this.max_force = 0.03;
        this.noise_const = 1/10;
    }
    
    add_boid(boid){
        this.population.push(boid);
    }
}


function Boid(geom, name, id) {
    this.position = rand_vect(200); //need to changes
    this.velocity = rand_vect(0.2);
    this.acceleration = new THREE.Vector3();
    this.perception = 20;
    this.geom = geom;
    this.geom.position.set(this.position.x, this.position.y, this.position.z);
    this.name = name;
    this.id = id;
    this.cluster = null;
}

Boid.prototype.live = function(env) {
    // this.acceleration = rand_vect(env.noise_const * env.max_force * Math.pow(3, (-1/3)));//add noise; 
    this.apply_alignment(env);
    this.apply_separation(env);
    this.apply_cohesion(env);
    this.acceleration = normalize_vect(this.acceleration, env.max_force);
    this.apply_attraction_to_center(env); //modifies acceleration, repels from border
    // this.acceleration = normalize_vect(this.acceleration, env.max_force);
    this.velocity.add(this.acceleration);
    this.velocity = normalize_vect(this.velocity, env.max_velocity)
    this.position.add(this.velocity);
    this.geom.position.set(this.position.x, this.position.y, this.position.z);
    this.acceleration.set(0, 0, 0);
}

Boid.prototype.apply_alignment = function(env){
    var all_vectors = new THREE.Vector3();
    var count = 0;
    for(var i = 0; i < env.population.length; i++){
        if (this.position.distanceTo(env.population[i].position) <= this.perception && env.population[i].id != this.id){
            all_vectors.add(env.population[i].velocity);
            count++;  
        }
    }
    if (count != 0){
        var steer_vel = all_vectors.divideScalar(count);
        normalize_vect(steer_vel, env.max_velocity);
        this.acceleration.add(steer_vel.sub(this.velocity));
    }
}

Boid.prototype.apply_separation = function(env){
    var all_vectors = new THREE.Vector3();
    var count = 0;
    for(var i = 0; i < env.population.length; i++){
        var distance = this.position.distanceTo(env.population[i].position);
        if (distance < this.perception && boid_env.population[i].id != this.id){
            all_vectors.add(env.population[i].position);
            count++;    
        } 
    }
    if (count != 0){
        var from_center = this.position.clone().sub(all_vectors.divideScalar(count));
        var proportion = 1 - (from_center.length() / this.perception);
        this.acceleration.add(normalize_vect(from_center, env.max_force * proportion ** 2));
    }
}

Boid.prototype.apply_cohesion = function(env){
    var all_vectors = new THREE.Vector3();
    var count = 0;
    for(var i = 0; i < env.population.length; i++){
        var distance = this.position.distanceTo(env.population[i].position);
        if (distance < this.perception && boid_env.population[i].id != this.id){
            all_vectors.add(env.population[i].position);
            count++;    
        }
    }
    if (count > 0){
        var to_center = all_vectors.divideScalar(count).sub(this.position);
        this.acceleration.add(normalize_vect(to_center, env.max_force * 0.25));
    }
}

Boid.prototype.apply_attraction_to_center = function(env){
    var dist_to_center = this.position.length();
    if (dist_to_center > env.free_movement_radius){
        var diff = env.free_movement_radius - dist_to_center;
        var d = normalize_vect(this.position.clone(), env.max_force * (diff / env.outer_radius))
        this.acceleration.add(d);
    }
}
