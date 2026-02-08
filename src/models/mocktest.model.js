import mongoose from "mongoose";

const mockTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    // 🔹 Class-wise mock (must match student.class_id)
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },

    // 🔹 Test duration (minutes)
    duration: {
      type: Number,
      required: true
    },

    // 🔹 Visibility in panel & student dashboard
    isActive: {
      type: Boolean,
      default: true
    },

    // 🔹 IMPORTANT: controls student access
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("MockTest", mockTestSchema);
