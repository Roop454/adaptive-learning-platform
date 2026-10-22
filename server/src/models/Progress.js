import mongoose from "mongoose";

// One row per lesson a learner has worked through. Score is the percentage of
// quiz questions answered correctly on the attempt that completed the lesson.
const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, required: true },
    topic: { type: String, required: true },
    status: { type: String, enum: ["in_progress", "completed"], default: "completed" },
    score: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, lesson: 1 }, { unique: true });

export const Progress = mongoose.model("Progress", progressSchema);
