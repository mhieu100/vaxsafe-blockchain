const express = require("express");
const router = express.Router();
const identityController = require("../controllers/identity.controller");

// Create identity
router.post("/create", identityController.createIdentity);

// Link document to identity
router.post("/link-document", identityController.linkDocument);

// Verify document
router.post("/verify-document", identityController.verifyDocument);

// === LOG ROUTES ===
// Get all identity creation logs
router.get("/logs/all", identityController.getIdentityLogs);

// Get identity creation statistics
router.get("/logs/statistics", identityController.getIdentityStatistics);

// Get logs by identity hash
router.get(
	"/logs/identity/:identityHash",
	identityController.getLogsByIdentityHash,
);

// Get logs by email
router.get("/logs/email/:email", identityController.getLogsByEmail);

// Clear old logs
router.post("/logs/clear", identityController.clearOldLogs);

// Get identity details
router.get("/:identityHash", identityController.getIdentity);

// Get documents for identity
router.get("/:identityHash/documents", identityController.getDocuments);

module.exports = router;
