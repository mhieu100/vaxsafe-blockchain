const { getWeb3 } = require("../config/web3");
const VaxSafeIdentityArtifact = require("../../build/contracts/VaxSafeIdentity.json");
const identityLogger = require("../utils/identityLogger");

class IdentityService {
	constructor() {
		this.web3 = null;
		this.contract = null;
		this.accounts = [];
	}

	/**
	 * Initialize the service with web3 and contract instance
	 */
	async initialize() {
		try {
			this.web3 = getWeb3();
			this.accounts = await this.web3.eth.getAccounts();

			// Get network ID
			const networkId = await this.web3.eth.net.getId();
			const deployedNetwork = VaxSafeIdentityArtifact.networks[networkId];

			if (!deployedNetwork) {
				throw new Error(
					"VaxSafeIdentity contract not deployed on current network",
				);
			}

			// Create contract instance
			this.contract = new this.web3.eth.Contract(
				VaxSafeIdentityArtifact.abi,
				deployedNetwork.address,
			);

			console.log("✅ IdentityService initialized");
			console.log("📝 Contract address:", deployedNetwork.address);

			return true;
		} catch (error) {
			console.error("❌ Failed to initialize IdentityService:", error.message);
			throw error;
		}
	}

	/**
	 * Create a new identity on blockchain
	 * Always uses accounts[0] from Ganache as the guardian and transaction sender
	 * @param {string} email - Optional. User email for logging
	 */
	async createIdentity(identityHash, did, idType, ipfsDataHash, email = null) {
		const startTime = Date.now();

		// Always use accounts[0] from Ganache
		const guardian = this.accounts[0];

		const logData = {
			identityHash,
			did,
			guardianAddress: guardian,
			idType,
			ipfsDataHash,
			email,
			success: false,
		};

		try {
			if (!this.contract) {
				throw new Error("Service not initialized");
			}

			// Convert identity type string to enum number
			const idTypeMap = { ADULT: 0, CHILD: 1, NEWBORN: 2 };
			const idTypeNum = idTypeMap[idType] !== undefined ? idTypeMap[idType] : 0;

			console.log(`🔐 Creating identity for ${email || "unknown"}`);
			console.log(`   Hash: ${identityHash}`);
			console.log(`   DID: ${did}`);
			console.log(`   Guardian (accounts[0]): ${guardian}`);
			console.log(`   Type: ${idType} (${idTypeNum})`);
			console.log(`   IPFS: ${ipfsDataHash}`);

			// Check if identity already exists
			try {
				const exists = await this.contract.methods
					.identityExists(identityHash)
					.call();
				if (exists) {
					const error = new Error("Identity already exists on blockchain");
					console.error(`❌ ${error.message}`);
					logData.error = error.message;
					identityLogger.logIdentityCreation(logData);
					throw error;
				}
			} catch (checkError) {
				console.log(`   Existence check: ${checkError.message}`);
			}

			const result = await this.contract.methods
				.createIdentity(identityHash, did, guardian, idTypeNum, ipfsDataHash)
				.send({
					from: guardian,
					gas: 500000,
				});

			// Update log data with success info
			logData.success = true;
			logData.transactionHash = result.transactionHash;
			logData.blockNumber = result.blockNumber;
			logData.gasUsed = result.gasUsed;

			// Log to file
			identityLogger.logIdentityCreation(logData);

			console.log(
				`✅ Identity created successfully in ${Date.now() - startTime}ms`,
			);
			console.log(`   TxHash: ${result.transactionHash}`);

			return {
				success: true,
				transactionHash: result.transactionHash,
				blockNumber: result.blockNumber,
				events: result.events,
			};
		} catch (error) {
			console.error("❌ Error creating identity:", error.message);

			// Log failure
			logData.error = error.message;
			identityLogger.logIdentityCreation(logData);

			throw error;
		}
	}

	/**
	 * Link a document to an identity
	 */
	async linkDocument(identityHash, documentType, ipfsHash) {
		try {
			if (!this.contract) {
				throw new Error("Service not initialized");
			}

			// Always use accounts[0] from Ganache
			const from = this.accounts[0];

			const result = await this.contract.methods
				.linkDocument(identityHash, documentType, ipfsHash)
				.send({
					from: from,
					gas: 200000,
				});

			return {
				success: true,
				transactionHash: result.transactionHash,
				blockNumber: result.blockNumber,
			};
		} catch (error) {
			console.error("Error linking document:", error.message);
			throw error;
		}
	}

	/**
	 * Verify a document
	 */
	async verifyDocument(identityHash, documentIndex) {
		try {
			if (!this.contract) {
				throw new Error("Service not initialized");
			}

			const result = await this.contract.methods
				.verifyDocument(identityHash, documentIndex)
				.send({
					from: this.accounts[0],
					gas: 100000,
				});

			return {
				success: true,
				transactionHash: result.transactionHash,
				blockNumber: result.blockNumber,
			};
		} catch (error) {
			console.error("Error verifying document:", error.message);
			throw error;
		}
	}

	/**
	 * Get identity details from blockchain
	 */
	async getIdentity(identityHash) {
		try {
			if (!this.contract) {
				throw new Error("Service not initialized");
			}

			const result = await this.contract.methods
				.getIdentity(identityHash)
				.call();

			const idTypeMap = ["ADULT", "CHILD", "NEWBORN"];

			return {
				identityHash: result.identityHash,
				did: result.did,
				guardian: result.guardian,
				idType: idTypeMap[parseInt(result.idType, 10)],
				createdAt: new Date(Number(result.createdAt) * 1000).toISOString(),
				isActive: result.isActive,
				ipfsDataHash: result.ipfsDataHash,
			};
		} catch (error) {
			console.error("Error getting identity:", error.message);
			throw error;
		}
	}

	/**
	 * Get all documents linked to an identity
	 */
	async getDocuments(identityHash) {
		try {
			if (!this.contract) {
				throw new Error("Service not initialized");
			}

			const documents = await this.contract.methods
				.getDocuments(identityHash)
				.call();

			return documents.map((doc) => ({
				documentType: doc.documentType,
				ipfsHash: doc.ipfsHash,
				linkedAt: new Date(Number(doc.linkedAt) * 1000).toISOString(),
				isVerified: doc.isVerified,
			}));
		} catch (error) {
			console.error("Error getting documents:", error.message);
			throw error;
		}
	}
}

module.exports = new IdentityService();
