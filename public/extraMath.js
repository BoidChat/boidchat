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

function distance(a, b){
    sum = 0;
    for (let i = 0; i < 3; i++){
        sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
}

function divide_scalar(vect, scalar){
    for (let i = 0; i < 3; i++){
        vect[i] /= scalar;
    }
    return vect;
}

function multiply_scalar(vect, scalar){
    for (let i = 0; i < 3; i++){
        vect[i] *= scalar;
    }
    return vect;
}

function add_to(a, b){
    for (let i = 0; i < 3; i++){
        a[i] += b[i];
    }
    return a;
}

function sub_from(a, b){
    for (let i = 0; i < 3; i++){
        a[i] -= b[i];
    }
    return a;
}

function to_vector3(arr){
    return new THREE.Vector3(arr[0], arr[1], arr[2]);
}