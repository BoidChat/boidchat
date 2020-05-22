let interp_users = new Map();
let last_time = Date.now();

function update_users(data, time_now, id) {
	let new_users = new Map();
	for (let i = 0; i < data.length; i++) {
		if (data[i].id != id) {
			let user = interp_users.get(data[i].id);
			let _pos = to_vector3(data[i].position);
			let vel = to_vector3(data[i].velocity);
			if (user == undefined) {
				new_users.set(data[i].id, { id: data[i].id, name:data[i].name, dest_pos: _pos, position: _pos, velocity: vel, sync_int: data[i].sync_int, time: time_now });
			}
			else if (data[i].sync_int == user.sync_int) {
				new_users.set(data[i].id, { id: data[i].id, name:data[i].name, dest_pos: user.dest_pos, position: user.position, velocity: user.velocity, sync_int: data[i].sync_int, time: user.time });
			}
			else {
				new_users.set(data[i].id, { id: data[i].id, name:data[i].name, dest_pos: _pos, position: user.position, velocity: vel, sync_int: data[i].sync_int, time: time_now });
			}
		}
	}
	interp_users = new_users;
}

function interpolate(data, id) {
	let now = Date.now();
	let elapsed = now - last_time;
	last_time = now;
	update_users(data, now, id);
	interp_users.forEach(function(value, key, map) {
		if (value.id != id) {
			value.time = now;
			let time_multiplier = elapsed / 17;
			let to_dest = (value.dest_pos.clone()).sub(value.position);
			let accel = streach_vect(to_dest, max_force * time_multiplier);
			let new_vel = value.velocity.clone().add(accel);
			let current_angle = value.velocity.angleTo(new_vel);
			let target_angle = elapsed * max_angular_velocity * 0.5;
			if (current_angle > target_angle) {
				let vel_length = new_vel.length();
				let rotation_axis = value.velocity.clone().cross(new_vel).normalize();
				value.velocity.applyAxisAngle(rotation_axis, target_angle);
				streach_vect(value.velocity, vel_length);
				normalize_vect(value.velocity, max_velocity);
			}
			else {
				value.velocity.add(accel);
			}
			value.position.add(value.velocity);
		}
	});
	return Array.from(interp_users.values());
}
