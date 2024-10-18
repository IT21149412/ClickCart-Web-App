import React, { useState, useEffect } from "react";
import {
  getOrdersByVendor,
  updatePartialDeliveryStatus
} from "../../services/OrderService";
import "./VendorOrderManagement.scss";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const VendorOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let vendorId = null;

  if (token) {
    const decodedToken = jwtDecode(token);
    vendorId = decodedToken.nameid;
  }

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const fetchVendorOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrdersByVendor(vendorId);
      const vendorOrders = response.data;
      setOrders(vendorOrders);
      setLoading(false);
    } catch (error) {
      setError("Error fetching orders");
      setLoading(false);
    }
  };

  const handleMarkAsPartiallyDelivered = async (orderId) => {
    try {
      const response = await updatePartialDeliveryStatus(orderId, vendorId);
      setSuccessMessage(response);
      fetchVendorOrders();
    } catch (error) {
      setError("Failed to update the delivery status.");
    }
  };

  const handleCopy = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedOrderId(orderId);
      setTimeout(() => setCopiedOrderId(null), 2000);
    } catch (error) {
      console.error("Failed to copy order ID", error);
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>{error}</p>;

  const viewOrderDetails = (id) => {
    navigate(`/vendor/Order/${id}`);
  };

  return (
    <div className="vendor-order-management">
      <h1>Vendor Order Management</h1>

      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}

      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Vendor Items</th>
            <th>Actions</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                {order.id}
                <button
                  className="icon-button"
                  onClick={() => handleCopy(order.id)}
                  title="Copy Order ID"
                >
                  <i className="fa fa-copy"></i>
                </button>
                {copiedOrderId === order.id && (
                  <span className="copied-feedback">Copied!</span>
                )}
              </td>
              <td>{order.customerId}</td>
              <td>{order.orderStatus}</td>
              <td>
                {order.items && order.items.length > 0 ? (
                  <ul>
                    {order.items
                      .filter((item) => item.vendorId === vendorId)
                      .map((item) => (
                        <li key={item.productId}>{item.productName}</li>
                      ))}
                  </ul>
                ) : (
                  <div>No vendor items available</div>
                )}
              </td>
              <td>
                <button
                  className="btn-deliver"
                  onClick={() => handleMarkAsPartiallyDelivered(order.id)}
                  disabled={order.orderStatus === "PARTIALLY DELIVERED" || order.orderStatus === "DELIVERED"}
                >
                  Mark as Partially Delivered
                </button>
              </td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => viewOrderDetails(order.id)}
                >
                  <i className="fa fa-eye"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorOrderManagement;
