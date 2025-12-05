const pinataSDK = require("@pinata/sdk");
require("dotenv").config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

let pinata;

if (pinataApiKey && pinataSecretApiKey) {
	pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);
	console.log("Pinata SDK initialized");
} else {
	console.warn(
		"Pinata keys not found in .env. IPFS service will fail if used.",
	);
}

/**
 * Upload JSON data to IPFS via Pinata
 * @param {Object} jsonData - The JSON object to upload
 * @returns {Promise<string>} - The IPFS Hash (CID)
 */
const uploadJson = async (jsonData) => {
	if (!pinata) {
		throw new Error(
			"Pinata configuration missing. Please check PINATA_API_KEY and PINATA_SECRET_API_KEY in .env",
		);
	}

	try {
		const options = {
			pinataMetadata: {
				name: jsonData.resourceType
					? `VaxSafe_${jsonData.resourceType}_${jsonData.id}`
					: `VaxSafe_Record_${Date.now()}`,
				keyvalues: {
					app: "VaxSafe",
					type: jsonData.resourceType || "Unknown",
				},
			},
			pinataOptions: {
				cidVersion: 0,
			},
		};

		const result = await pinata.pinJSONToIPFS(jsonData, options);
		console.log("Pinned to IPFS:", result);
		return result.IpfsHash;
	} catch (error) {
		console.error("Error uploading to Pinata:", error);
		throw error;
	}
};

module.exports = {
	uploadJson,
};
