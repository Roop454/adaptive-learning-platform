import mongoose from "mongoose";

// A quiz question attached to a lesson. Each question records which option is
// correct so the server can grade attempts without trusting the client.
const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  options: { type: [String], required: true },
  answerIndex: { type: Number, required: true },
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: Number, required: true, min: 1, max: 5 },
  estimatedMinutes: { type: Number, default: 15 },
  summary: { type: String, default: "" },
  prerequisites: { type: [String], default: [] },
  questions: { type: [questionSchema], default: [] },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    level: { type: String, default: "beginner" },
    lessons: { type: [lessonSchema], default: [] },
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
