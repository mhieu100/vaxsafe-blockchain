const { getWeb3 } = require("../config/web3");
const VaccineRecordArtifact = require("../../build/contracts/VaccineRecord.json");
const vaccineRecordLogger = require("../utils/vaccineRecordLogger");

/**
 * Recursively convert BigInt values to strings for JSON serialization
 */
function sanitizeBigInt(obj) {
	if (typeof obj === "bigint") {
		return String(obj);
	}
	if (Array.isArray(obj)) {
		return obj.map((item) => sanitizeBigInt(item));
	}
	if (typeof obj === "object" && obj !== null) {
		const sanitized = {};
		for (const key in obj) {
			sanitized[key] = sanitizeBigInt(obj[key]);
		}
		return sanitized;
	}
	return obj;
}

class VaccineRecordService {
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
			const deployedNetwork = VaccineRecordArtifact.networks[networkId];

			if (!deployedNetwork) {
				throw new Error(
					"VaccineRecord contract not deployed on current network",
				);
			}

			// Create contract instance
			this.contract = new this.web3.eth.Contract(
				VaccineRecordArtifact.abi,
				deployedNetwork.address,
			);

			console.log("✅ VaccineRecordService initialized");
			console.log("📝 Contract address:", deployedNetwork.address);

			return true;
		} catch (error) {
			console.error(
				"❌ Failed to initialize VaccineRecordService:",
				error.message,
			);
			throw error;
		}
	}

	/**
	 * Create a new vaccine record on blockchain
	 */
	async createRecord(recordData) {
		try {
			if (!this.contract) {
				throw new Error("Service not initialized");
			}

			const {
				identityHash,
				vaccineId,
				vaccineName,
				doseNumber,
				vaccinationDate,
				lotNumber,
				expiryDate,
				site,
				doctorId,
				doctorName,
				centerId,
				centerName,
				appointmentId,
				notes,
				ipfsHash,
			} = recordData;

			// Convert vaccination site string to enum number
			const siteMap = {
				LEFT_ARM: 0,
				RIGHT_ARM: 1,
				LEFT_THIGH: 2,
				RIGHT_THIGH: 3,
				ORAL: 4,
				NASAL: 5,
			};
			const siteNum = siteMap[site] !== undefined ? siteMap[site] : 0;

			// Convert dates to timestamps (handle empty strings)
			const vaccinationTimestamp = Math.floor(
				new Date(vaccinationDate).getTime() / 1000,
			);
			const expiryTimestamp =
				expiryDate && expiryDate !== ""
					? Math.floor(new Date(expiryDate).getTime() / 1000)
					: 0; // Use 0 for empty/null expiry date

			const result = await this.contract.methods
				.createRecord(
					identityHash,
					vaccineId,
					vaccineName,
					doseNumber,
					vaccinationTimestamp,
					lotNumber,
					expiryTimestamp,
					siteNum,
					doctorId,
					doctorName,
					centerId,
					centerName,
					appointmentId,
					notes || "",
					ipfsHash || "",
				)
				.send({
					from: this.accounts[0],
					gas: 3000000,
				});

			// Get record ID from events
			const recordId = result.events.RecordCreated.returnValues.recordId;

			// Calculate gas used
			const gasUsed = result.gasUsed;

			// Log successful vaccine record creation (sanitize BigInt values)
			vaccineRecordLogger.logVaccineRecordCreation({
				recordId: String(recordId),
				identityHash,
				vaccineId,
				vaccineName,
				doseNumber,
				vaccinationDate,
				lotNumber,
				expiryDate,
				site,
				doctorId,
				doctorName,
				centerId,
				centerName,
				appointmentId,
				ipfsHash: ipfsHash || null,
				transactionHash: result.transactionHash,
				blockNumber: String(result.blockNumber),
				gasUsed: String(gasUsed),
				success: true,
			});

			// Sanitize response to prevent BigInt serialization errors
			return sanitizeBigInt({
				success: true,
				recordId: recordId,
				transactionHash: result.transactionHash,
				blockNumber: result.blockNumber,
			});
		} catch (error) {
			console.error("Error creating vaccine record:", error.message);

			// Log failed vaccine record creation
			vaccineRecordLogger.logVaccineRecordCreation({
				recordId: null,
				identityHash: recordData.identityHash,
				vaccineId: recordData.vaccineId,
				vaccineName: recordData.vaccineName,
				doseNumber: recordData.doseNumber,
				vaccinationDate: recordData.vaccinationDate,
				lotNumber: recordData.lotNumber,
				expiryDate: recordData.expiryDate,
				site: recordData.site,
				doctorId: recordData.doctorId,
				doctorName: recordData.doctorName,
				centerId: recordData.centerId,
				centerName: recordData.centerName,
				appointmentId: recordData.appointmentId,
				ipfsHash: recordData.ipfsHash || null,
				transactionHash: null,
				blockNumber: null,
				gasUsed: null,
				success: false,
				error: error.message,
			});

			throw error;
		}
	}

	/**
	 * Get a specific vaccine record
	 */
	async getRecord(recordId) {
		try {
			if (!this.contract) {
				throw new Error("Service not initialized");
			}

			const record = await this.contract.methods.getRecord(recordId).call();

			const siteMap = [
				"LEFT_ARM",
				"RIGHT_ARM",
				"LEFT_THIGH",
				"RIGHT_THIGH",
				"ORAL",
				"NASAL",
			];

			// Sanitize BigInt values before returning
			return sanitizeBigInt({
				recordId: record.recordId,
				identityHash: record.identityHash,
				vaccineId: record.vaccineId,
				vaccineName: record.vaccineName,
				doseNumber: record.doseNumber,
				vaccinationDate: new Date(
					Number(record.vaccinationDate) * 1000,
				).toISOString(),
				lotNumber: record.lotNumber,
				expiryDate: new Date(Number(record.expiryDate) * 1000).toISOString(),
				site: siteMap[parseInt(record.site, 10)],
				doctorId: record.doctorId,
				doctorName: record.doctorName,
				centerId: record.centerId,
				centerName: record.centerName,
				appointmentId: record.appointmentId,
				notes: record.notes,
				ipfsHash: record.ipfsHash,
				createdAt: new Date(Number(record.createdAt) * 1000).toISOString(),
				isActive: record.isActive,
			});
		} catch (error) {
			console.error("Error getting vaccine record:", error.message);
			throw error;
		}
	}

	/**
	 * Get all records for a specific identity
	 */
	async getRecordsByIdentity(identityHash) {
		try {
			if (!this.contract) {
				throw new Error("Service not initialized");
			}

			const recordIds = await this.contract.methods
				.getRecordsByIdentity(identityHash)
				.call();

			// Fetch full details for each record
			const records = await Promise.all(
				recordIds.map((id) => this.getRecord(id)),
			);

			return records;
		} catch (error) {
			console.error("Error getting records by identity:", error.message);
			throw error;
		}
	}

	/**
	 * Update IPFS hash for a record
	 */
	async updateRecordIPFS(recordId, ipfsHash) {
		try {
			if (!this.contract) {
				throw new Error("Service not initialized");
			}

			const result = await this.contract.methods
				.updateRecordIPFS(recordId, ipfsHash)
				.send({
					from: this.accounts[0],
					gas: 100000,
				});

			return sanitizeBigInt({
				success: true,
				transactionHash: result.transactionHash,
				blockNumber: result.blockNumber,
			});
		} catch (error) {
			console.error("Error updating record IPFS:", error.message);
			throw error;
		}
	}

	/**
	 * Get total number of records
	 */
	async getTotalRecords() {
		try {
			if (!this.contract) {
				throw new Error("Service not initialized");
			}

			const total = await this.contract.methods.getTotalRecords().call();

			return Number(total); // Already converted to Number, safe from BigInt
		} catch (error) {
			console.error("Error getting total records:", error.message);
			throw error;
		}
	}
}

module.exports = new VaccineRecordService();
