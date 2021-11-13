import express from "express";
const router = express.Router({ mergeParams: true });
import { getCourses } from "../controllers/courseController.js";

router.route("/").get(getCourses);

export default router;
