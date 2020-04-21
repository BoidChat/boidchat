const express = require('express');
const http = require('http');
const socket = require('socket.io');
const os = require('os');
const hostname = os.networkInterfaces();
const port = 80;

const app = express();
const server = http.createServer(app);
const io = socket(server);
server.listen(port, hostname);

app.use(express.static('public'));

var connections = 0;

// io.sockets.on('connection', (socket) => {
// 	console.log('New connection ' + socket.id + " count: "+connections);
// 	socket.broadcast.emit('NewConnection');
// });

io.sockets.on('connection', (socket) => {
	socket.on('register', (/**user data */) => {
		connections++;
		// io.to(socket.id).emit('loadEveryone', connections);
		// socket.broadcast.emit('NewConnection');
		console.log('New connection ' + socket.id);
		let meaningfull_name = Math.floor(Math.random() * 1000).toString();
		let user = add_new_user(socket, meaningfull_name); //TODO give meaningfull name instead of number
		socket.emit('init', { base: user, count: connections });
	});

	socket.on('send_message', (data) => { //receives message and brodcasts it to all same cluster members
		room = main.get(socket.id).cluster_id;
		socket.to(room).emit('receive_message', data);
	});

	socket.on('update_info', (data) => { //updates user information on the server side
		update_user(data);
	});

	socket.on('disconnect', () => { //excecuted when user disconnects
		connections--;
		// socket.broadcast.emit('RemovedConnection'); //(not in use yet)brodcasts to all users that one user disconnected
		remove_user(socket.id);
		console.log('Removed connection ' + socket.id);
	});

});

setInterval(() => {
	io.emit('live', toArray());
}, 1000 / 60);

setInterval(() => {
	clusterize();
}, 1000);
