const express = require("express");
const {
  uploadDocumentController,
} = require("../controllers/documents.controller");

const router = express.Router();

router.post("/documents/upload", uploadDocumentController);

module.exports = router;
