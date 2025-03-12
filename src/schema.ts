import { z } from "zod";

// Schema for registering a new user
const RegisterSchema = z.object({
  name: z.string().min(1).max(50, "Name too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

// Schema for logging in a user
const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

// Schema for submitting feedback
const FeedbackSchema = z.object({
  feedback: z.enum(["positive", "negative", "neutral"]),
  // coerce is used to convert the rating to a number
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
});

export { RegisterSchema, LoginSchema, FeedbackSchema };
