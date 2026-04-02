function sendSuccess(res, data, meta = {}) {
  const baseMeta = {
    timestamp: new Date().toISOString(),
    trace_id: res?.locals?.traceId || null,
  };

  return res.json({
    success: true,
    data,
    error: null,
    meta: { ...baseMeta, ...meta },
  });
}

function sendError(res, statusCode, code, message, details = null) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: res?.locals?.traceId || null,
    },
  });
}

module.exports = {
  sendSuccess,
  sendError,
};
