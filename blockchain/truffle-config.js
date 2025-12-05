module.exports = {
	networks: {
		development: {
			host: process.env.GANACHE_HOST || "127.0.0.1",
			port: process.env.GANACHE_PORT || 8545,
			network_id: process.env.NETWORK_ID || "*", // Any network (default: none)
			gas: process.env.GAS_LIMIT || 6721975, // Gas limit
			gasPrice: process.env.GAS_PRICE || 20000000000, // Gas price
		},
		// You can add more networks here (testnet, mainnet, etc.)
	},

	// Configure your compilers
	compilers: {
		solc: {
			version: "0.8.19", // Fetch exact version from solc-bin
			settings: {
				optimizer: {
					enabled: true,
					runs: 200,
				},
				viaIR: true, // Enable intermediate representation to handle "stack too deep" errors
			},
		},
	},

	// Set default mocha options here, use special reporters, etc.
	mocha: {
		timeout: 100000,
	},

	// Configure contract directories
	contracts_directory: "./contracts",
	contracts_build_directory: "./build/contracts",
	migrations_directory: "./migrations",
};
