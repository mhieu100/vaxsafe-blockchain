const express = require("express");
const router = express.Router();
const ipfsController = require("../controllers/ipfsController");

// POST /ipfs/upload
router.post("/upload", ipfsController.upload);

module.exports = router;
