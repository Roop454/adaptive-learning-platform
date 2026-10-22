import mongoose from "mongoose";

// One row per answered quiz question. These attempts are the raw signal the
// adaptive engine replays to estimate how well a learner knows each topic.
const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, required: true },
    topic: { type: String, required: true },
    difficulty: { type: Number, required: true, min: 1, max: 5 },
    correct: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export const Attempt = mongoose.model("Attempt", attemptSchema);
