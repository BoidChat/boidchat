class Cluster extends Array {
	constructor(name) {
		super();
		this.name = name;
	}
}

function User(name, socket, cluster_id) {
	this.id = socket.id;
	this.name = name;
	this.cluster_id = cluster_id;
	this.position = [0, 0, 0];
	this.velocity = [0, 0, 0];
	this.neighbors = [];
	this.viewed = false;
}

//updating user info
function update_user(data) {
	if (data) {
		let user = main.get(data.id);
		if (user) {
			user.position = data.position;
			user.velocity = data.velocity;
			user.neighbors = data.neighbors;
		}
	}
}

//use when user disconnects
function remove_user(id) {
	main.delete(id);
}

//makes random name for new cluster
function get_rand_name() {
	let name = "cluster-" + Math.floor(Math.random() * 1e12).toString();
	while (true) {
		let found = false;
		for (let i = 0; i < clusters.length; i++) {
			if (clusters.name == name) {
				found = true;
				break;
			}
		}
		if (!found) {
			break;
		}
		name = "cluster-" + Math.floor(Math.random() * 1e12).toString();
	}
	return name;
}

//use when user connects first time
function add_new_user(socket, name) {
	let values = Array.from(main.values());
	for (let i = 0; i < values.length; i++) {
		if (values[i] == name) { return { error: 'Name taken!' }; }
	}
	let cluster = new Cluster(get_rand_name());
	socket.join(cluster.name); //user joins cluster/room
	let user = new User(name.trim().toLowerCase(), socket, cluster.name);
	main.set(socket.id, user);
	cluster.push(socket.id);
	return user;
}

function toArray(cluster_name = "") {
	if (cluster_name != "") {
		return Array.from(clusters.get(cluster_name).values());
	}
	else {
		return Array.from(main.values());
	}
}



//it is modified DFS algorithm to find all conected users (which can be put in same cluster)
//insiders - already connected users
function DFS_users(element, insiders) {
	element.viewed = true;
	for (let i = 0; i < element.neighbors.length; i++) {
		let n = main.get(element.neighbors[i]);
		if (n && !insiders.includes(n.id) && !n.viewed && n.neighbors.includes(element.id)) { //usually succeds once in method excecution
			insiders.push(n.id); //adding user to cluster
			DFS_users(n, insiders); //diving recursivly ddeper to newly added user
		}
	}
}

//updates individual users cluster_id by from cluster which they belong to, manages rooms
function update_users_clusters() {
	for (let i = 0; i < clusters.length; i++) {
		let cl_name = clusters[i].name;
		for (let j = 0; j < clusters[i].length; j++) {
			let user = main.get(clusters[i][j]);
			if (cl_name != user.cluster_id) {
				io.sockets.sockets[user.id].leave(user.cluster_id);
				io.sockets.sockets[user.id].join(cl_name);
				user.cluster_id = cl_name;
			}
		}
	}
}

//adjusts all clusters by users neighbours
function clusterize() {
	clusters = []; //emptying clusters array
	let users_ids = Array.from(main.keys());
	users_ids.sort(function(a, b) { return main.get(b).neighbors.length - main.get(a).neighbors.length; }); //decending by neighbor count
	for (let i = 0; i < users_ids.length; i++) {
		main.get(users_ids[i]).viewed = false; //reseting .viewed values to false
	}
	for (let i = 0; i < users_ids.length; i++) {
		let user = main.get(users_ids[i]);
		if (!user.viewed) {//triggers once per cluster
			let cluster = new Cluster("unset");
			cluster.push(user.id); //DFS_users have to know cluster starting point
			DFS_users(user, cluster); //constructing custer
			clusters.push(cluster); //refilling clusters array
		}
	}
	clusters.sort(function(a, b) { return b.length - a.length; }); //decending by cluster size
	add_names();
	update_users_clusters();
}

//sets cluster name/id by highiest share of members with the same cluster_id
function add_names() {
	let name_arr = new Array(clusters.length);
	for (let i = 0; i < clusters.length; i++) {
		let names = [];
		for (let j = 0; j < clusters[i].length; j++) {
			names.push(main.get(clusters[i][j]).cluster_id);
		}
		names.sort();
		let max_count = 1;
		let current_count = 1;
		let best_name = names[0];
		let current_name = names[0];
		for (let j = 1; j < names.length; j++) {
			if (current_name == names[j]) {
				current_count++;
			}
			else {
				if (current_count > max_count) {
					max_count = current_count;
					best_name = current_name;
				}
				current_name = names[j];
				current_count = 1;
			}
		}
		if (current_count > max_count) {
			max_count = current_count;
			best_name = current_name;
		}
		if (!name_arr.includes(best_name)) {
			clusters[i].name = best_name;
			name_arr[i] = best_name;
		}
		else {
			let name = get_rand_name();
			clusters[i].name = name;
			name_arr[i] = name;
		}
	}
}

let clusters = new Array();//sorted by user count, clusters array
let main = new Map();//map that stores loged on users {user_id : user}