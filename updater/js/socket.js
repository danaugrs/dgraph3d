#!/usr/bin/env node
var http = require("http");
var WebSocketServer = require('websocket').server;
var PORT = 8000;

var data = [
	{
		"name" : "Credit Card Processing",
		"dependency" : [],
		"status" : "OK"
	},
	{
		"name" : "Billing Manager",
		"dependency" : [],
		"status" : "OK"
	},
	{
		"name" : "Demandforce",
		"dependency" : ["GoPayment", "Address Verification"],
		"status" : "OK"
	},
	{
		"name" : "GoPayment",
		"dependency" : ["Credit Card Processing"],
		"status" : "OK"
	},
	{
		"name" : "Intuit Eclipse",
		"dependency" : ["Credit Check"],
		"status" : "OK"
	},
	{
		"name" : "Intuit Payroll",
		"dependency" : ["Credit Check", "Credit Card Processing", "Address Verification", "Billing Manager", "Intuit Eclipse"],
		"status" : "OK"
	},
	{
		"name" : "Intuit Websites",
		"dependency" : ["Credit Check", "Billing Manager"],
		"status" : "OK"
	},
	{
		"name" : "Mint.com",
		"dependency" : ["Credit Check"],
		"status" : "OK"
	},
	{
		"name" : "Quickbooks",
		"dependency" : ["TurboTax_1", "TurboTax_2", "TurboTax_3", "Quicken"],
		"status" : "OK"
	},
	{
		"name" : "Quicken",
		"dependency" : [],
		"status" : "OK"
	},
	{
		"name" : "TurboTax_1",
		"dependency" : ["TurboTax_2", "TurboTax_3"],
		"status" : "OK"
	},
	{
		"name" : "TurboTax_2",
		"dependency" : ["TurboTax_3"],
		"status" : "OK"
	},
	{
		"name" : "TurboTax_3",
		"dependency" : [],
		"status" : "OK"
	},
	{
		"name" : "IntuitMarket.com",
		"dependency" : ["Credit Card Processing", "Quicken"],
		"status" : "OK"
	},
	{
		"name" : "Address Verification",
		"dependency" : [],
		"status" : "OK"
	},
	{
		"name" : "Credit Check",
		"dependency" : ["Credit Card Processing"],
		"status" : "OK"
	}
];

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
		if (message.type === 'utf8') {
			log("Received Message: " + message.utf8Data);

			changedata(message.utf8Data);

			conn.send(JSON.stringify(data));
		}
		else if (message.type === 'binary') {
			log("Received Message: " + message.binaryData)
		}
		// conn.sendUTF(message);
	})
	// log(JSON.stringify(data));
	conn.send(JSON.stringify(data));
})

function changedata(term) {
	var breakTerm = term.split(': ');
	console.log("node name: " + breakTerm[0]);
	console.log("node new status: " + breakTerm[1]);

	appearFlag = false;
	for (var i = 0; i < data.length; i++) {
		if (data[i].name == breakTerm[0]) {
			console.log("Node in Interrogation: " + data[i].name);
			console.log("Node before status: " + data[i].status);

			data[i].status = breakTerm[1];
			console.log("Node after status: " + data[i].status);

			appearFlag = true;
		}
	}
	if (!appearFlag) {
		console.log("No change in status for " + data[i].name)
	}

}
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