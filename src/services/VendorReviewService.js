import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Fetch all vendor reviews
export const getVendorReviews = async () => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return await axios.get(`${API_URL}/api/vendor-review`, config);
};

// Fetch average rating by vendor ID
export const getAverageRating = async (vendorId) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return await axios.get(`${API_URL}/api/vendor-review/${vendorId}/average-rating`, config);
};

export const getVendorReviewsById = async (vendorId) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

    // Adjust the endpoint to use the vendor-specific API
    return await axios.get(`${API_URL}/api/vendor-review/${vendorId}`, config);
  };

// Fetch all users (to get vendor names)
export const getUsers = async () => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return await axios.get(`${API_URL}/api/user`, config);
};
