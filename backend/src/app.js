const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const healthRoutes = require("./routes/health.routes");
const algorithmRoutes = require("./routes/algorithm.routes");
const chatRoutes = require("./routes/chat.routes");
const documentsRoutes = require("./routes/documents.routes");
const exerciseRoutes = require("./routes/exercise.routes");
const { createRateLimiter } = require("./middleware/rateLimit");
const { requestContext } = require("./middleware/requestContext");
const {
  corsOriginWhitelist,
  rateLimitWindowMs,
  rateLimitChatMax,
  rateLimitExerciseMax,
  rateLimitUploadMax,
} = require("./config");
const { sendError } = require("./utils/response");

const app = express();

app.use(helmet());
app.use(requestContext);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (corsOriginWhitelist.length === 0) return callback(null, true);
      if (corsOriginWhitelist.includes(origin)) return callback(null, true);

      return callback(new Error("Origin is not allowed by CORS"));
    },
  }),
);

app.use(express.json({ limit: "2mb" }));

morgan.token("trace-id", (req) => req.traceId || "-");
app.use(
  morgan("[:date[iso]] :method :url :status :response-time ms trace=:trace-id"),
);

const chatRateLimiter = createRateLimiter({
  key: "chat",
  maxRequests: rateLimitChatMax,
  windowMs: rateLimitWindowMs,
});

const exerciseRateLimiter = createRateLimiter({
  key: "exercise",
  maxRequests: rateLimitExerciseMax,
  windowMs: rateLimitWindowMs,
});

const uploadRateLimiter = createRateLimiter({
  key: "documents-upload",
  maxRequests: rateLimitUploadMax,
  windowMs: rateLimitWindowMs,
});

app.use("/api", healthRoutes);
app.use("/api", algorithmRoutes);
app.use("/api/documents/upload", uploadRateLimiter);
app.use("/api", documentsRoutes);
app.use("/api/chat", chatRateLimiter);
app.use("/api/exercise", exerciseRateLimiter);
app.use("/api", chatRoutes);
app.use("/api", exerciseRoutes);

app.use((req, res) => {
  return sendError(res, 404, "NOT_FOUND", "Route not found");
});

app.use((err, req, res, next) => {
  const knownStatus = Number(err?.statusCode);
  if (knownStatus >= 400 && knownStatus < 600) {
    return sendError(
      res,
      knownStatus,
      err.code || "REQUEST_ERROR",
      err.message || "Request failed",
    );
  }

  const message = err && err.message ? err.message : "Internal server error";

  if (/required|must be|invalid|empty/i.test(message)) {
    return sendError(res, 400, "VALIDATION_ERROR", message);
  }

  process.stderr.write(`Unhandled error: ${message}\n`);
  return sendError(res, 500, "INTERNAL_ERROR", message);
});

module.exports = app;
