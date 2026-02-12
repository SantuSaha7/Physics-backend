import mongoose from "mongoose";

const monthSchema = new mongoose.Schema({
  month: {
    type: Number, // 1 - 12
    required: true,
    min: 1,
    max: 12,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: Date,
    default: null,
  },
});

const studentFeeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    months: {
      type: [monthSchema],
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate year record for same student
studentFeeSchema.index({ studentId: 1, year: 1 }, { unique: true });

export default mongoose.model("StudentFee", studentFeeSchema);
