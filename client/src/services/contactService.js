import api from "./api";

/**
 * POST /api/contact
 * Backend validates, stores the message in MongoDB, and emails the
 * FoodSaver AI admin address — see server/controllers/contactController.js.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function submitContactForm(payload) {
  const response = await api.post("/contact", payload);
  return response.data;
}

export default { submitContactForm };
