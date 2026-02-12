import StudentFee from "../models/StudentFee.js";
import User from "../models/User.js";

/* =========================
   Helper: generate 12 months unpaid
========================= */
const generateMonths = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    paid: false,
    paidAt: null,
  }));
};

/* =========================
   GET FEES BY CLASS (SIR)
========================= */
export const getFeesByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // get active students of class
    const students = await User.find({
      classId,
      role: "student",
      isActive: true,
    });

    // get existing fee records
    let feeRecords = await StudentFee.find({ classId, year });

    // auto-create missing fee records
    for (const student of students) {
      const exists = feeRecords.find(
        (f) => f.studentId.toString() === student._id.toString()
      );

      if (!exists) {
        const newFee = await StudentFee.create({
          studentId: student._id,
          classId,
          year,
          months: generateMonths(),
        });

        feeRecords.push(newFee);
      }
    }

    // populate student safely
    const populated = await StudentFee.find({ classId, year })
      .populate({
        path: "studentId",
        select: "_id name fullName username email",
      })
      .sort({ createdAt: 1 });

    // ensure fallback name exists (NO delete, only transform response)
    const safeResponse = populated.map((record) => {
      const student = record.studentId;

      let displayName =
        student?.name ||
        student?.fullName ||
        student?.username ||
        "Unnamed Student";

      return {
        ...record.toObject(),
        studentId: {
          ...student?._doc,
          displayName,
        },
      };
    });

    res.json(safeResponse);
  } catch (err) {
    console.error("getFeesByClass error:", err);
    res.status(500).json({ message: "Failed to fetch fees" });
  }
};

/* =========================
   UPDATE STUDENT FEE (SIR)
========================= */
export const updateStudentFee = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { year, months } = req.body;

    if (!year || !Array.isArray(months) || months.length !== 12) {
      return res.status(400).json({
        message: "Invalid year or months data",
      });
    }

    const fee = await StudentFee.findOne({ studentId, year });

    if (!fee) {
      return res.status(404).json({
        message: "Fee record not found",
      });
    }

    // update months safely
    fee.months = months.map((m) => ({
      month: m.month,
      paid: m.paid,
      paidAt: m.paid ? m.paidAt || new Date() : null,
    }));

    await fee.save();

    res.json({
      message: "Fee updated successfully",
      fee,
    });
  } catch (err) {
    console.error("updateStudentFee error:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* =========================
   GET OWN FEE (STUDENT)
========================= */
export const getMyFees = async (req, res) => {
  try {
    const studentId = req.user._id;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const fee = await StudentFee.findOne({ studentId, year });

    if (!fee) {
      return res.json(null);
    }

    res.json(fee);
  } catch (err) {
    console.error("getMyFees error:", err);
    res.status(500).json({ message: "Failed to fetch" });
  }
};
