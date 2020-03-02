//not working, well never tested...
class Enviroment {
    constructor(free_movement_radius=100){
        this.max_velocity = 5;
        this.free_movement_radius = free_movement_radius; //radius where icentric force(not limited by max_force) starts
        this.full_radius = free_movement_radius + 2 * this.max_velocity; //coordinate center should be (0 0 0)
        this.population = [];
        this.max_force = 0.5;
        this.noise_const = 1/10
        this.boid_count = 0;
    }
    
    add_boid(boid){
        this.population.append(boid);
        this.boid_count++;
    }
}


class Boid{
    constructor(object, name, id){//TODO create a function to find eledgeble position 
        // this.position = new TREE.Vector3(x, y, z);
        this.position = rand_vect().multiplyScalar(10)
        this.velocity = new TREE.Vector3();
        this.acceleration = new TREE.Vector3();
        this.perception = 20
        this.object = object;
        this.object.position = this.position
		this.name = name;
        this.id = id;
        this.cluster = null;
    }

    live(population){
        // var noise = new Vector3(rand_vect()).multiplyScalar(noise_const);
        this.acceleration = rand_vect().multiplyScalar(noise_const);//add noise
        this.apply_alignment(population);
        this.apply_separation(population);
        this.apply_cohesion(population);
        this.apply_attraction_to_center();Scalar
        this.acceleration = normalize_vect(this.acceleration, Enviroment.max_force);
        this.apply_attraction_to_center(); //modifies acceleration, repels from borders
        this.velocity.add(this.acceleration);
        this.normalize_vect(this.velocity, Enviroment.max_velocity)
        this.position.add(this.velocity);
        this.acceleration = new THREE.Vector3();
    }

    apply_alignment(population){
        var all_vectors = new THREE.Vector3();
        var count = 0;
        for(boid in population){
            if (this.position.distanceTo(boid.position) <= this.perception){
                all_vectors.add(this.velocity.length());
                count++;    
            }
        }
        var steer_vel = all_vectors.divide(count);
        this.normalize_vect(steer_vel, Enviroment.max_velocity);
        this.acceleration.add(steer_vel.sub(this.velocity));
    }

    apply_separation(population){
        var all_vectors = new THREE.Vector3();
        var count = 0;
        for(boid in population){
            var distance = this.position.distanceTo(boid.position);
            if (distance < this.perception && distance != 0){
                all_vectors.add(this.position.sub(boid.position).divide(distance));
                count++;    
            }
        }
        if (count != 0){
            var steer_vel = all_vectors.divide(count);
            this.normalize_vect(steer_vel, Enviroment.max_velocity);
            this.acceleration.add(steer_vel.sub(this.velocity));
        }
    }

    apply_cohesion(population){
        var all_vectors = new THREE.Vector3();
        var count = 0;
        for(boid in population){
            var distance = this.position.distanceTo(boid.position);
            if (distance < this.perception){
                all_vectors.add(boid.position);
                count++;    
            }
        }
        var steer_vel = all_vectors.divide(count);
        this.normalize_vect(steer_vel, Enviroment.max_velocity);
        this.acceleration.add(steer_vel.sub(this.velocity));
    }

    apply_attraction_to_center(){
        var dist_to_center = this.position.length();
        if (dist_to_center > Enviroment.free_movement_radius){
            var diff = dist_to_center - Enviroment.free_movement_radius;
            this.acceleration.add(TREE.Vector3.copy(this.position).multiplyScalar(diff / (2 * Enviroment.max_velocity * dist_to_center)));
        }
    }
}

function normalize_vect(vect, max_length){
    if (vect.length() > Enviroment.max_velocity){
        vect = vect.multiplyScalar(vect.length() / Enviroment.max_velocity);
    }
    return vect;
}

//makes random array
function rand_vect(){
    norm_constant = Enviroment.max_velocity / Math.pow(1, 1/3);
    var vect = new THREE.Vector3();
    for (let i = 0; i < 3; i++){
        vect[i] = Math.random() * norm_constant;
    }
    return vect;
}

