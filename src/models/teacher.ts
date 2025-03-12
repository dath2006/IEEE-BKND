import { Schema, model } from "mongoose";

// Schema for teacher
const teacherSchema = new Schema({
  // Name is a string
  name: {
    type: String,
    required: true,
  },
  // Email is a string
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // Password is a string
  password: {
    type: String,
    required: true,
  },
  // Students is an array of student ids who have submitted feedback to the respective teacher
  students: {
    type: [Schema.Types.ObjectId],
    ref: "Student",
  },
});

// Model for teacher
const Teacher = model("Teacher", teacherSchema);

export default Teacher;
