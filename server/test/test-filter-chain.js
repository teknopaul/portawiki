
var FilterChain = require("../util/filter-chain").FilterChain;


// FIlterChain itself exports a filter

var chainModules = [
				"../util/filter-chain",
				"../util/filter-chain",
				"../util/filter-chain"
                    ];

var chain = new FilterChain(chainModules);


chain.execute(new Object(), new Object());
