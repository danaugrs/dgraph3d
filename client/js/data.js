module.exports = [
	{
		"name" : "Credit Card Processing",
		"deps" : [],
		"status": "OK"
	},
	{
		"name" : "Billing Manager",
		"deps" : [],
		"status": "OK"
	},
//	{
//		"name" : "Demandforce",
//		"deps" : ["GoPayment", "Address Verification"],
//		"status": "OK"
//	},
//	{
//		"name" : "GoPayment",
//		"deps" : ["Credit Card Processing"],
//		"status": "OK"
//	},
	{
		"name" : "Intuit Eclipse",
		"deps" : ["Credit Check"],
		"status": "OK"
	},
	{
		"name" : "Intuit Payroll",
		"deps" : ["Credit Check", "Credit Card Processing", "Address Verification", "Billing Manager", "Intuit Eclipse"],
		"status": "OK"
	},
//	{
//		"name" : "Intuit Websites",
//		"deps" : ["Credit Check", "Billing Manager"],
//		"status": "OK"
//	},
//	{
//		"name" : "Mint.com",
//		"deps" : ["Credit Check"],
//		"status": "OK"
//	},
//	{
//		"name" : "Quickbooks",
//		"deps" : ["TurboTax_1", "TurboTax_2", "TurboTax_3", "Quicken"],
//		"status": "OK"
//	},
//	{
//		"name" : "Quicken",
//		"deps" : [],
//		"status": "OK"
//	},
//	{
//		"name" : "TurboTax_1",
//		"deps" : ["TurboTax_2", "TurboTax_3"],
//		"status": "OK"
//	},
//	{
//		"name" : "TurboTax_2",
//		"deps" : ["TurboTax_3"],
//		"status": "OK"
//	},
//	{
//		"name" : "TurboTax_3",
//		"deps" : [],
//		"status": "OK"
//	},
//	{
//		"name" : "IntuitMarket.com",
//		"deps" : ["Credit Card Processing", "Quicken"],
//		"status": "OK"
//	},
	{
		"name" : "Address Verification",
		"deps" : [],
		"status": "OK"
	},
	{
		"name" : "Credit Check",
		"deps" : ["Credit Card Processing"],
		"status": "OK"
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
