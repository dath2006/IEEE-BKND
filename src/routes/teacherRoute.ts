import dotenv from "dotenv";
dotenv.config();

import express from "express";
import asyncWrap from "../utils/asyncErrorHandler";
import { Request, Response } from "express";
import {
  isLoggedIn,
  isTeacherExist,
  isTeacher,
} from "../middlewares/middleware";
import teacherController from "../controllers/teacherController";

// Router for teacher routes
// mergeParams is used to merge the params from the parent router
const router = express.Router({ mergeParams: true });

// Route for rendering the register page
router
  .route("/register")
  .get((req: Request, res: Response) => {
    res.render("teacher-register");
  })
  .post(isTeacherExist, asyncWrap(teacherController.register));

// Route for logging in a teacher
router.post("/login", isTeacherExist, asyncWrap(teacherController.login));

// Route for rendering the dashboard page
router.get(
  "/dashboard",
  isLoggedIn,
  isTeacher,
  asyncWrap(teacherController.dashboard)
);

// Route for rendering the feedback page
router.get(
  "/analytics",
  isLoggedIn,
  isTeacher,
  asyncWrap(teacherController.renderFeedback)
);

// Route for logging out a teacher
router.get(
  "/logout",
  isLoggedIn,
  isTeacher,
  asyncWrap(teacherController.logout)
);

// Export the router
export default router;
