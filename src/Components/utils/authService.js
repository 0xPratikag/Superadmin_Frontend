// src/utils/authService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_LOGIN_URL;

export const loginUser = async (email, password, role) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};
