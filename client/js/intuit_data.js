module.exports = [
	{
		"name" : "Credit Card Processing",
		"deps" : [],
		"status": "Healthy"
	},
	{
		"name" : "Billing Manager",
		"deps" : [],
		"status": "Healthy"
	},
	{
		"name" : "Demandforce",
		"deps" : ["GoPayment", "Address Verification"],
		"status": "Healthy"
	},
	{
		"name" : "GoPayment",
		"deps" : ["Credit Card Processing"],
		"status": "Healthy"
	},
	{
		"name" : "Intuit Eclipse",
		"deps" : ["Credit Check"],
		"status": "Healthy"
	},
	{
		"name" : "Intuit Payroll",
		"deps" : ["Credit Check", "Credit Card Processing", "Address Verification", "Billing Manager", "Intuit Eclipse"],
		"status": "Healthy"
	},
	{
		"name" : "Intuit Websites",
		"deps" : ["Credit Check", "Billing Manager"],
		"status": "Healthy"
	},
	{
		"name" : "Mint.com",
		"deps" : ["Credit Check"],
		"status": "Healthy"
	},
	{
		"name" : "Quickbooks",
		"deps" : ["TurboTax_1", "TurboTax_2", "TurboTax_3", "Quicken"],
		"status": "Healthy"
	},
	{
		"name" : "Quicken",
		"deps" : [],
		"status": "Healthy"
	},
	{
		"name" : "TurboTax_1",
		"deps" : ["TurboTax_2", "TurboTax_3"],
		"status": "Healthy"
	},
	{
		"name" : "TurboTax_2",
		"deps" : ["TurboTax_3"],
		"status": "Healthy"
	},
	{
		"name" : "TurboTax_3",
		"deps" : [],
		"status": "Healthy"
	},
	{
		"name" : "IntuitMarket.com",
		"deps" : ["Credit Card Processing", "Quicken"],
		"status": "Healthy"
	},
	{
		"name" : "Address Verification",
		"deps" : [],
		"status": "Healthy"
	},
	{
		"name" : "Credit Check",
		"deps" : ["Credit Card Processing"],
		"status": "Healthy"
	}
];

//module.exports = [
//    
//    {
//    name: "node4",
//    deps: ["node5", "node2"]
//    },
//
//    {
//    name: "node2",
//    deps: []
//    },
//
//    {
//    name: "node3",
//    deps: ["node2", "node4", "node5"]
//    },
//
//    {
//    name: "node5",
//    deps: []
//    },
//    
//    {
//    name: "node1",
//    deps: ["node2", "node3"]
//    }
//
//];
