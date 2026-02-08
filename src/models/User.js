import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // 🔹 STUDENT ID (ONLY FOR STUDENTS)
    studentId: {
      type: String,
      unique: true,
      sparse: true, // admin / sir এর জন্য empty allow করবে
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "sir", "student"],
      required: true,
    },

    // 🔹 ONLY FOR STUDENTS
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: function () {
        return this.role === "student";
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* ===============================
   AUTO GENERATE STUDENT ID
   Format: STU-1, STU-2, STU-3 ...
================================ */
userSchema.pre("save", async function (next) {
  try {
    // শুধু student এর জন্য
    if (this.role !== "student" || this.studentId) {
      return next();
    }

    const User = mongoose.model("User");

    // 🔒 last student number বের করা (safe way)
    const lastStudent = await User.findOne(
      { studentId: { $regex: /^STU-\d+$/ } },
      { studentId: 1 }
    ).sort({ createdAt: -1 });

    let nextNumber = 1;

    if (lastStudent?.studentId) {
      const lastNum = Number(
        lastStudent.studentId.replace("STU-", "")
      );
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }

    this.studentId = `STU-${nextNumber}`;
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("User", userSchema);
