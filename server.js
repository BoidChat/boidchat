const express = require('express');
const socket = require('socket.io');

const os = require('os');

const hostname = os.networkInterfaces();
const port = 80;

const app = express();
const server = app.listen(port, hostname);
const io = socket(server);

app.use(express.static('public'));


var connections = 0;

io.sockets.on('connection', (socket) => {
	connections++;
	io.to(socket.id).emit('loadEveryone', connections);
	console.log('New connection ' + socket.id + " count: "+connections);
	socket.broadcast.emit('NewConnection');
	socket.on('mouse', (mouse) => {
		// Emit to everyone but the sender
		socket.broadcast.emit('mouse', mouse);
		// Emit to everyone
		//io.sockets.emit('mouse', mouse);
	});
});
