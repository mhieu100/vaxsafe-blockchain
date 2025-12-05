const fs = require("node:fs");
const path = require("node:path");

class IdentityLogger {
	constructor() {
		this.logDir = path.join(__dirname, "../../logs");
		this.logFile = path.join(this.logDir, "identity-creation.log");
		this.jsonLogFile = path.join(this.logDir, "identity-creation.json");

		// Ensure logs directory exists
		this.ensureLogDirectory();
	}

	/**
	 * Ensure logs directory exists
	 */
	ensureLogDirectory() {
		if (!fs.existsSync(this.logDir)) {
			fs.mkdirSync(this.logDir, { recursive: true });
			console.log("📁 Created logs directory:", this.logDir);
		}
	}

	/**
	 * Format timestamp
	 */
	getTimestamp() {
		return new Date().toISOString();
	}

	/**
	 * Log identity creation with detailed information
	 */
	logIdentityCreation(data) {
		const logEntry = {
			timestamp: this.getTimestamp(),
			action: "IDENTITY_CREATED",
			identityHash: data.identityHash,
			did: data.did,
			guardianAddress: data.guardianAddress,
			idType: data.idType,
			ipfsDataHash: data.ipfsDataHash,
			transactionHash: data.transactionHash,
			blockNumber: data.blockNumber ? String(data.blockNumber) : null,
			gasUsed: data.gasUsed ? String(data.gasUsed) : null,
			email: data.email, // From backend
			success: data.success,
			error: data.error || null,
		};

		// Write to text log file (human readable)
		const textLog = this.formatTextLog(logEntry);
		fs.appendFileSync(this.logFile, `${textLog}\n`, "utf8");

		// Write to JSON log file (machine readable)
		this.appendJsonLog(logEntry);

		console.log("📝 Identity creation logged:", logEntry.identityHash);
	}

	/**
	 * Format log entry as text
	 */
	formatTextLog(entry) {
		const separator = "=".repeat(80);
		return `
${separator}
[${entry.timestamp}] ${entry.action}
${separator}
Identity Hash    : ${entry.identityHash}
DID              : ${entry.did}
Guardian Address : ${entry.guardianAddress}
Identity Type    : ${entry.idType}
IPFS Data Hash   : ${entry.ipfsDataHash}
Email            : ${entry.email || "N/A"}
Transaction Hash : ${entry.transactionHash || "N/A"}
Block Number     : ${entry.blockNumber || "N/A"}
Gas Used         : ${entry.gasUsed || "N/A"}
Success          : ${entry.success ? "✅ YES" : "❌ NO"}
${entry.error ? `Error            : ${entry.error}` : ""}
${separator}
`;
	}

	/**
	 * Append to JSON log file
	 */
	appendJsonLog(entry) {
		try {
			let logs = [];

			// Read existing logs if file exists
			if (fs.existsSync(this.jsonLogFile)) {
				const content = fs.readFileSync(this.jsonLogFile, "utf8");
				if (content.trim()) {
					logs = JSON.parse(content);
				}
			}

			// Append new entry
			logs.push(entry);

			// Write back to file
			fs.writeFileSync(this.jsonLogFile, JSON.stringify(logs, null, 2), "utf8");
		} catch (error) {
			console.error("❌ Error writing JSON log:", error.message);
		}
	}

	/**
	 * Get all identity creation logs
	 */
	getAllLogs() {
		try {
			if (!fs.existsSync(this.jsonLogFile)) {
				return [];
			}

			const content = fs.readFileSync(this.jsonLogFile, "utf8");
			if (!content.trim()) {
				return [];
			}

			return JSON.parse(content);
		} catch (error) {
			console.error("❌ Error reading logs:", error.message);
			return [];
		}
	}

	/**
	 * Get logs by date range
	 */
	getLogsByDateRange(startDate, endDate) {
		const allLogs = this.getAllLogs();
		return allLogs.filter((log) => {
			const logDate = new Date(log.timestamp);
			return logDate >= new Date(startDate) && logDate <= new Date(endDate);
		});
	}

	/**
	 * Get logs by identity hash
	 */
	getLogsByIdentityHash(identityHash) {
		const allLogs = this.getAllLogs();
		return allLogs.filter((log) => log.identityHash === identityHash);
	}

	/**
	 * Get logs by email
	 */
	getLogsByEmail(email) {
		const allLogs = this.getAllLogs();
		return allLogs.filter((log) => log.email === email);
	}

	/**
	 * Get statistics
	 */
	getStatistics() {
		const allLogs = this.getAllLogs();
		const successful = allLogs.filter((log) => log.success).length;
		const failed = allLogs.filter((log) => !log.success).length;

		const byType = {
			ADULT: allLogs.filter((log) => log.idType === "ADULT").length,
			CHILD: allLogs.filter((log) => log.idType === "CHILD").length,
			NEWBORN: allLogs.filter((log) => log.idType === "NEWBORN").length,
		};

		return {
			total: allLogs.length,
			successful,
			failed,
			successRate:
				allLogs.length > 0
					? `${((successful / allLogs.length) * 100).toFixed(2)}%`
					: "0%",
			byType,
			latestCreation:
				allLogs.length > 0 ? allLogs[allLogs.length - 1].timestamp : null,
		};
	}

	/**
	 * Clear old logs (older than specified days)
	 */
	clearOldLogs(daysToKeep = 30) {
		try {
			const allLogs = this.getAllLogs();
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

			const recentLogs = allLogs.filter((log) => {
				return new Date(log.timestamp) >= cutoffDate;
			});

			fs.writeFileSync(
				this.jsonLogFile,
				JSON.stringify(recentLogs, null, 2),
				"utf8",
			);

			const removed = allLogs.length - recentLogs.length;
			console.log(
				`🗑️ Cleared ${removed} old log entries (kept last ${daysToKeep} days)`,
			);

			return { removed, remaining: recentLogs.length };
		} catch (error) {
			console.error("❌ Error clearing old logs:", error.message);
			throw error;
		}
	}
}

module.exports = new IdentityLogger();
