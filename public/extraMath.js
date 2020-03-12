//makes random array
function rand_vect(multiplier){
    let vect = new THREE.Vector3();
    for (let i = 0; i < 3; i++){
        let a = (Math.random() - 0.5) * 2 * multiplier;
        vect.setComponent(i, a);
    }
    return vect;
}


function normalize_vect(vect, max_length){
    if (vect.length() > max_length){
        vect = vect.multiplyScalar(max_length / vect.length());
    }
    return vect;
}


//axis nust be normalized
function axis_angle_to_quaternion(axis, angle) {
    let s = Math.sin(angle/2);
    x = axis.x * s;
    y = axis.y * s;
    z = axis.z * s;
    w = Math.cos(angle/2);
    return new THREE.Quaternion(x, y, z, w);
  }

  
function two_vectors_to_quaternion(from, to){
    var axis = from.clone().cross(to).normalize();
    var angle = Math.acos(from.clone().dot(to)/(from.length() * to.length()));
	return axis_angle_to_quaternion(axis, angle);
}