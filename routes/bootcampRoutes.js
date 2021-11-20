import express from "express";
import {
  bootcampPhotoUpload,
  createBootcamp,
  deleteBootcamp,
  getBootcamp,
  getBootcamps,
  getBootcampsInRadius,
  updateBootcamp,
} from "../controllers/bootcampController.js";
import advancedResults from "../middleware/advancedResults.js";
import Bootcamp from "../models/Bootcamp.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Include other routers
import courseRouter from "./courseRoutes.js";
import reviewRouter from "./reviewRoutes.js";
// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

// routes specific to the home route,
// These Routes are public
router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);

// routes specific to an :id
router
  .route("/:id")
  // public
  .get(getBootcamp)
  // private
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);
router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

export default router;
