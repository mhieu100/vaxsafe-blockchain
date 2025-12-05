const { web3 } = require("../config/web3");
const identityService = require("./identity.service");
const vaccineRecordService = require("./vaccine-record.service");

class BlockchainMonitor {
	constructor() {
		this.io = null;
		this.identityContract = null;
		this.vaccineRecordContract = null;
		this.blockSubscription = null;
		this.isMonitoring = false;
		this.stats = {
			totalBlocks: 0,
			totalTransactions: 0,
			totalIdentities: 0,
			totalVaccineRecords: 0,
			lastBlockNumber: 0,
			lastBlockTime: null,
			connectedClients: 0,
		};
	}

	/**
	 * Initialize the monitor with Socket.IO instance
	 */
	async initialize(io) {
		try {
			this.io = io;

			// Get contract instances from services
			this.identityContract = identityService.contract;
			this.vaccineRecordContract = vaccineRecordService.contract;

			// Get initial stats
			await this.updateStats();

			console.log("✅ Blockchain Monitor initialized");
			return true;
		} catch (error) {
			console.error("❌ Error initializing Blockchain Monitor:", error);
			throw error;
		}
	}

	/**
	 * Start monitoring blockchain
	 */
	async startMonitoring() {
		if (this.isMonitoring) {
			console.log("⚠️ Monitor already running");
			return;
		}

		try {
			this.isMonitoring = true;
			console.log("🚀 Starting Blockchain Monitor...");

			// Subscribe to new blocks
			this.subscribeToBlocks();

			// Subscribe to contract events
			this.subscribeToContractEvents();

			// Periodic stats update (every 10 seconds)
			this.statsInterval = setInterval(async () => {
				await this.updateStats();
				this.broadcastStats();
			}, 10000);

			console.log("✅ Blockchain Monitor started successfully");
		} catch (error) {
			console.error("❌ Error starting monitor:", error);
			this.isMonitoring = false;
			throw error;
		}
	}

	/**
	 * Stop monitoring blockchain
	 */
	stopMonitoring() {
		if (!this.isMonitoring) {
			console.log("⚠️ Monitor not running");
			return;
		}

		console.log("🛑 Stopping Blockchain Monitor...");

		// Unsubscribe from blocks
		if (this.blockSubscription) {
			this.blockSubscription.unsubscribe();
			this.blockSubscription = null;
		}

		// Clear intervals
		if (this.statsInterval) {
			clearInterval(this.statsInterval);
			this.statsInterval = null;
		}

		this.isMonitoring = false;
		console.log("✅ Blockchain Monitor stopped");
	}

	/**
	 * Subscribe to new blocks
	 */
	subscribeToBlocks() {
		console.log("👂 Subscribing to new blocks...");

		// Use polling instead of WebSocket subscription (more compatible with Ganache)
		this.blockPollingInterval = setInterval(async () => {
			try {
				const latestBlock = await web3.eth.getBlock("latest", true);

				if (latestBlock) {
					const currentBlockNumber = Number(latestBlock.number);

					// Only process if this is a new block
					if (currentBlockNumber > this.stats.lastBlockNumber) {
						this.stats.lastBlockNumber = currentBlockNumber;
						this.stats.lastBlockTime = new Date(
							Number(latestBlock.timestamp) * 1000,
						);
						this.stats.totalBlocks = currentBlockNumber;

						// Count transactions in block
						const txCount = latestBlock.transactions
							? latestBlock.transactions.length
							: 0;
						this.stats.totalTransactions += txCount;

						// Broadcast new block event
						this.broadcastNewBlock({
							number: currentBlockNumber,
							hash: latestBlock.hash,
							timestamp: this.stats.lastBlockTime,
							transactionCount: txCount,
							gasUsed: Number(latestBlock.gasUsed),
							gasLimit: Number(latestBlock.gasLimit),
						});

						// Check if any transaction is related to our contract
						if (txCount > 0 && latestBlock.transactions) {
							await this.processBlockTransactions(latestBlock);
						}
					}
				}
			} catch (error) {
				console.error("Error polling blocks:", error.message);
			}
		}, 2000); // Poll every 2 seconds
	}

	/**
	 * Process transactions in a block to detect contract interactions
	 */
	async processBlockTransactions(block) {
		try {
			const identityAddress =
				this.identityContract?.options.address.toLowerCase();
			const vaccineRecordAddress =
				this.vaccineRecordContract?.options.address.toLowerCase();

			for (const tx of block.transactions) {
				if (!tx.to) continue;

				const txTo = tx.to.toLowerCase();
				const receipt = await web3.eth.getTransactionReceipt(tx.hash);

				let contractType = null;
				let eventDetails = null;

				// Check which contract was called
				if (identityAddress && txTo === identityAddress) {
					contractType = "VaxSafeIdentity";
					eventDetails = await this.decodeIdentityEvents(receipt);
				} else if (vaccineRecordAddress && txTo === vaccineRecordAddress) {
					contractType = "VaccineRecord";
					eventDetails = await this.decodeVaccineRecordEvents(receipt);
				}

				if (contractType) {
					this.broadcastContractTransaction({
						hash: tx.hash,
						from: tx.from,
						to: tx.to,
						contractType: contractType,
						blockNumber: Number(tx.blockNumber),
						gasUsed: Number(receipt.gasUsed),
						status: receipt.status,
						timestamp: new Date(Number(block.timestamp) * 1000),
						events: eventDetails,
					});
				}
			}
		} catch (error) {
			console.error("Error processing block transactions:", error.message);
		}
	}

	/**
	 * Decode Identity contract events from receipt
	 */
	async decodeIdentityEvents(receipt) {
		const events = [];

		if (receipt.logs && this.identityContract) {
			const contractAddress =
				this.identityContract.options.address.toLowerCase();

			for (const log of receipt.logs) {
				// Only decode logs from our contract
				if (log.address.toLowerCase() !== contractAddress) continue;

				try {
					// Find matching event ABI
					const eventAbi = this.identityContract.options.jsonInterface.find(
						(item) => item.type === "event" && item.signature === log.topics[0],
					);

					if (!eventAbi) continue;

					// Decode event manually using web3
					const decoded = web3.eth.abi.decodeLog(
						eventAbi.inputs,
						log.data,
						log.topics.slice(1),
					);

					if (eventAbi.name === "IdentityCreated") {
						console.log(
							`👤 IdentityCreated event detected: ${decoded.identityHash}`,
						);
						events.push({
							event: "IdentityCreated",
							identityHash: decoded.identityHash,
							did: decoded.did,
							guardian: decoded.guardian,
							idType:
								["ADULT", "CHILD", "NEWBORN"][Number(decoded.idType)] ||
								"UNKNOWN",
							ipfsDataHash: decoded.ipfsDataHash,
						});
					} else if (eventAbi.name === "DocumentLinked") {
						console.log(
							`📎 DocumentLinked event detected: ${decoded.identityHash}`,
						);
						events.push({
							event: "DocumentLinked",
							identityHash: decoded.identityHash,
							documentType: decoded.documentType,
							ipfsHash: decoded.ipfsHash,
						});
					}
				} catch (e) {
					// Skip logs that can't be decoded
					console.error("Error decoding identity event:", e.message);
				}
			}
		}

		return events;
	}

	/**
	 * Decode VaccineRecord contract events from receipt
	 */
	async decodeVaccineRecordEvents(receipt) {
		const events = [];

		if (receipt.logs && this.vaccineRecordContract) {
			const contractAddress =
				this.vaccineRecordContract.options.address.toLowerCase();

			for (const log of receipt.logs) {
				// Only decode logs from our contract
				if (log.address.toLowerCase() !== contractAddress) continue;

				try {
					// Find matching event ABI
					const eventAbi =
						this.vaccineRecordContract.options.jsonInterface.find(
							(item) =>
								item.type === "event" && item.signature === log.topics[0],
						);

					if (!eventAbi) continue;

					// Decode event manually using web3
					const decoded = web3.eth.abi.decodeLog(
						eventAbi.inputs,
						log.data,
						log.topics.slice(1),
					);

					if (eventAbi.name === "RecordCreated") {
						const siteMap = [
							"LEFT_ARM",
							"RIGHT_ARM",
							"LEFT_THIGH",
							"RIGHT_THIGH",
							"ORAL",
							"NASAL",
						];
						console.log(`💉 RecordCreated event detected: ${decoded.recordId}`);
						events.push({
							event: "RecordCreated",
							recordId: decoded.recordId.toString(),
							identityHash: decoded.identityHash,
							vaccineName: decoded.vaccineName,
							doseNumber: decoded.doseNumber.toString(),
							site: siteMap[Number(decoded.site)] || "UNKNOWN",
							doctorName: decoded.doctorName,
							centerName: decoded.centerName,
						});
					} else if (eventAbi.name === "RecordIPFSUpdated") {
						console.log(
							`📝 RecordIPFSUpdated event detected: ${decoded.recordId}`,
						);
						events.push({
							event: "RecordIPFSUpdated",
							recordId: decoded.recordId.toString(),
							ipfsHash: decoded.ipfsHash,
						});
					}
				} catch (e) {
					// Skip logs that can't be decoded
					console.error("Error decoding vaccine record event:", e.message);
				}
			}
		}

		return events;
	}

	/**
	 * Subscribe to contract events
	 */
	subscribeToContractEvents() {
		console.log("👂 Subscribing to contract events...");

		// Subscribe to Identity contract events
		this.subscribeToIdentityEvents();

		// Subscribe to VaccineRecord contract events
		this.subscribeToVaccineRecordEvents();
	}

	/**
	 * Subscribe to Identity contract events
	 */
	subscribeToIdentityEvents() {
		if (!this.identityContract) {
			console.warn("⚠️  Identity contract not available");
			return;
		}

		if (!this.identityContract.events) {
			console.warn("⚠️  Identity contract events not available");
			return;
		}

		try {
			// IdentityCreated event
			this.identityContract.events
				.IdentityCreated({
					fromBlock: "latest",
				})
				.on("data", (event) => {
					console.log(
						"👤 IdentityCreated event detected:",
						event.returnValues.identityHash,
					);
					this.stats.totalIdentities++;

					const idTypeMap = ["ADULT", "CHILD", "NEWBORN"];
					this.broadcastContractEvent({
						type: "IdentityCreated",
						contract: "VaxSafeIdentity",
						blockNumber: Number(event.blockNumber),
						transactionHash: event.transactionHash,
						data: {
							identityHash: event.returnValues.identityHash,
							did: event.returnValues.did,
							guardian: event.returnValues.guardian,
							idType: idTypeMap[Number(event.returnValues.idType)] || "UNKNOWN",
							ipfsDataHash: event.returnValues.ipfsDataHash,
						},
					});
				})
				.on("error", (error) => {
					console.error("Error in IdentityCreated event:", error.message);
				});

			// DocumentLinked event
			this.identityContract.events
				.DocumentLinked({
					fromBlock: "latest",
				})
				.on("data", (event) => {
					console.log(
						"📎 DocumentLinked event detected:",
						event.returnValues.identityHash,
					);

					this.broadcastContractEvent({
						type: "DocumentLinked",
						contract: "VaxSafeIdentity",
						blockNumber: Number(event.blockNumber),
						transactionHash: event.transactionHash,
						data: {
							identityHash: event.returnValues.identityHash,
							documentType: event.returnValues.documentType,
							ipfsHash: event.returnValues.ipfsHash,
						},
					});
				})
				.on("error", (error) => {
					console.error("Error in DocumentLinked event:", error.message);
				});
		} catch (error) {
			console.error(
				"Error setting up identity event listeners:",
				error.message,
			);
		}
	}

	/**
	 * Subscribe to VaccineRecord contract events
	 */
	subscribeToVaccineRecordEvents() {
		if (!this.vaccineRecordContract) {
			console.warn("⚠️  VaccineRecord contract not available");
			return;
		}

		if (!this.vaccineRecordContract.events) {
			console.warn("⚠️  VaccineRecord contract events not available");
			return;
		}

		try {
			// RecordCreated event
			this.vaccineRecordContract.events
				.RecordCreated({
					fromBlock: "latest",
				})
				.on("data", (event) => {
					console.log(
						"💉 RecordCreated event detected:",
						event.returnValues.recordId,
					);
					this.stats.totalVaccineRecords++;

					const siteMap = [
						"LEFT_ARM",
						"RIGHT_ARM",
						"LEFT_THIGH",
						"RIGHT_THIGH",
						"ORAL",
						"NASAL",
					];
					this.broadcastContractEvent({
						type: "RecordCreated",
						contract: "VaccineRecord",
						blockNumber: Number(event.blockNumber),
						transactionHash: event.transactionHash,
						data: {
							recordId: event.returnValues.recordId.toString(),
							identityHash: event.returnValues.identityHash,
							vaccineName: event.returnValues.vaccineName,
							doseNumber: event.returnValues.doseNumber.toString(),
							site: siteMap[Number(event.returnValues.site)] || "UNKNOWN",
							doctorName: event.returnValues.doctorName,
							centerName: event.returnValues.centerName,
						},
					});
				})
				.on("error", (error) => {
					console.error("Error in RecordCreated event:", error.message);
				});

			// RecordIPFSUpdated event
			this.vaccineRecordContract.events
				.RecordIPFSUpdated({
					fromBlock: "latest",
				})
				.on("data", (event) => {
					console.log(
						"🔄 RecordIPFSUpdated event detected:",
						event.returnValues.recordId,
					);

					this.broadcastContractEvent({
						type: "RecordIPFSUpdated",
						contract: "VaccineRecord",
						blockNumber: Number(event.blockNumber),
						transactionHash: event.transactionHash,
						data: {
							recordId: event.returnValues.recordId.toString(),
							ipfsHash: event.returnValues.ipfsHash,
						},
					});
				})
				.on("error", (error) => {
					console.error("Error in RecordIPFSUpdated event:", error.message);
				});
		} catch (error) {
			console.error(
				"Error setting up vaccine record event listeners:",
				error.message,
			);
		}
	}

	/**
	 * Update blockchain statistics
	 */
	async updateStats() {
		try {
			// Get latest block
			const latestBlock = await web3.eth.getBlock("latest");
			if (latestBlock) {
				const currentBlockNumber = Number(latestBlock.number);

				// Detect blockchain reset (block number decreased)
				if (
					currentBlockNumber < this.stats.lastBlockNumber &&
					this.stats.lastBlockNumber > 0
				) {
					console.log("🔄 Blockchain reset detected! Clearing stats...");
					this.stats.totalTransactions = 0;
					this.stats.totalIdentities = 0;
					this.stats.totalVaccineRecords = 0;
				}

				this.stats.lastBlockNumber = currentBlockNumber;
				this.stats.lastBlockTime = new Date(
					Number(latestBlock.timestamp) * 1000,
				);
				this.stats.totalBlocks = currentBlockNumber;
			}

			// Get total vaccine records from contract
			if (this.vaccineRecordContract) {
				try {
					const recordCount = await this.vaccineRecordContract.methods
						.getTotalRecords()
						.call();
					this.stats.totalVaccineRecords = Number(recordCount);
				} catch (e) {
					// Method might not exist
				}
			}

			// Count connected clients
			if (this.io) {
				this.stats.connectedClients = this.io.engine.clientsCount || 0;
			}
		} catch (error) {
			console.error("Error updating stats:", error.message);
		}
	}

	/**
	 * Broadcast new block to all clients
	 */
	broadcastNewBlock(blockData) {
		if (this.io) {
			this.io.emit("newBlock", blockData);
			console.log(
				`📦 New Block #${blockData.number} broadcasted to ${this.stats.connectedClients} clients`,
			);
		}
	}

	/**
	 * Convert BigInt to string recursively
	 */
	sanitizeBigInt(obj) {
		if (typeof obj === "bigint") {
			return obj.toString();
		}
		if (Array.isArray(obj)) {
			return obj.map((item) => this.sanitizeBigInt(item));
		}
		if (obj !== null && typeof obj === "object") {
			const sanitized = {};
			for (const key in obj) {
				sanitized[key] = this.sanitizeBigInt(obj[key]);
			}
			return sanitized;
		}
		return obj;
	}

	/**
	 * Broadcast contract transaction to all clients
	 */
	broadcastContractTransaction(txData) {
		if (this.io) {
			const sanitized = this.sanitizeBigInt(txData);
			this.io.emit("contractTransaction", sanitized);
			console.log(`💳 Contract Transaction ${txData.hash} broadcasted`);
		}
	}

	/**
	 * Broadcast contract event to all clients
	 */
	broadcastContractEvent(eventData) {
		if (this.io) {
			this.io.emit("contractEvent", eventData);
			console.log(`🎯 Contract Event ${eventData.type} broadcasted`);
		}
	}

	/**
	 * Broadcast current stats to all clients
	 */
	broadcastStats() {
		if (this.io) {
			this.io.emit("blockchainStats", this.stats);
		}
	}

	/**
	 * Get current statistics
	 */
	getStats() {
		return { ...this.stats };
	}
}

module.exports = new BlockchainMonitor();
