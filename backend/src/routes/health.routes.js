const express = require("express");
const { query } = require("../db/query");

const router = express.Router();

router.get("/health", async (req, res, next) => {
  try {
    const pong = await query("SELECT 1 AS ok, now() AS server_time");
    res.json({
      success: true,
      data: {
        status: "ok",
        db: pong.rows[0],
      },
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
