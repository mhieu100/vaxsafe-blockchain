const ipfsService = require("../services/ipfsService");

const upload = async (req, res) => {
	try {
		const data = req.body;

		if (!data || Object.keys(data).length === 0) {
			return res.status(400).json({
				success: false,
				message: "No JSON data provided in request body",
			});
		}

		console.log("Received request to upload to IPFS");
		const ipfsHash = await ipfsService.uploadJson(data);

		return res.status(200).json({
			success: true,
			data: {
				ipfsHash: ipfsHash,
				gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
			},
		});
	} catch (error) {
		console.error("IPFS Upload Controller Error:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to upload to IPFS",
			error: error.message,
		});
	}
};

module.exports = {
	upload,
};
