import Teacher from "../models/teacher";
import { Request, Response } from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Student from "../models/student";
import Feedback from "../models/feedback";
import ExpressError from "../utils/expressError";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const teacherController = {
  // Controller to register a teacher
  register: async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create a new teacher
    const teacher = new Teacher({ name, email, password: hashedPassword });
    // save the teacher
    await teacher.save();
    // create a token
    const token = jwt.sign(
      {
        id: teacher._id,
        role: "teacher",
      },
      JWT_SECRET
    );
    // set the token in the cookie
    res.cookie("token", token);
    // redirect to the home page
    res.redirect("/");
  },

  // Controller to login a teacher
  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // find the teacher
    const teacher = await Teacher.findOne({ email });
    // if the teacher is not found, throw an error
    if (!teacher) {
      throw new ExpressError("Invalid email or password", 400);
    }
    // compare the password
    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    // if the password is not valid, throw an error
    if (!isPasswordValid) {
      throw new ExpressError("Invalid email or password", 400);
    }
    // create a token
    const token = jwt.sign(
      {
        id: teacher._id,
        role: "teacher",
      },
      JWT_SECRET
    );
    // set the token in the cookie
    res.cookie("token", token);
    // redirect to the teacher dashboard
    res.redirect("/teacher/dashboard");
  },

  // Controller to render the teacher dashboard
  dashboard: async (req: Request, res: Response) => {
    const teacher = await Teacher.findById(req.user?.id);
    const feedback = await Feedback.find({ teacher: teacher?._id });
    // calculate the average rating
    const AverageRating =
      feedback.reduce((acc, curr) => acc + parseInt(curr.rating as any), 0) /
      feedback.length;
    const positiveFeedback = feedback.filter(
      (ele) => ele.feedback === "positive"
    );
    // calculate the number of positive feedback
    const NoOfPositiveFeedback = positiveFeedback.length;
    const negativeFeedback = feedback.filter(
      (ele) => ele.feedback === "negative"
    );
    // calculate the number of negative feedback
    const NoOfNegativeFeedback = negativeFeedback.length;
    const neutralFeedback = feedback.filter(
      (ele) => ele.feedback === "neutral"
    );
    // calculate the number of neutral feedback
    const NoOfNeutralFeedback = neutralFeedback.length;
    res.render("teacher-dashboard", {
      teacher: {
        _id: teacher?._id,
        email: teacher?.email,
        name: teacher?.name,
        students: teacher?.students,
      },
      feedback,
      AverageRating,
      NoOfPositiveFeedback,
      NoOfNegativeFeedback,
      NoOfNeutralFeedback,
    });
  },

  // Controller to render the feedback page
  renderFeedback: async (req: Request, res: Response) => {
    const teacher = await Teacher.findById(req.user?.id);
    const feedback = await Feedback.find({ teacher: teacher?._id });
    const student = await Student.find();
    // Find the  students who have not given feedback
    const LeftOutStudents = student
      .filter((stu) => !teacher?.students.includes(stu?._id as any))
      .map((stu) => stu.name);
    // Find the students who have given feedback
    const submittedStudents = student
      .filter((stu) => teacher?.students.includes(stu?._id as any))
      .map((stu) => stu.name);
    // Calculate the feedback
    const { noOfStudents, noOfFeedback, remainingStudents, percentage } =
      calculateFeedback(student, feedback);
    // Render the feedback page
    res.json({
      LeftOutStudents,
      remainingStudents,
      percentage,
      noOfFeedback,
      noOfStudents,
      teacher: {
        _id: teacher?._id,
        email: teacher?.email,
        name: teacher?.name,
        students: teacher?.students,
      },
      feedback,
      student: student.map((stu) => ({
        _id: stu._id,
        name: stu.name,
        email: stu.email,
      })),
      submittedStudents,
    });
  },

  // Controller to logout a teacher
  logout: async (req: Request, res: Response) => {
    // clear the token
    res.clearCookie("token");
    // redirect to the home page
    res.redirect("/");
  },
};

// Function to calculate the feedback
function calculateFeedback(student: any[], feedback: any[]) {
  const noOfStudents = student.length;
  const noOfFeedback = feedback.length;
  const remainingStudents = student.filter(
    (stu) => !feedback.includes(stu._id)
  );
  const percentage = (noOfFeedback / noOfStudents) * 100;
  return { noOfStudents, noOfFeedback, remainingStudents, percentage };
}

// Export the teacher controller
export default teacherController;
