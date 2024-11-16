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

export const fetchDataTesting = async (endpoint) => {
  try {
    console.log(endpoint);
    const response = await axios.get(`${endpoint}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const postData = async (endpoint, data) => {
  try {
    const response = await axios.post(`${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};

export const putData = async (endpoint, data) => {
  try {
    const response = await axios.put(`${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
};
y