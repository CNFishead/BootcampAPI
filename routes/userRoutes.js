import express from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";
import advancedResults from "../middleware/advancedResults.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";
const router = express.Router({ mergeParams: true });

// Want protect and admin for all routes.
// anything below these routes, will use these middlewares.
// this is useful if ALL routes need a specific middleware.
router.use(protect);
router.use(authorize("admin"));

// Advanced results take in a model to query the database, and any populate
// But no populate is needed here.
router.route("/").get(advancedResults(User), getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

export default router;
