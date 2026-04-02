const express = require("express");
const { chatController } = require("../controllers/chat.controller");

const router = express.Router();

router.post("/chat", chatController);

module.exports = router;
