//service

import axios from 'axios';

const API_URL = 'http://localhost:5296/api/Order';

// Fetch all orders (possibly filtered by vendorId, depending on your API needs)
export const getOrders = async () => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // Adjust this based on the new API requirements
  return await axios.get(API_URL, config);  // Use the new GET /api/Order endpoint
};

// Fetch all orders by vendor ID
export const getOrdersByVendor = async (vendorId) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Adjust the endpoint to use the vendor-specific API
  return await axios.get(`${API_URL}/vendor/${vendorId}`, config);
};

// Fetch order details by ID
export const getOrderById = async (id) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return await axios.get(`${API_URL}/${id}`, config);  // This should remain the same
};

// Update order status (e.g., Delivered, Ready for Delivery, Cancelled, or Partially Delivered)

// Update order status (e.g., Delivered, Partially Delivered)
export const updatePartialDeliveryStatus = async (orderId, vendorId) => {
  const token = localStorage.getItem("token"); // Get the JWT token from localStorage

  try {
    const response = await axios.put(
      `${API_URL}/${orderId}/partially-delivered/${vendorId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}` // Add the token in the Authorization header
        }
      }
    );
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Error updating partial delivery status:', error);
    throw error; // Rethrow the error to be handled in the calling function
  }
};