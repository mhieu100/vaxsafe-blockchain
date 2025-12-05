const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");

// Get transaction details by hash
router.get("/:txHash", transactionController.getTransaction);

// Get transaction receipt by hash
router.get("/:txHash/receipt", transactionController.getTransactionReceipt);

// Get block details by number or hash
router.get("/block/:blockId", transactionController.getBlock);

module.exports = router;
