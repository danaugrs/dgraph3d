[
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
		"dependency" : ["Credit Check", "Credit Card Processing", "Address Verification", "Billing Manager", "Intuit Eclipse"]
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
		"name" : "Address Verification",,
		"status" : "OK"
		"dependency" : []
	},
	{
		"name" : "Credit Check",
		"dependency" : ["Credit Card Processing"],
		"status" : "OK"
	}
];