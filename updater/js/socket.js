#!/usr/bin/env node
var http = require("http");
var WebSocketServer = require('websocket').server;
var PORT = 8000;

var data = [
	{
		"name" : "Credit Card Processing",
		"dependency" : [],
		"status" : "Healthy"
	},
	{
		"name" : "Billing Manager",
		"dependency" : [],
		"status" : "Healthy"
	},
	{
		"name" : "Demandforce",
		"dependency" : ["GoPayment", "Address Verification"],
		"status" : "Healthy"
	},
	{
		"name" : "GoPayment",
		"dependency" : ["Credit Card Processing"],
		"status" : "Healthy"
	},
	{
		"name" : "Intuit Eclipse",
		"dependency" : ["Credit Check"],
		"status" : "Healthy"
	},
	{
		"name" : "Intuit Payroll",
		"dependency" : ["Credit Check", "Credit Card Processing", "Address Verification", "Billing Manager", "Intuit Eclipse"],
		"status" : "Healthy"
	},
	{
		"name" : "Intuit Websites",
		"dependency" : ["Credit Check", "Billing Manager"],
		"status" : "Healthy"
	},
	{
		"name" : "Mint.com",
		"dependency" : ["Credit Check"],
		"status" : "Healthy"
	},
	{
		"name" : "Quickbooks",
		"dependency" : ["TurboTax_1", "TurboTax_2", "TurboTax_3", "Quicken"],
		"status" : "Healthy"
	},
	{
		"name" : "Quicken",
		"dependency" : [],
		"status" : "Healthy"
	},
	{
		"name" : "TurboTax_1",
		"dependency" : ["TurboTax_2", "TurboTax_3"],
		"status" : "Healthy"
	},
	{
		"name" : "TurboTax_2",
		"dependency" : ["TurboTax_3"],
		"status" : "Healthy"
	},
	{
		"name" : "TurboTax_3",
		"dependency" : [],
		"status" : "Healthy"
	},
	{
		"name" : "IntuitMarket.com",
		"dependency" : ["Credit Card Processing", "Quicken"],
		"status" : "Healthy"
	},
	{
		"name" : "Address Verification",
		"dependency" : [],
		"status" : "Healthy"
	},
	{
		"name" : "Credit Check",
		"dependency" : ["Credit Card Processing"],
		"status" : "Healthy"
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

var allConn = [];

wsServer.on('request', function(request) {
	var conn = request.accept('echo-protocol', request.origin);
	log("Connection accepted: " + request.origin);
	allConn.push(conn);
	allConn.push(request.origin);

	conn.on('message', function(message) {
		if (message.type === 'utf8') {
			log("Received Message: " + message.utf8Data);
			// changedata(message.utf8Data);

			for (var i = 0; i < allConn.length; i+=2) {
				log("Sending data to: " + allConn[i+1]);
				// allConn[i].send(JSON.stringify(data));
				allConn[i].send(message.utf8Data);
			}	
		}
	})
	conn.send(JSON.stringify(data));
})