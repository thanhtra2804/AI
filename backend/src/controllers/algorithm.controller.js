const { runAlgorithm } = require("../services/algorithm.service");
const { assertGraphPayload } = require("../utils/validators");
const { sendSuccess } = require("../utils/response");

async function runAlgorithmController(req, res, next) {
  try {
    assertGraphPayload(req.body);
    const result = runAlgorithm(req.body);

    return sendSuccess(
      res,
      {
        algorithm: result.algorithm,
        inputGraph: req.body.graph,
        steps: result.steps,
        summary: result.summary,
      },
      { timestamp: new Date().toISOString() },
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  runAlgorithmController,
};
