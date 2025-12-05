const { getWeb3 } = require("../config/web3");

class TransactionController {
	/**
	 * Get transaction details by hash
	 */
	async getTransaction(req, res) {
		try {
			const { txHash } = req.params;

			if (!txHash) {
				return res.status(400).json({
					success: false,
					message: "Transaction hash is required",
				});
			}

			const web3 = getWeb3();

			// Get transaction
			const tx = await web3.eth.getTransaction(txHash);

			if (!tx) {
				return res.status(404).json({
					success: false,
					message: "Transaction not found",
				});
			}

			// Convert BigInt to string for JSON serialization
			const txData = {
				hash: tx.hash,
				blockHash: tx.blockHash,
				blockNumber: tx.blockNumber ? Number(tx.blockNumber) : null,
				from: tx.from,
				to: tx.to,
				value: tx.value ? tx.value.toString() : "0",
				gas: tx.gas ? Number(tx.gas) : 0,
				gasPrice: tx.gasPrice ? tx.gasPrice.toString() : "0",
				input: tx.input,
				nonce: tx.nonce ? Number(tx.nonce) : 0,
				transactionIndex: tx.transactionIndex
					? Number(tx.transactionIndex)
					: null,
				v: tx.v ? tx.v.toString() : null,
				r: tx.r,
				s: tx.s,
			};

			res.json({
				success: true,
				data: txData,
			});
		} catch (error) {
			console.error("Error getting transaction:", error);
			res.status(500).json({
				success: false,
				message: "Error retrieving transaction",
				error: error.message,
			});
		}
	}

	/**
	 * Get transaction receipt (execution result)
	 */
	async getTransactionReceipt(req, res) {
		try {
			const { txHash } = req.params;

			if (!txHash) {
				return res.status(400).json({
					success: false,
					message: "Transaction hash is required",
				});
			}

			const web3 = getWeb3();

			// Get transaction receipt
			const receipt = await web3.eth.getTransactionReceipt(txHash);

			if (!receipt) {
				return res.status(404).json({
					success: false,
					message:
						"Transaction receipt not found (transaction may not be mined yet)",
				});
			}

			// Convert BigInt to appropriate types
			const receiptData = {
				transactionHash: receipt.transactionHash,
				blockHash: receipt.blockHash,
				blockNumber: receipt.blockNumber ? Number(receipt.blockNumber) : null,
				from: receipt.from,
				to: receipt.to,
				contractAddress: receipt.contractAddress,
				cumulativeGasUsed: receipt.cumulativeGasUsed
					? Number(receipt.cumulativeGasUsed)
					: 0,
				gasUsed: receipt.gasUsed ? Number(receipt.gasUsed) : 0,
				effectiveGasPrice: receipt.effectiveGasPrice
					? receipt.effectiveGasPrice.toString()
					: "0",
				logs: receipt.logs || [],
				logsBloom: receipt.logsBloom,
				status: receipt.status ? Number(receipt.status) : 0,
				transactionIndex: receipt.transactionIndex
					? Number(receipt.transactionIndex)
					: null,
				type: receipt.type,
			};

			// Add human-readable status
			receiptData.statusText = receiptData.status === 1 ? "Success" : "Failed";

			res.json({
				success: true,
				data: receiptData,
			});
		} catch (error) {
			console.error("Error getting transaction receipt:", error);
			res.status(500).json({
				success: false,
				message: "Error retrieving transaction receipt",
				error: error.message,
			});
		}
	}

	/**
	 * Get block details by block number or hash
	 */
	async getBlock(req, res) {
		try {
			const { blockId } = req.params;

			if (!blockId) {
				return res.status(400).json({
					success: false,
					message: "Block number or hash is required",
				});
			}

			const web3 = getWeb3();

			// Convert to number if it's a number string
			const blockIdentifier = /^\d+$/.test(blockId)
				? parseInt(blockId, 10)
				: blockId;

			// Get block with transactions
			const block = await web3.eth.getBlock(blockIdentifier, true);

			if (!block) {
				return res.status(404).json({
					success: false,
					message: "Block not found",
				});
			}

			// Convert BigInt to appropriate types
			const blockData = {
				number: block.number ? Number(block.number) : null,
				hash: block.hash,
				parentHash: block.parentHash,
				nonce: block.nonce,
				sha3Uncles: block.sha3Uncles,
				logsBloom: block.logsBloom,
				transactionsRoot: block.transactionsRoot,
				stateRoot: block.stateRoot,
				receiptsRoot: block.receiptsRoot,
				miner: block.miner,
				difficulty: block.difficulty ? block.difficulty.toString() : "0",
				totalDifficulty: block.totalDifficulty
					? block.totalDifficulty.toString()
					: "0",
				extraData: block.extraData,
				size: block.size ? Number(block.size) : 0,
				gasLimit: block.gasLimit ? Number(block.gasLimit) : 0,
				gasUsed: block.gasUsed ? Number(block.gasUsed) : 0,
				timestamp: block.timestamp ? Number(block.timestamp) : 0,
				transactions: block.transactions
					? block.transactions.map((tx) => {
							if (typeof tx === "string") return tx;
							return {
								hash: tx.hash,
								from: tx.from,
								to: tx.to,
								value: tx.value ? tx.value.toString() : "0",
								gas: tx.gas ? Number(tx.gas) : 0,
								gasPrice: tx.gasPrice ? tx.gasPrice.toString() : "0",
							};
						})
					: [],
				uncles: block.uncles || [],
			};

			// Add human-readable timestamp
			blockData.timestampISO = new Date(
				blockData.timestamp * 1000,
			).toISOString();

			res.json({
				success: true,
				data: blockData,
			});
		} catch (error) {
			console.error("Error getting block:", error);
			res.status(500).json({
				success: false,
				message: "Error retrieving block",
				error: error.message,
			});
		}
	}
}

module.exports = new TransactionController();
