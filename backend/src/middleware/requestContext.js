const { randomUUID } = require("crypto");

function requestContext(req, res, next) {
  const incoming = req.headers["x-trace-id"];
  const traceId =
    typeof incoming === "string" && incoming.trim().length > 0
      ? incoming.trim()
      : randomUUID();

  req.traceId = traceId;
  res.locals.traceId = traceId;
  res.setHeader("x-trace-id", traceId);
  next();
}

module.exports = {
  requestContext,
};
