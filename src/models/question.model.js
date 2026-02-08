import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    // 🔹 Which mock test this question belongs to
    mock_test_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockTest",
      required: true
    },

    // 🔹 Question text
    question: {
      type: String,
      required: true,
      trim: true
    },

    // 🔹 4 options (A, B, C, D)
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length === 4;
        },
        message: "Exactly 4 options are required"
      }
    },

    // 🔹 Index of correct option (0–3)
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    }
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
