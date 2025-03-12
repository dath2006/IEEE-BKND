import { Schema, model } from "mongoose";

// Schema for student
const studentSchema = new Schema({
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
});

// Model for student
const Student = model("Student", studentSchema);

export default Student;
