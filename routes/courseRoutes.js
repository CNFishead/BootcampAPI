import express from "express";
const router = express.Router({ mergeParams: true });
import {
  getCourses,
  getCourse,
  createNewCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import Course from "../models/Course.js";
import advancedResults from "../middleware/advancedResults.js";

router
  .route("/")
  .get(
    advancedResults(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  )
  .post(createNewCourse);
router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse);

export default router;
