module.exports = [
	{
		"name" : "Credit Card Processing",
		"dependency" : []
	},
	{
		"name" : "Billing Manager",
		"dependency" : []
	},
	{
		"name" : "Demandforce",
		"dependency" : ["GoPayment", "Address Verification"]
	},
	{
		"name" : "GoPayment",
		"dependency" : ["Credit Card Processing"]
	},
	{
		"name" : "Intuit Eclipse",
		"dependency" : ["Credit Check"]
	},
	{
		"name" : "Intuit Payroll",
		"dependency" : ["Credit Check", "Credit Card Processing", "Address Verification", "Billing Manager", "Intuit Eclipse"]
	},
	{
		"name" : "Intuit Websites",
		"dependency" : ["Credit Check", "Billing Manager"]
	},
	{
		"name" : "Mint.com",
		"dependency" : ["Credit Check"]
	},
	{
		"name" : "Quickbooks",
		"dependency" : ["TurboTax_1", "TurboTax_2", "TurboTax_3", "Quicken"]
	},
	{
		"name" : "Quicken",
		"dependency" : []
	},
	{
		"name" : "TurboTax_1",
		"dependency" : ["TurboTax_2", "TurboTax_3"]
	},
	{
		"name" : "TurboTax_2",
		"dependency" : ["TurboTax_3"]
	},
	{
		"name" : "TurboTax_3",
		"dependency" : []
	},
	{
		"name" : "IntuitMarket.com",
		"dependency" : ["Credit Card Processing", "Quicken"]
	},
	{
		"name" : "Address Verification",
		"dependency" : []
	},
	{
		"name" : "Credit Check",
		"dependency" : ["Credit Card Processing"]
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
