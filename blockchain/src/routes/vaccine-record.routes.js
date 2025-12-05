const express = require("express");
const router = express.Router();
const vaccineRecordController = require("../controllers/vaccine-record.controller");

// Create vaccine record
router.post("/create", vaccineRecordController.createRecord);

// Get specific record
router.get("/:recordId", vaccineRecordController.getRecord);

// Get records by identity
router.get(
	"/identity/:identityHash",
	vaccineRecordController.getRecordsByIdentity,
);

// Update record IPFS hash
router.put("/:recordId/ipfs", vaccineRecordController.updateRecordIPFS);

// Get total records count
router.get("/stats/total", vaccineRecordController.getTotalRecords);

module.exports = router;
