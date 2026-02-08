import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    pdfLink: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // class-wise isolation
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    // 🔹 Chapter → Topics → PDF
    topics: {
      type: [topicSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chapter", chapterSchema);
