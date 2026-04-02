const {
  generateExercise,
  gradeExercise,
} = require("../services/exercise.service");
const { sendSuccess } = require("../utils/response");
const {
  assertExerciseGeneratePayload,
  assertExerciseGradePayload,
} = require("../utils/validators");

async function generateExerciseController(req, res, next) {
  try {
    assertExerciseGeneratePayload(req.body);
    const result = await generateExercise(req.body || {});

    return sendSuccess(res, result, {
      timestamp: new Date().toISOString(),
      exercise_id: result.exercise_id,
    });
  } catch (error) {
    return next(error);
  }
}

async function gradeExerciseController(req, res, next) {
  try {
    assertExerciseGradePayload(req.body);
    const result = await gradeExercise(req.body);

    return sendSuccess(res, result, {
      timestamp: new Date().toISOString(),
      exercise_id: result.exercise_id,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  generateExerciseController,
  gradeExerciseController,
};
