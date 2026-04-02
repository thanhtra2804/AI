const { askContextAwareQuestion } = require("../services/chat.service");
const { sendSuccess } = require("../utils/response");
const { assertChatPayload } = require("../utils/validators");

async function chatController(req, res, next) {
  try {
    assertChatPayload(req.body);
    const result = await askContextAwareQuestion(req.body);

    return sendSuccess(res, result, {
      timestamp: new Date().toISOString(),
      trace_id: result.trace_id,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  chatController,
};
