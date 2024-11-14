import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

export const fetchData = async (endpoint) => {
  try {
    const response = await axios.get(`${endpoint}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};