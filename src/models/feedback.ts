import { Schema, model } from "mongoose";

// Schema for feedback
const feedbackSchema = new Schema({
  // Feedback is a string
  feedback: {
    type: String,
    required: true,
  },
  // Rating is a number
  rating: {
    type: Number,
    required: true,
  },
  // Teacher is a reference to the feedback belongs to anonymous student
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
});

// Model for feedback
const Feedback = model("Feedback", feedbackSchema);

export default Feedback;
