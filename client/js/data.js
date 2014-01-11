//module.exports = [
//	{
//		"name" : "Credit Card Processing",
//		"deps" : []
//	},
//	{
//		"name" : "Billing Manager",
//		"deps" : []
//	},
//	{
//		"name" : "Demandforce",
//		"deps" : ["GoPayment", "Address Verification"]
//	},
//	{
//		"name" : "GoPayment",
//		"deps" : ["Credit Card Processing"]
//	},
//	{
//		"name" : "Intuit Eclipse",
//		"deps" : ["Credit Check"]
//	},
//	{
//		"name" : "Intuit Payroll",
//		"deps" : ["Credit Check", "Credit Card Processing", "Address Verification", "Billing Manager", "Intuit Eclipse"]
//	},
//	{
//		"name" : "Intuit Websites",
//		"deps" : ["Credit Check", "Billing Manager"]
//	},
//	{
//		"name" : "Mint.com",
//		"deps" : ["Credit Check"]
//	},
//	{
//		"name" : "Quickbooks",
//		"deps" : ["TurboTax_1", "TurboTax_2", "TurboTax_3", "Quicken"]
//	},
//	{
//		"name" : "Quicken",
//		"deps" : []
//	},
//	{
//		"name" : "TurboTax_1",
//		"deps" : ["TurboTax_2", "TurboTax_3"]
//	},
//	{
//		"name" : "TurboTax_2",
//		"deps" : ["TurboTax_3"]
//	},
//	{
//		"name" : "TurboTax_3",
//		"deps" : []
//	},
//	{
//		"name" : "IntuitMarket.com",
//		"deps" : ["Credit Card Processing", "Quicken"]
//	},
//	{
//		"name" : "Address Verification",
//		"deps" : []
//	},
//	{
//		"name" : "Credit Check",
//		"deps" : ["Credit Card Processing"]
//	}
//];

module.exports = [
    
    {
    name: "node4",
    deps: ["node5", "node2"]
    },

    {
    name: "node2",
    deps: []
    },

    {
    name: "node3",
    deps: ["node2", "node4", "node5"]
    },

    {
    name: "node5",
    deps: []
    },
    
    {
    name: "node1",
    deps: ["node2", "node3"]
    }

];
