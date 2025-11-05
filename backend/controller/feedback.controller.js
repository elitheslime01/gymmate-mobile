import Feedback from "../models/feedback.model.js";

const sanitizeFeedback = (doc) => {
  const feedback = doc.toObject();
  if (Array.isArray(feedback.attachments)) {
    feedback.attachments = feedback.attachments.map(({ filename, mimetype, size, _id }) => ({
      _id,
      filename,
      mimetype,
      size,
    }));
  }
  return feedback;
};

export const createFeedback = async (req, res) => {
  try {
    const { category, subcategory, message, studentId } = req.body;

    if (!category || !subcategory || !message) {
      return res.status(400).json({
        success: false,
        message: "Category, subcategory, and message are required.",
      });
    }

    const files = Array.isArray(req.files) ? req.files.slice(0, 3) : [];

    const attachments = files.map((file) => ({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      data: file.buffer,
    }));

    const feedback = await Feedback.create({
      student: studentId || null,
      category,
      subcategory,
      message,
      attachments,
    });

    return res.status(201).json({
      success: true,
      data: sanitizeFeedback(feedback),
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback. Please try again later.",
    });
  }
};

export const listFeedback = async (req, res) => {
  try {
    const { studentId } = req.query;
    const query = {};

    if (studentId) {
      query.student = studentId;
    }

    const feedbackList = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: "student", select: "_fName _lName _umakEmail" });

    return res.status(200).json({
      success: true,
      data: feedbackList.map(sanitizeFeedback),
    });
  } catch (error) {
    console.error("Error listing feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch feedback entries.",
    });
  }
};
