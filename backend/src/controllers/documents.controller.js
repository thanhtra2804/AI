const { ingestDocument } = require("../services/rag.service");
const { sendSuccess } = require("../utils/response");
const { assertDocumentUploadPayload } = require("../utils/validators");

async function uploadDocumentController(req, res, next) {
  try {
    assertDocumentUploadPayload(req.body);
    const result = await ingestDocument(req.body);

    return sendSuccess(res, result, {
      timestamp: new Date().toISOString(),
      trace_id: result.trace_id,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  uploadDocumentController,
};
