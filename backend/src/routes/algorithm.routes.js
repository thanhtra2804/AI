const express = require("express");
const {
  runAlgorithmController,
} = require("../controllers/algorithm.controller");

const router = express.Router();

router.post("/algorithm/run", runAlgorithmController);

module.exports = router;
