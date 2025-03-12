import dotenv from "dotenv";
dotenv.config();

import Student from "../models/student";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Teacher from "../models/teacher";
import Feedback from "../models/feedback";
import ExpressError from "../utils/expressError";

const JWT_SECRET = process.env.JWT_SECRET as string;

const studentController = {
  // Controller to register a student
  register: async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create a new student
    const student = new Student({ name, email, password: hashedPassword });
    // save the student
    await student.save();
    // create a token
    const token = jwt.sign(
      {
        id: student._id,
        role: "student",
      },
      JWT_SECRET
    );
    // set the token in the cookie
    res.cookie("token", token);
    // redirect to the home page
    res.redirect("/");
  },

  // Controller to login a student
  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // find the student
    const student = await Student.findOne({ email });
    // if the student is not found, throw an error
    if (!student) {
      throw new ExpressError("Invalid email or password", 400);
    }
    // compare the password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    // if the password is not valid, throw an error
    if (!isPasswordValid) {
      throw new ExpressError("Invalid email or password", 400);
    }
    const token = jwt.sign(
      {
        id: student._id,
        role: "student",
      },
      JWT_SECRET
    );
    // set the token in the cookie
    res.cookie("token", token);
    // redirect to the student dashboard
    res.redirect("/student/dashboard");
  },

  // Controller to render the student dashboard
  dashboard: async (req: Request, res: Response) => {
    const student = await Student.findById(req.user?.id);
    const teacher = await Teacher.find();
    res.render("student-dashboard", { student, teacher });
  },

  // Controller to render the feedback page
  renderFeedback: async (req: Request, res: Response) => {
    const student = await Student.findById(req.user?.id);
    await Teacher.findById(req.query.id)
      .then((teacher) => {
        res.render("student-feedback", { student, teacher });
      })
      // if the teacher is not found, throw an error
      .catch((err) => {
        res.status(400).json({ message: "Teacher not found" });
      });
  },

  // Controller to submit the feedback
  submitFeedback: async (req: Request, res: Response) => {
    const student = await Student.findById(req.user?.id);
    Teacher.findById(req.query.id)
      .then((teacher) => {
        const { feedback, rating } = req.body;
        const feedback_1 = new Feedback({
          feedback,
          rating,
          // add the teacher id to the feedback
          teacher: teacher?._id,
        });
        // save the feedback
        feedback_1.save();
        // add the student to the teacher's students so that the student can't give feedback to the same teacher again
        teacher?.students.push(student?._id as any);
        // save the teacher
        teacher?.save();
        res.status(200).json({ message: "Feedback submitted successfully" });
      })
      // if the teacher is not found, throw an error
      .catch((err) => {
        res.status(400).json({ message: "Teacher not found" });
      });
  },

  // Controller to logout a student
  logout: async (req: Request, res: Response) => {
    // clear the token
    res.clearCookie("token");
    // redirect to the home page
    res.redirect("/");
  },
};

// Export the student controller
export default studentController;
