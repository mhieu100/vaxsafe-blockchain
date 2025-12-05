const identityService = require("../services/identity.service");
const identityLogger = require("../utils/identityLogger");

/**
 * Helper function to convert BigInt to String recursively
 */
function sanitizeBigInt(obj) {
	if (obj === null || obj === undefined) return obj;

	if (typeof obj === "bigint") {
		return String(obj);
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => sanitizeBigInt(item));
	}

	if (typeof obj === "object") {
		const sanitized = {};
		for (const key in obj) {
			sanitized[key] = sanitizeBigInt(obj[key]);
		}
		return sanitized;
	}

	return obj;
}

/**
 * Create a new identity
 * Guardian address is always accounts[0] from Ganache, not accepted from request
 */
async function createIdentity(req, res) {
	try {
		const { identityHash, did, idType, ipfsDataHash, email } = req.body;

		if (!identityHash || !did || !idType) {
			return res.status(400).json({
				success: false,
				message: "Missing required fields: identityHash, did, idType",
			});
		}

		const result = await identityService.createIdentity(
			identityHash,
			did,
			idType,
			ipfsDataHash || "",
			email, // Pass email for logging
		);

		// Convert all BigInt to string for JSON serialization
		const sanitizedResult = sanitizeBigInt(result);

		res.json({
			success: true,
			message: "Identity created successfully",
			data: sanitizedResult,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to create identity",
			error: error.message,
		});
	}
}

/**
 * Link a document to an identity
 * Always uses accounts[0] from Ganache for transaction
 */
async function linkDocument(req, res) {
	try {
		const { identityHash, documentType, ipfsHash } = req.body;

		if (!identityHash || !documentType || !ipfsHash) {
			return res.status(400).json({
				success: false,
				message:
					"Missing required fields: identityHash, documentType, ipfsHash",
			});
		}

		const result = await identityService.linkDocument(
			identityHash,
			documentType,
			ipfsHash,
		);

		// Convert all BigInt to string for JSON serialization
		const sanitizedResult = sanitizeBigInt(result);

		res.json({
			success: true,
			message: "Document linked successfully",
			data: sanitizedResult,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to link document",
			error: error.message,
		});
	}
}

/**
 * Verify a document
 */
async function verifyDocument(req, res) {
	try {
		const { identityHash, documentIndex } = req.body;

		if (!identityHash || documentIndex === undefined) {
			return res.status(400).json({
				success: false,
				message: "Missing required fields: identityHash, documentIndex",
			});
		}

		const result = await identityService.verifyDocument(
			identityHash,
			documentIndex,
		);

		// Convert all BigInt to string for JSON serialization
		const sanitizedResult = sanitizeBigInt(result);

		res.json({
			success: true,
			message: "Document verified successfully",
			data: sanitizedResult,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to verify document",
			error: error.message,
		});
	}
}

/**
 * Get identity details
 */
async function getIdentity(req, res) {
	try {
		const { identityHash } = req.params;

		if (!identityHash) {
			return res.status(400).json({
				success: false,
				message: "Identity hash is required",
			});
		}

		const identity = await identityService.getIdentity(identityHash);

		res.json({
			success: true,
			data: identity,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to get identity",
			error: error.message,
		});
	}
}

/**
 * Get documents linked to an identity
 */
async function getDocuments(req, res) {
	try {
		const { identityHash } = req.params;

		if (!identityHash) {
			return res.status(400).json({
				success: false,
				message: "Identity hash is required",
			});
		}

		const documents = await identityService.getDocuments(identityHash);

		res.json({
			success: true,
			count: documents.length,
			data: documents,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to get documents",
			error: error.message,
		});
	}
}

/**
 * Get all identity creation logs
 */
async function getIdentityLogs(_req, res) {
	try {
		const logs = identityLogger.getAllLogs();
		res.json({
			success: true,
			count: logs.length,
			data: logs,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to get logs",
			error: error.message,
		});
	}
}

/**
 * Get logs by identity hash
 */
async function getLogsByIdentityHash(req, res) {
	try {
		const { identityHash } = req.params;
		const logs = identityLogger.getLogsByIdentityHash(identityHash);

		res.json({
			success: true,
			count: logs.length,
			data: logs,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to get logs",
			error: error.message,
		});
	}
}

/**
 * Get logs by email
 */
async function getLogsByEmail(req, res) {
	try {
		const { email } = req.params;
		const logs = identityLogger.getLogsByEmail(email);

		res.json({
			success: true,
			count: logs.length,
			data: logs,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to get logs",
			error: error.message,
		});
	}
}

/**
 * Get identity creation statistics
 */
async function getIdentityStatistics(_req, res) {
	try {
		const stats = identityLogger.getStatistics();

		res.json({
			success: true,
			data: stats,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to get statistics",
			error: error.message,
		});
	}
}

/**
 * Clear old logs
 */
async function clearOldLogs(req, res) {
	try {
		const { daysToKeep = 30 } = req.body;
		const result = identityLogger.clearOldLogs(daysToKeep);

		res.json({
			success: true,
			message: `Cleared ${result.removed} old log entries`,
			data: result,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to clear old logs",
			error: error.message,
		});
	}
}

module.exports = {
	createIdentity,
	linkDocument,
	verifyDocument,
	getIdentity,
	getDocuments,
	getIdentityLogs,
	getLogsByIdentityHash,
	getLogsByEmail,
	getIdentityStatistics,
	clearOldLogs,
};
