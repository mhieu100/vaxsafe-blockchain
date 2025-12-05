const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const { checkConnection, getWeb3 } = require("./config/web3");
const identityService = require("./services/identity.service");
const vaccineRecordService = require("./services/vaccine-record.service");
const blockchainMonitor = require("./services/blockchainMonitor");

// Import routes
const identityRoutes = require("./routes/identity.routes");
const vaccineRecordRoutes = require("./routes/vaccine-record.routes");
const transactionRoutes = require("./routes/transaction.routes");
const ipfsRoutes = require("./routes/ipfsRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Request logging middleware
app.use((req, _res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});

// Health check route
app.get("/", (_req, res) => {
	res.json({
		success: true,
		message: "Blockchain Service API",
		version: "1.0.0",
	});
});

// Ganache status endpoint
app.get("/api/ganache/status", async (_req, res) => {
	try {
		const isConnected = await checkConnection();

		if (!isConnected) {
			return res.status(503).json({
				success: false,
				message: "Cannot connect to Ganache",
				ganacheUrl: process.env.GANACHE_URL,
			});
		}

		const web3 = getWeb3();
		const blockNumber = await web3.eth.getBlockNumber();
		const networkId = await web3.eth.net.getId();

		res.json({
			success: true,
			message: "Connected to Ganache",
			ganacheUrl: process.env.GANACHE_URL,
			blockNumber: Number(blockNumber),
			networkId: Number(networkId),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error checking Ganache status",
			error: error.message,
		});
	}
});

// Get all accounts (wallets)
app.get("/api/ganache/accounts", async (_req, res) => {
	try {
		const isConnected = await checkConnection();

		if (!isConnected) {
			return res.status(503).json({
				success: false,
				message: "Cannot connect to Ganache",
			});
		}

		const web3 = getWeb3();
		const accounts = await web3.eth.getAccounts();

		// Get balance for each account
		const accountsWithBalance = await Promise.all(
			accounts.map(async (address) => {
				const balance = await web3.eth.getBalance(address);
				return {
					address,
					balance: `${web3.utils.fromWei(balance, "ether")} ETH`,
				};
			}),
		);

		res.json({
			success: true,
			accountCount: accounts.length,
			accounts: accountsWithBalance,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error getting accounts",
			error: error.message,
		});
	}
});

// Get specific account balance
app.get("/api/ganache/accounts/:address", async (req, res) => {
	try {
		const isConnected = await checkConnection();

		if (!isConnected) {
			return res.status(503).json({
				success: false,
				message: "Cannot connect to Ganache",
			});
		}

		const web3 = getWeb3();
		const { address } = req.params;

		if (!web3.utils.isAddress(address)) {
			return res.status(400).json({
				success: false,
				message: "Invalid Ethereum address",
			});
		}

		const balance = await web3.eth.getBalance(address);
		const transactionCount = await web3.eth.getTransactionCount(address);

		res.json({
			success: true,
			address,
			balance: `${web3.utils.fromWei(balance, "ether")} ETH`,
			balanceWei: balance.toString(),
			transactionCount,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error getting account info",
			error: error.message,
		});
	}
});

// API Routes
app.use("/api/identity", identityRoutes);
app.use("/api/vaccine-records", vaccineRecordRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ipfs", ipfsRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
	console.log(`🔌 Client connected: ${socket.id}`);

	// Send initial stats on connection
	socket.on("getStats", () => {
		try {
			const stats = blockchainMonitor.getStats();
			socket.emit("blockchainStats", stats);
		} catch (error) {
			console.error("Error getting stats:", error);
		}
	});

	socket.on("disconnect", () => {
		console.log(`🔌 Client disconnected: ${socket.id}`);
	});
});

// Poll for new blocks
let lastBlockNumber = 0;
setInterval(async () => {
	try {
		const web3 = getWeb3();
		const currentBlock = Number(await web3.eth.getBlockNumber());

		if (currentBlock > lastBlockNumber && lastBlockNumber > 0) {
			const block = await web3.eth.getBlock(currentBlock);

			io.emit("newBlock", {
				number: Number(block.number),
				hash: block.hash,
				timestamp: Number(block.timestamp) * 1000,
				transactionCount: block.transactions.length,
				gasUsed: Number(block.gasUsed),
			});

			console.log(`📦 New block: #${currentBlock}`);
		}

		lastBlockNumber = currentBlock;
	} catch (error) {
		// Silently fail if Ganache is not connected
	}
}, 2000); // Check every 2 seconds

// Error handling middleware
app.use((err, _req, res, _next) => {
	console.error("Error:", err);
	res.status(500).json({
		success: false,
		message: "Internal server error",
		error: process.env.NODE_ENV === "development" ? err.message : undefined,
	});
});

// 404 handler
app.use((_req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

// Initialize and start server
const startServer = async () => {
	try {
		console.log("🚀 Starting Blockchain Service...");

		// Check blockchain connection
		const isConnected = await checkConnection();
		if (!isConnected) {
			console.warn(
				`⚠️  Warning: Cannot connect to Ganache at ${process.env.GANACHE_URL}`,
			);
			console.warn(
				"⚠️  Please ensure Ganache is running with: ganache --host 0.0.0.0 --port 8545",
			);
			console.warn("⚠️  Contract-related APIs will not work without Ganache");
		} else {
			console.log("✅ Connected to Ganache");

			// Initialize smart contract services
			try {
				await identityService.initialize();
				await vaccineRecordService.initialize();
				console.log("✅ Smart contracts initialized");

				// Initialize and start blockchain monitor
				try {
					await blockchainMonitor.initialize(io);
					await blockchainMonitor.startMonitoring();
					console.log("✅ Blockchain Monitor started");
				} catch (monitorError) {
					console.warn(
						"⚠️  Warning: Failed to start blockchain monitor:",
						monitorError.message,
					);
				}
			} catch (error) {
				console.warn(
					"⚠️  Warning: Failed to initialize contracts:",
					error.message,
				);
				console.warn(
					"⚠️  Please deploy contracts with: npx truffle migrate --network development",
				);
			}
		}

		// Start Express server
		server.listen(PORT, () => {
			const isProduction = process.env.NODE_ENV === "production";
			const baseUrl = isProduction
				? "https://blockchain.mhieu100.space"
				: `http://localhost:${PORT}`;

			console.log("");
			console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
			console.log(`✅ Server is running on port ${PORT}`);
			console.log(`📡 API URL: ${baseUrl}`);
			console.log(`🔗 Ganache URL: ${process.env.GANACHE_URL}`);
			console.log(`🖥️  Environment: ${process.env.NODE_ENV || "development"}`);
			console.log(`🔌 Socket.IO: Enabled`);
			console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
			console.log("");
			console.log("📊 Monitor Dashboard:");
			console.log(`  ${baseUrl}/monitor.html`);
			console.log("");
			console.log("Ganache endpoints:");
			console.log(`  GET  ${baseUrl}/api/ganache/status`);
			console.log(`  GET  ${baseUrl}/api/ganache/accounts`);
			console.log("");
			console.log("Identity endpoints:");
			console.log(`  POST ${baseUrl}/api/identity/create`);
			console.log(`  POST ${baseUrl}/api/identity/link-document`);
			console.log(`  GET  ${baseUrl}/api/identity/:identityHash`);
			console.log("");
			console.log("Vaccine Record endpoints:");
			console.log(`  POST ${baseUrl}/api/vaccine-records/create`);
			console.log(`  GET  ${baseUrl}/api/vaccine-records/:recordId`);
			console.log(
				`  GET  ${baseUrl}/api/vaccine-records/identity/:identityHash`,
			);
			console.log("");
		});
	} catch (error) {
		console.error("❌ Failed to start server:", error);
		process.exit(1);
	}
};

// Handle graceful shutdown
process.on("SIGINT", () => {
	console.log("\n👋 Shutting down gracefully...");
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.log("\n👋 Shutting down gracefully...");
	process.exit(0);
});

// Start the server
startServer();

module.exports = app;
