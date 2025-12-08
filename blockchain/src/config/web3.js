const { Web3 } = require("web3");
require("dotenv").config();

// Initialize Web3 instance
const web3 = new Web3(process.env.GANACHE_URL);

/**
 * Get Web3 instance
 */
const getWeb3 = () => {
	return web3;
};

/**
 * Check blockchain connection
 */
const checkConnection = async () => {
	try {
		const isListening = await web3.eth.net.isListening();
		if (isListening) {
			console.log("✅ Connected to blockchain network");
			const networkId = await web3.eth.net.getId();
			console.log(`📡 Network ID: ${networkId}`);
			return true;
		}
		return false;
	} catch (error) {
		console.error("❌ Blockchain connection failed:", error.message);
		return false;
	}
};

/**
 * Get accounts from blockchain
 */
const getAccounts = async () => {
	try {
		const accounts = await web3.eth.getAccounts();
		return accounts;
	} catch (error) {
		console.error("Error getting accounts:", error);
		throw error;
	}
};

/**
 * Get account balance
 */
const getBalance = async (address) => {
	try {
		const balance = await web3.eth.getBalance(address);
		return web3.utils.fromWei(balance, "ether");
	} catch (error) {
		console.error("Error getting balance:", error);
		throw error;
	}
};

module.exports = {
	web3,
	getWeb3,
	checkConnection,
	getAccounts,
	getBalance,
};
