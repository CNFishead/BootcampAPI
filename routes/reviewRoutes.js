import express from "express";
const router = express.Router({ mergeParams: true });
import {
  getReview,
  getReviews,
  addReview,
} from "../controllers/reviewController.js";
import Review from "../models/Review.js";
import advancedResults from "../middleware/advancedResults.js";
import { protect, authorize } from "../middleware/auth.js";

router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "bootcamp",
      select: "name description",
    }),
    getReviews
  )
  .post(protect, authorize("user", "admin"), addReview);
router.route("/:id").get(getReview);

export default router;
