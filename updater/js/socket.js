#!/usr/bin/env node
var http = require("http");
var WebSocketServer = require('websocket').server;
var PORT = 8000;

function log(msg) {
    var parts,
        now;
    parts = [];
    now = new Date;
    parts.push(now.toUTCString());
    parts.push(msg);
    console.log(parts.join(': '));
}

var server = http.createServer(function(req, res) {
	log("Received req for: " + req.url);
	res.writeHead(404, {"Content-Type": "text/plain"});
	res.write("Helllloooo");
	res.end();
})

server.listen(PORT, function() {
	log("Server is now listening on port " + PORT);
});

wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});

wsServer.on('request', function(request) {
	var conn = request.accept('echo-protocol', request.origin);
	log("Connection accepted.");
	conn.on('message', function(message) {
		log("Received Message: " + message);
		// conn.sendUTF(message);
	})
	conn.sendUTF("testing sent stuff");
})

// function main() {
// 	log("Starting webserver...");
// 	http.createServer(function(request, response) {
// 	  response.writeHead(200, {"Content-Type": "text/plain"});
// 	  response.write("Hello World");
// 	  response.end();
// 	}).listen(PORT, function() {
// 		log("Listening on port: " + PORT);
// 	});

// 	var socket = new websocket.server({
// 		htpServer: web,
// 		autoAcceptConnections: true
// 	});

// 	socket.on('request', function(request) {
// 		log('New websocket request!');
		
// 		wsCONN = request.accept('echo-protocol', request.origin);
// 		console.log((new Date()) + ' Connection accepted.');
// 	});
// }

// main();