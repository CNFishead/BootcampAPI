import express from "express";
import {
  createBootcamp,
  deleteBootcamp,
  getBootcamp,
  getBootcamps,
  getBootcampsInRadius,
  updateBootcamp,
} from "../controllers/bootcampController.js";
const router = express.Router();

// Include other routers
import courseRouter from "./courseRoutes.js";

// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);

// routes specific to the home route,
// These Routes are public
router.route("/").get(getBootcamps).post(createBootcamp);

// routes specific to an :id
router
  .route("/:id")
  // public
  .get(getBootcamp)
  // private
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

export default router;
