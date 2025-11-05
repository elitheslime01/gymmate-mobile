import { create } from "zustand";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const useFeedbackStore = create((set) => ({
  isSubmitting: false,
  error: null,
  submitFeedback: async ({ studentId, category, subcategory, message, attachments }) => {
    set({ isSubmitting: true, error: null });

    try {
      const formData = new FormData();

      if (studentId) {
        formData.append("studentId", studentId);
      }

      formData.append("category", category);
      formData.append("subcategory", subcategory);
      formData.append("message", message);

      (attachments || []).forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to submit feedback.");
      }

      set({ isSubmitting: false });
      return { success: true, data: data.data };
    } catch (error) {
      console.error("Error submitting feedback:", error);
      set({ isSubmitting: false, error: error.message });
      return { success: false, message: error.message };
    }
  },
}));

export default useFeedbackStore;
