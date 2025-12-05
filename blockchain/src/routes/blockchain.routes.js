const express = require("express");
const router = express.Router();
const { getAccounts, getBalance, checkConnection } = require("../config/web3");
const { web3 } = require("../config/web3");
const blockchainMonitor = require("../services/blockchainMonitor");

/**
 * Helper function to convert BigInt to string for JSON serialization
 */
const serializeBigInt = (obj) => {
	return JSON.parse(
		JSON.stringify(obj, (_key, value) =>
			typeof value === "bigint" ? value.toString() : value,
		),
	);
};

/**
 * @route   GET /api/blockchain/status
 * @desc    Check blockchain connection status
 * @access  Public
 */
router.get("/status", async (_req, res) => {
	try {
		const isConnected = await checkConnection();
		const networkId = await web3.eth.net.getId();
		const blockNumber = await web3.eth.getBlockNumber();

		res.json({
			success: true,
			data: {
				connected: isConnected,
				networkId: networkId.toString(),
				blockNumber: blockNumber.toString(),
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error checking blockchain status",
			error: error.message,
		});
	}
});

/**
 * @route   GET /api/blockchain/accounts
 * @desc    Get all available accounts
 * @access  Public
 */
router.get("/accounts", async (_req, res) => {
	try {
		const accounts = await getAccounts();

		const accountsWithBalance = await Promise.all(
			accounts.map(async (account) => {
				const balance = await getBalance(account);
				return {
					address: account,
					balance: balance,
				};
			}),
		);

		res.json({
			success: true,
			data: {
				count: accounts.length,
				accounts: accountsWithBalance,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error retrieving accounts",
			error: error.message,
		});
	}
});

/**
 * @route   GET /api/blockchain/balance/:address
 * @desc    Get balance of a specific address
 * @access  Public
 */
router.get("/balance/:address", async (req, res) => {
	try {
		const { address } = req.params;

		if (!web3.utils.isAddress(address)) {
			return res.status(400).json({
				success: false,
				message: "Invalid Ethereum address",
			});
		}

		const balance = await getBalance(address);

		res.json({
			success: true,
			data: {
				address,
				balance,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error retrieving balance",
			error: error.message,
		});
	}
});

/**
 * @route   GET /api/blockchain/block/:blockNumber
 * @desc    Get block information
 * @access  Public
 */
router.get("/block/:blockNumber", async (req, res) => {
	try {
		const { blockNumber } = req.params;
		const block = await web3.eth.getBlock(blockNumber);

		if (!block) {
			return res.status(404).json({
				success: false,
				message: "Block not found",
			});
		}

		// Convert BigInt fields to strings
		const serializedBlock = serializeBigInt(block);

		res.json({
			success: true,
			data: serializedBlock,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error retrieving block",
			error: error.message,
		});
	}
});

/**
 * @route   GET /api/blockchain/transaction/:hash
 * @desc    Get transaction information
 * @access  Public
 */
router.get("/transaction/:hash", async (req, res) => {
	try {
		const { hash } = req.params;
		const transaction = await web3.eth.getTransaction(hash);

		if (!transaction) {
			return res.status(404).json({
				success: false,
				message: "Transaction not found",
			});
		}

		// Convert BigInt fields to strings
		const serializedTx = serializeBigInt(transaction);

		res.json({
			success: true,
			data: serializedTx,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error retrieving transaction",
			error: error.message,
		});
	}
});

/**
 * @route   GET /api/blockchain/stats
 * @desc    Get blockchain monitoring statistics
 * @access  Public
 */
router.get("/stats", async (_req, res) => {
	try {
		const stats = blockchainMonitor.getStats();

		res.json({
			success: true,
			data: stats,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error retrieving blockchain stats",
			error: error.message,
		});
	}
});

/**
 * @route   POST /api/blockchain/monitor/start
 * @desc    Start blockchain monitoring
 * @access  Public
 */
router.post("/monitor/start", async (_req, res) => {
	try {
		await blockchainMonitor.startMonitoring();

		res.json({
			success: true,
			message: "Blockchain monitoring started",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error starting blockchain monitor",
			error: error.message,
		});
	}
});

/**
 * @route   POST /api/blockchain/monitor/stop
 * @desc    Stop blockchain monitoring
 * @access  Public
 */
router.post("/monitor/stop", async (_req, res) => {
	try {
		blockchainMonitor.stopMonitoring();

		res.json({
			success: true,
			message: "Blockchain monitoring stopped",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error stopping blockchain monitor",
			error: error.message,
		});
	}
});

/**
 * @route   GET /api/blockchain/intro
 * @desc    Get introduction information about the blockchain service
 * @access  Public
 */
router.get("/intro", async (_req, res) => {
	try {
		res.json({
			success: true,
			data: {
				name: "VaxSafe Blockchain Service",
				version: "1.0.0",
				description: "Blockchain service for VaxSafe application, handling vaccination records and identity management.",
				features: [
					"Vaccination Record Storage",
					"Identity Management",
					"Transaction Monitoring",
					"IPFS Integration CICD",
				],
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error retrieving introduction",
			error: error.message,
		});
	}
});

module.exports = router;
