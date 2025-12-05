const vaccineRecordService = require("../services/vaccine-record.service");

/**
 * Create a new vaccine record
 */
async function createRecord(req, res) {
	try {
		const recordData = req.body;
		
		// Log incoming request data for debugging
		console.log("\n📥 ========== INCOMING REQUEST ==========");
		console.log("Timestamp:", new Date().toISOString());
		console.log("Request Body:", JSON.stringify(recordData, null, 2));
		console.log("=========================================\n");

		// Validate required fields (lotNumber and expiryDate are optional, can be empty string)
		const requiredFields = [
			"identityHash",
			"vaccineId",
			"vaccineName",
			"doseNumber",
			"vaccinationDate",
			"site",
			"doctorId",
			"doctorName",
			"centerId",
			"centerName",
			"appointmentId",
		];

		const missingFields = requiredFields.filter((field) => !recordData[field]);
		if (missingFields.length > 0) {
			console.log("❌ Missing required fields:", missingFields);
			return res.status(400).json({
				success: false,
				message: `Missing required fields: ${missingFields.join(", ")}`,
			});
		}

		// Set default values for optional fields
		recordData.lotNumber = recordData.lotNumber || "";
		recordData.expiryDate = recordData.expiryDate || "";
		
		console.log("✅ Validation passed, creating vaccine record...");

		const result = await vaccineRecordService.createRecord(recordData);
		
		console.log("✅ Vaccine record created successfully:", result.recordId);

		res.json({
			success: true,
			message: "Vaccine record created successfully",
			data: result,
		});
	} catch (error) {
		console.log("❌ Error creating vaccine record:", error.message);
		res.status(500).json({
			success: false,
			message: "Failed to create vaccine record",
			error: error.message,
		});
	}
}

/**
 * Get a specific vaccine record
 */
async function getRecord(req, res) {
	try {
		const { recordId } = req.params;

		if (!recordId) {
			return res.status(400).json({
				success: false,
				message: "Record ID is required",
			});
		}

		const record = await vaccineRecordService.getRecord(recordId);

		res.json({
			success: true,
			data: record,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to get vaccine record",
			error: error.message,
		});
	}
}

/**
 * Get all records for a specific identity
 */
async function getRecordsByIdentity(req, res) {
	try {
		const { identityHash } = req.params;

		if (!identityHash) {
			return res.status(400).json({
				success: false,
				message: "Identity hash is required",
			});
		}

		const records =
			await vaccineRecordService.getRecordsByIdentity(identityHash);

		res.json({
			success: true,
			count: records.length,
			data: records,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to get vaccine records",
			error: error.message,
		});
	}
}

/**
 * Update IPFS hash for a record
 */
async function updateRecordIPFS(req, res) {
	try {
		const { recordId } = req.params;
		const { ipfsHash } = req.body;

		if (!recordId || !ipfsHash) {
			return res.status(400).json({
				success: false,
				message: "Record ID and IPFS hash are required",
			});
		}

		const result = await vaccineRecordService.updateRecordIPFS(
			recordId,
			ipfsHash,
		);

		res.json({
			success: true,
			message: "Record IPFS hash updated successfully",
			data: result,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to update record IPFS",
			error: error.message,
		});
	}
}

/**
 * Get total number of records
 */
async function getTotalRecords(_req, res) {
	try {
		const total = await vaccineRecordService.getTotalRecords();

		res.json({
			success: true,
			totalRecords: total,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to get total records",
			error: error.message,
		});
	}
}

module.exports = {
	createRecord,
	getRecord,
	getRecordsByIdentity,
	updateRecordIPFS,
	getTotalRecords,
};
