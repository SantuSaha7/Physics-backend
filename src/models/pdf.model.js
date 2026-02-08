import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  drive_link: {
    type: String,
    required: true
  },
  chapter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Pdf", pdfSchema);
