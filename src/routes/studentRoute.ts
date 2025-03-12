import dotenv from "dotenv";
dotenv.config();

import express from "express";
import {
  isLoggedIn,
  isStudentExist,
  isStudent,
  isFeedbackGiven,
} from "../middlewares/middleware";
import asyncWrap from "../utils/asyncErrorHandler";
import { Request, Response } from "express";
import studentController from "../controllers/studentController";

// Router for student routes
// mergeParams is used to merge the params from the parent router
const router = express.Router({ mergeParams: true });

// All routes are protected by the isLoggedIn middleware

// Route for rendering the feedback page
router
  .route("/feedback")
  .get(isLoggedIn, isStudent, asyncWrap(studentController.renderFeedback))
  .post(
    isLoggedIn,
    isStudent,
    isFeedbackGiven,
    asyncWrap(studentController.submitFeedback)
  );

// Route for rendering the register page
router
  .route("/register")
  .get((req: Request, res: Response) => {
    res.render("student-register");
  })
  .post(isStudentExist, asyncWrap(studentController.register));

// Route for logging in a student
router.post("/login", isStudentExist, asyncWrap(studentController.login));

// Route for rendering the dashboard page
router.get(
  "/dashboard",
  isLoggedIn,
  isStudent,
  asyncWrap(studentController.dashboard)
);

// Route for logging out a student
router.get(
  "/logout",
  isLoggedIn,
  isStudent,
  asyncWrap(studentController.logout)
);

// Export the router
export default router;
