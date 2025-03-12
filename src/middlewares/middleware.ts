import { Request, Response, NextFunction } from "express";
import ExpressError from "../utils/expressError";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import Student from "../models/student";
import Teacher from "../models/teacher";
import { RegisterSchema, LoginSchema, FeedbackSchema } from "../schema";
import { z } from "zod";
import { Types } from "mongoose";

// Extend Express Request type to include user role
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        role?: "student" | "teacher";
      };
    }
  }
}

// User type for validation
type User = z.infer<typeof RegisterSchema> | z.infer<typeof LoginSchema>;

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET as string;

// Middleware to check if the user is logged in
export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) {
    return next(new ExpressError("You are not logged in", 401));
  }
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  req.user = decoded;
  return next();
};

// Middleware to check if the student exists
export const isStudentExist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // zod validation for login and register
    let validation;
    if (req.path === "/login") {
      validation = LoginSchema.safeParse(req.body);
    } else {
      validation = RegisterSchema.safeParse(req.body);
    }

    if (!validation.success) {
      return next(new ExpressError(JSON.parse(validation.error.message), 400));
    }

    const user = validation.data as User;
    const student = await Student.findOne({ email: user.email });

    // if the user is registering and the user already exists, return an error
    if (req.path === "/register" && student) {
      return next(new ExpressError("Student already exists", 400));
    }

    // if the user is logging in and the user does not exist, return an error
    if (req.path === "/login" && !student) {
      return next(new ExpressError("Student not found", 400));
    }

    // if the user is valid, set the user in the request
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

// Middleware to check if the teacher exists
export const isTeacherExist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let validation;
    if (req.path === "/login") {
      validation = LoginSchema.safeParse(req.body);
    } else {
      validation = RegisterSchema.safeParse(req.body);
    }

    if (!validation.success) {
      return next(new ExpressError(JSON.parse(validation.error.message), 400));
    }

    const user = validation.data as User;
    const teacher = await Teacher.findOne({ email: user.email });

    // if the user is registering and the user already exists, return an error
    if (req.path === "/register" && teacher) {
      return next(new ExpressError("Teacher already exists", 400));
    }

    // if the user is logging in and the user does not exist, return an error
    if (req.path === "/login" && !teacher) {
      return next(new ExpressError("Teacher not found", 400));
    }

    // if the user is valid, set the user in the request
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

// Middleware to check if the user is a teacher
export const isTeacher = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "teacher") {
    return next(new ExpressError("Access denied. Teachers only.", 403));
  }
  return next();
};

// Middleware to check if the user is a student
export const isStudent = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "student") {
    return next(new ExpressError("Access denied. Students only.", 403));
  }
  return next();
};

// Middleware to check if the feedback is given
export const isFeedbackGiven = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // zod validation for feedback
    const validation = FeedbackSchema.safeParse(req.body);

    if (!validation.success) {
      return next(new ExpressError(JSON.parse(validation.error.message), 400));
    }
    const student = await Student.findById(req.user?.id);
    const teacher = await Teacher.findById(req.query.id);
    // if the student has already given feedback to the teacher, return an error
    if (teacher?.students.includes(student?._id as Types.ObjectId)) {
      return next(
        new ExpressError("You have already given feedback to this teacher", 400)
      );
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
