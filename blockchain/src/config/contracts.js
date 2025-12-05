const { web3 } = require("./web3");
const path = require("node:path");
const fs = require("node:fs");

/**
 * Load contract ABI and address
 */
const loadContract = (contractName) => {
	try {
		const contractPath = path.join(
			__dirname,
			"../../build/contracts",
			`${contractName}.json`,
		);

		if (!fs.existsSync(contractPath)) {
			throw new Error(
				`Contract ${contractName} not found. Please compile and deploy contracts first.`,
			);
		}

		const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
		const networkId = Object.keys(contractJson.networks)[0];

		if (!networkId || !contractJson.networks[networkId]) {
			throw new Error(
				`Contract ${contractName} not deployed. Please deploy contracts first.`,
			);
		}

		const contractAddress = contractJson.networks[networkId].address;
		const contractABI = contractJson.abi;

		return new web3.eth.Contract(contractABI, contractAddress);
	} catch (error) {
		console.error(`Error loading contract ${contractName}:`, error.message);
		throw error;
	}
};

/**
 * Get contract instance
 */
const getContract = (contractName) => {
	return loadContract(contractName);
};

/**
 * Initialize all contracts
 */
const initializeContracts = () => {
	try {
		const bookingContract = loadContract("BookingContract");

		console.log("✅ Contracts initialized successfully");
		console.log(`📝 BookingContract: ${bookingContract.options.address}`);

		return {
			bookingContract,
		};
	} catch (error) {
		console.error("❌ Contract initialization failed:", error.message);
		return null;
	}
};

module.exports = {
	loadContract,
	getContract,
	initializeContracts,
};
