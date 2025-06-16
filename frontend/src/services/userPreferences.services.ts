import axios from "axios";
import { API_URL } from "../config";

// Define the interface for user preferences
interface UserPreferences {
  selectedZone?: string;
  selectedDocumentBox?: string;
  userId?: string;
}

// Get user preferences
export const getUserPreferences = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/v1/user/preferences/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return {
      success: false,
      responseObject: null,
      message: "Failed to fetch user preferences"
    };
  }
};

// Update user preferences
export const updateUserPreferences = async (userId: string, preferences: Partial<UserPreferences>) => {
  try {
    const response = await axios.patch(`${API_URL}/v1/user/preferences/${userId}`, preferences);
    return response.data;
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return {
      success: false,
      message: "Failed to update user preferences"
    };
  }
};

// Export as a service object
export const userPreferencesService = {
  getUserPreferences,
  updateUserPreferences
};
