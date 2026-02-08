import MockTest from "../models/mocktest.model.js";
import Question from "../models/question.model.js";
import mongoose from "mongoose";

/* =====================================================
   STUDENT SIDE
===================================================== */

// ✅ GET ALL ACTIVE MOCKS FOR LOGGED-IN STUDENT (CLASS WISE)
export const getAllMocks = async (req, res) => {
  try {
    const studentClassId = req.user?.classId;

    if (!studentClassId) {
      return res.status(400).json({
        message: "Student class not found"
      });
    }

    const classObjectId = new mongoose.Types.ObjectId(studentClassId);

    const mocks = await MockTest.find({
      isActive: true,
      class_id: classObjectId
    }).sort({ createdAt: -1 });

    res.status(200).json(mocks);
  } catch (err) {
    console.error("Get mocks error:", err);
    res.status(500).json({ message: "Failed to load mocks" });
  }
};

// ✅ GET QUESTIONS BY MOCK ID (Student)
export const getMockQuestions = async (req, res) => {
  try {
    const { mockId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(mockId)) {
      return res.status(400).json({ message: "Invalid mock ID" });
    }

    const questions = await Question.find({
      mock_test_id: mockId
    }).sort({ createdAt: 1 });

    res.status(200).json(questions);
  } catch (err) {
    console.error("Get mock questions error:", err);
    res.status(500).json({ message: "Failed to load questions" });
  }
};

// ✅ SUBMIT RESULT (placeholder – safe)
export const submitResult = async (req, res) => {
  res.status(200).json({ message: "Result submitted successfully" });
};

/* =====================================================
   SIR / ADMIN SIDE
===================================================== */

// 🟢 CREATE MOCK TEST
export const createMockTest = async (req, res) => {
  try {
    const { title, class_id, duration } = req.body;

    if (!title || !class_id || !duration) {
      return res.status(400).json({
        message: "title, class and duration are required"
      });
    }

    const mock = await MockTest.create({
      title,
      class_id,
      duration,
      isActive: true,
      isPublished: true
    });

    res.status(201).json({
      message: "Mock test created successfully",
      mock
    });
  } catch (err) {
    console.error("Create mock error:", err);
    res.status(500).json({ message: "Failed to create mock test" });
  }
};

// 🟢 ADD QUESTION TO MOCK
export const addQuestionToMock = async (req, res) => {
  try {
    const { mock_test_id, question, options, correctIndex } = req.body;

    if (
      !mock_test_id ||
      !question ||
      !Array.isArray(options) ||
      correctIndex === undefined
    ) {
      return res.status(400).json({
        message: "mock, question, options and correct answer are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(mock_test_id)) {
      return res.status(400).json({ message: "Invalid mock test ID" });
    }

    const newQuestion = await Question.create({
      mock_test_id,
      question,
      options,
      correctIndex
    });

    res.status(201).json({
      message: "Question added successfully",
      question: newQuestion
    });
  } catch (err) {
    console.error("Add question error:", err);
    res.status(500).json({ message: "Failed to add question" });
  }
};

// 🔄 TOGGLE MOCK ACTIVE / INACTIVE
export const toggleMockStatus = async (req, res) => {
  try {
    const { mockId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(mockId)) {
      return res.status(400).json({ message: "Invalid mock ID" });
    }

    const mock = await MockTest.findById(mockId);
    if (!mock) {
      return res.status(404).json({ message: "Mock not found" });
    }

    mock.isActive = !mock.isActive;
    await mock.save();

    res.json({
      message: "Mock status updated",
      isActive: mock.isActive
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update mock status" });
  }
};

// 🗑️ DELETE MOCK + QUESTIONS
export const deleteMock = async (req, res) => {
  try {
    const { mockId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(mockId)) {
      return res.status(400).json({ message: "Invalid mock ID" });
    }

    await Question.deleteMany({ mock_test_id: mockId });
    await MockTest.findByIdAndDelete(mockId);

    res.json({ message: "Mock and its questions deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete mock" });
  }
};

// 📋 GET MOCK WITH QUESTIONS (Sir/Admin)
export const getMockWithQuestions = async (req, res) => {
  try {
    const { mockId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(mockId)) {
      return res.status(400).json({ message: "Invalid mock ID" });
    }

    const mock = await MockTest.findById(mockId);
    if (!mock) {
      return res.status(404).json({ message: "Mock not found" });
    }

    const questions = await Question.find({
      mock_test_id: mockId
    });

    res.json({ mock, questions });
  } catch (err) {
    res.status(500).json({ message: "Failed to load mock details" });
  }
};

// 🗑️ DELETE SINGLE QUESTION
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    await Question.findByIdAndDelete(questionId);

    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete question" });
  }
};

// 🟦 GET ALL MOCKS (PANEL + ADD QUESTION)
// ✅ FINAL FIX: only ACTIVE mocks, safe class filter
export const getAllMocksForPanel = async (req, res) => {
  try {
    const { classId } = req.query;

    const filter = {};
    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      filter.class_id = new mongoose.Types.ObjectId(classId);
    }

    const mocks = await MockTest.find({
      ...filter,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json(mocks);
  } catch (err) {
    console.error("Panel get mocks error:", err);
    res.status(500).json({ message: "Failed to load mocks" });
  }
};
