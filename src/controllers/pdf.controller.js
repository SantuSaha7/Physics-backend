import Pdf from "../models/pdf.model.js";

// ➕ Admin: Add PDF
export const addPdf = async (req, res) => {
  const { title, drive_link, chapter_id } = req.body;

  const pdf = new Pdf({ title, drive_link, chapter_id });
  await pdf.save();

  res.json({ message: "PDF added successfully" });
};

// 📄 Get PDFs by chapter (Student/Admin view)
export const getPdfsByChapter = async (req, res) => {
  const { chapterId } = req.params;

  const pdfs = await Pdf.find({ chapter_id: chapterId });
  res.json(pdfs);
};
