import express from "express";
import {
  createBootcamp,
  deleteBootcamp,
  getBootcamp,
  getBootcamps,
  updateBootcamp,
} from "../controllers/bootcampController.js";
const router = express.Router();

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

export default router;
