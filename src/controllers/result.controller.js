import mongoose from "mongoose";
import Result from "../models/result.model.js";
import Question from "../models/question.model.js";

/* ================================
   🔹 STUDENT + PANEL
================================ */

export const getResults = async (req, res) => {
  try {
    const query = {};

    if (req.user?.role === "student") {
      query.student = req.user._id;
    }

    const results = await Result.find(query)
      .populate({
        path: "student",
        select: "name username fullName email classId",
        populate: {
          path: "classId",
          select: "name",
        },
      })
      .populate("mock", "title")
      .sort({ createdAt: 1 });

    const normalized = results.map((r) => {
      const student = r.student || {};
      return {
        ...r.toObject(),
        studentName:
          student.name ||
          student.fullName ||
          student.username ||
          student.email ||
          "N/A",
        className: student.classId?.name || "N/A",
        classId: student.classId?._id || null,
      };
    });

    res.status(200).json(normalized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   🔹 SAVE RESULT
================================ */

export const saveResult = async (req, res) => {
  try {
    const { mockId, answers } = req.body;
    const student = req.user._id;

    if (!mockId || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const already = await Result.findOne({ student, mock: mockId });
    if (already) {
      return res
        .status(400)
        .json({ message: "You have already submitted this mock test" });
    }

    const questions = await Question.find({ mock_test_id: mockId });
    const totalQuestions = questions.length;

    let correct = 0;
    let attempted = 0;

    const detailedAnswers = questions.map((q) => {
      const given = answers.find(
        (a) => String(a.questionId) === String(q._id)
      );

      if (!given || given.selectedIndex == null) {
        return {
          question: q._id,
          selectedIndex: null,
          correctIndex: q.correctIndex,
          isCorrect: false,
        };
      }

      attempted++;
      const isCorrect = Number(given.selectedIndex) === Number(q.correctIndex);
      if (isCorrect) correct++;

      return {
        question: q._id,
        selectedIndex: Number(given.selectedIndex),
        correctIndex: Number(q.correctIndex),
        isCorrect,
      };
    });

    const wrong = attempted - correct;
    const percentage =
      totalQuestions > 0
        ? Math.round((correct / totalQuestions) * 100)
        : 0;

    const result = await Result.create({
      student,
      mock: mockId,
      score: correct,
      totalQuestions,
      correct,
      wrong,
      percentage,
      answers: detailedAnswers,
    });

    res.status(201).json({ message: "Result saved successfully", result });
  } catch (err) {
    res.status(500).json({ message: "Failed to save result" });
  }
};

/* ======================================================
   🔹 PANEL – MOCK WISE RESULT
====================================================== */

export const getAllMockResults = async (req, res) => {
  try {
    const { classId } = req.query;

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
    ];

    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      pipeline.push({
        $match: {
          "student.classId": new mongoose.Types.ObjectId(classId),
        },
      });
    }

    pipeline.push(
      {
        $project: {
          mock: 1,
          score: { $ifNull: ["$correct", "$score"] },
          totalQuestions: 1,
          percentage: {
            $cond: [
              { $gt: ["$totalQuestions", 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      { $ifNull: ["$correct", "$score"] },
                      "$totalQuestions",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$mock",
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$score" },
          avgPercentage: { $avg: "$percentage" },
        },
      },
      {
        $lookup: {
          from: "mocktests",
          localField: "_id",
          foreignField: "_id",
          as: "mock",
        },
      },
      { $unwind: "$mock" },
      {
        $project: {
          _id: 0,
          mockId: "$mock._id",
          title: "$mock.title",
          totalAttempts: 1,
          avgScore: { $round: ["$avgScore", 1] },
          avgPercentage: { $round: ["$avgPercentage", 1] },
        },
      }
    );

    const results = await Result.aggregate(pipeline);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to load results" });
  }
};

/* ======================================================
   🔹 MOCK → STUDENT RESULTS
====================================================== */

export const getMockStudentResults = async (req, res) => {
  try {
    const { mockId } = req.params;

    const results = await Result.find({ mock: mockId })
      .populate({
        path: "student",
        select: "name username fullName email classId",
        populate: {
          path: "classId",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    const normalized = results.map((r) => {
      const student = r.student || {};
      return {
        ...r.toObject(),
        studentName:
          student.name ||
          student.fullName ||
          student.username ||
          student.email ||
          "N/A",
        className: student.classId?.name || "N/A",
        classId: student.classId?._id || null,
      };
    });

    res.status(200).json(normalized);
  } catch {
    res.status(200).json([]);
  }
};

/* ======================================================
   🔹 SINGLE STUDENT RESULT DETAIL (🔥 FIXED)
====================================================== */

export const getStudentMockResultDetail = async (req, res) => {
  try {
    const { mockId, studentId } = req.params;

    // ✅ FIX 1: validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(mockId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(404).json({ message: "Result not found" });
    }

    // ✅ FIX 2: cast ObjectId
    const result = await Result.findOne({
      mock: new mongoose.Types.ObjectId(mockId),
      student: new mongoose.Types.ObjectId(studentId),
    })
      .populate({
        path: "student",
        select: "name username fullName email classId",
        populate: {
          path: "classId",
          select: "name",
        },
      })
      .populate("mock", "title duration")
      .populate("answers.question", "question options correctIndex");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const student = result.student || {};

    res.status(200).json({
      ...result.toObject(),
      studentName:
        student.name ||
        student.fullName ||
        student.username ||
        student.email ||
        "Unknown Student",
      className: student.classId?.name || "N/A",
      classId: student.classId?._id || null,
    });
  } catch (err) {
    console.error("Result detail error:", err);
    res.status(500).json({ message: "Failed to load result detail" });
  }
};
