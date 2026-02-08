import Chapter from "../models/chapter.model.js";
import mongoose from "mongoose";

/* ==================================================
   GET CHAPTERS
   - student → only own class
   - panel   → optional class filter
================================================== */
export const getChapters = async (req, res) => {
  try {
    const filter = {};

    // ✅ STUDENT: only own class
    if (req.user?.role === "student") {
      if (!req.user.classId) {
        return res.status(200).json([]);
      }

      filter.class_id = req.user.classId;
    }

    // ✅ PANEL: optional class filter
    if (
      req.user?.role !== "student" &&
      req.query.classId &&
      mongoose.Types.ObjectId.isValid(req.query.classId)
    ) {
      filter.class_id = req.query.classId;
    }

    const chapters = await Chapter.find(filter)
      .populate("class_id", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(chapters);
  } catch (err) {
    console.error("Get chapters error:", err);
    res.status(500).json({ message: "Failed to fetch chapters" });
  }
};

/* ==================================================
   CREATE CHAPTER (admin / sir)
================================================== */
export const createChapter = async (req, res) => {
  try {
    const { title, class_id, topics } = req.body;

    if (!title || !class_id) {
      return res.status(400).json({
        message: "Title and class are required",
      });
    }

    const chapter = await Chapter.create({
      title: title.trim(),
      class_id,
      topics: Array.isArray(topics) ? topics : [],
    });

    res.status(201).json({
      message: "Chapter created successfully",
      chapter,
    });
  } catch (err) {
    console.error("Create chapter error:", err);
    res.status(500).json({ message: "Failed to create chapter" });
  }
};

/* ==================================================
   UPDATE CHAPTER (topics add / delete)
================================================== */
export const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, class_id, topics } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const updated = await Chapter.findByIdAndUpdate(
      id,
      {
        ...(title && { title: title.trim() }),
        ...(class_id && { class_id }),
        ...(Array.isArray(topics) && { topics }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    res.status(200).json({
      message: "Chapter updated successfully",
      chapter: updated,
    });
  } catch (err) {
    console.error("Update chapter error:", err);
    res.status(500).json({ message: "Failed to update chapter" });
  }
};

/* ==================================================
   DELETE CHAPTER (admin / sir)
================================================== */
export const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    await Chapter.findByIdAndDelete(id);

    res.status(200).json({ message: "Chapter deleted successfully" });
  } catch (err) {
    console.error("Delete chapter error:", err);
    res.status(500).json({ message: "Failed to delete chapter" });
  }
};
