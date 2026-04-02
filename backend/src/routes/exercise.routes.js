const express = require("express");
const {
  generateExerciseController,
  gradeExerciseController,
} = require("../controllers/exercise.controller");

const router = express.Router();

router.post("/exercise/generate", generateExerciseController);
router.post("/exercise/grade", gradeExerciseController);

module.exports = router;
