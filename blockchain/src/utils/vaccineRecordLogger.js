const fs = require("node:fs");
const path = require("node:path");

class VaccineRecordLogger {
	constructor() {
		this.logDir = path.join(__dirname, "../../logs");
		this.logFile = path.join(this.logDir, "vaccine-record-creation.log");
		this.jsonLogFile = path.join(this.logDir, "vaccine-record-creation.json");

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
	 * Log vaccine record creation with detailed information
	 */
	logVaccineRecordCreation(data) {
		const logEntry = {
			timestamp: this.getTimestamp(),
			action: "VACCINE_RECORD_CREATED",
			recordId: data.recordId,
			identityHash: data.identityHash,
			vaccineId: data.vaccineId,
			vaccineName: data.vaccineName,
			doseNumber: data.doseNumber,
			vaccinationDate: data.vaccinationDate,
			lotNumber: data.lotNumber,
			expiryDate: data.expiryDate,
			site: data.site,
			doctorId: data.doctorId,
			doctorName: data.doctorName,
			centerId: data.centerId,
			centerName: data.centerName,
			appointmentId: data.appointmentId,
			ipfsHash: data.ipfsHash,
			transactionHash: data.transactionHash,
			blockNumber: data.blockNumber ? String(data.blockNumber) : null,
			gasUsed: data.gasUsed ? String(data.gasUsed) : null,
			success: data.success,
			error: data.error || null,
		};

		// Write to text log file (human readable)
		const textLog = this.formatTextLog(logEntry);
		fs.appendFileSync(this.logFile, `${textLog}\n`, "utf8");

		// Write to JSON log file (machine readable)
		this.appendJsonLog(logEntry);

		console.log("💉 Vaccine record creation logged:", logEntry.recordId);
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
Record ID        : ${entry.recordId}
Identity Hash    : ${entry.identityHash}
Vaccine          : ${entry.vaccineName} (ID: ${entry.vaccineId})
Dose Number      : ${entry.doseNumber}
Vaccination Date : ${entry.vaccinationDate}
Lot Number       : ${entry.lotNumber || "N/A"}
Expiry Date      : ${entry.expiryDate || "N/A"}
Site             : ${entry.site}
Doctor           : ${entry.doctorName} (ID: ${entry.doctorId})
Center           : ${entry.centerName} (ID: ${entry.centerId})
Appointment ID   : ${entry.appointmentId}
IPFS Hash        : ${entry.ipfsHash || "N/A"}
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
			console.error("❌ Error writing vaccine record JSON log:", error.message);
		}
	}

	/**
	 * Get all vaccine record logs
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
			console.error("❌ Error reading vaccine record logs:", error.message);
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
	 * Get logs by vaccine ID
	 */
	getLogsByVaccineId(vaccineId) {
		const allLogs = this.getAllLogs();
		return allLogs.filter((log) => log.vaccineId === vaccineId);
	}

	/**
	 * Get logs by center ID
	 */
	getLogsByCenterId(centerId) {
		const allLogs = this.getAllLogs();
		return allLogs.filter((log) => log.centerId === centerId);
	}

	/**
	 * Get statistics
	 */
	getStatistics() {
		const allLogs = this.getAllLogs();
		const successful = allLogs.filter((log) => log.success).length;
		const failed = allLogs.filter((log) => !log.success).length;

		// Count by vaccine
		const vaccineCount = {};
		allLogs.forEach((log) => {
			const vaccineName = log.vaccineName;
			vaccineCount[vaccineName] = (vaccineCount[vaccineName] || 0) + 1;
		});

		// Count by center
		const centerCount = {};
		allLogs.forEach((log) => {
			const centerName = log.centerName;
			centerCount[centerName] = (centerCount[centerName] || 0) + 1;
		});

		return {
			total: allLogs.length,
			successful,
			failed,
			successRate:
				allLogs.length > 0
					? `${((successful / allLogs.length) * 100).toFixed(2)}%`
					: "0%",
			byVaccine: vaccineCount,
			byCenter: centerCount,
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
				`🗑️ Cleared ${removed} old vaccine record log entries (kept last ${daysToKeep} days)`,
			);

			return { removed, remaining: recentLogs.length };
		} catch (error) {
			console.error(
				"❌ Error clearing old vaccine record logs:",
				error.message,
			);
			throw error;
		}
	}
}

module.exports = new VaccineRecordLogger();
