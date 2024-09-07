import axios from 'axios';

export const createCommunity = async (formData, token) => {
  console.log('createCommunity called with formData:', Object.fromEntries(formData), 'and token:', token);
  try {
    const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/community`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in createCommunity:', error);
    console.log('Response data:', error.response?.data);
    console.log('Response status:', error.response?.status);
    console.log('Response headers:', error.response?.headers);
    throw error;
  }
};