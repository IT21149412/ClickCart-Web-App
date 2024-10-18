import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/OrderStatusService';
import './OrderStatusManagement.scss';

const OrderStatusManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null); // For modal order
  const [newStatus, setNewStatus] = useState(''); // Dropdown status
  const [note, setNote] = useState(''); // Note input
  const [activeFilter, setActiveFilter] = useState('all'); // For active button styling

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const response = await getAllOrders();
      setOrders(response.data);
      setFilteredOrders(response.data); // Default is to show all orders
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Handle order status change
  const handleStatusChange = async (orderId, role) => {
    if (!newStatus) {
      alert('Please select a status');
      return;
    }

    if (!note) {
      alert('Please enter a note');
      return;
    }

    // Format the note with role and date
    const formattedNote = `${note}`;

    try {
      await updateOrderStatus(orderId, newStatus, formattedNote);
      fetchOrders(); // Refresh after update
      alert('Order status updated successfully!');
      setSelectedOrder(null); // Close modal
      setNote(''); // Reset note
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Open modal to view order details
  const openModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus); // Initialize dropdown with current status
    setNote(order.note || ''); // Initialize with existing note or empty
  };

  // Close modal
  const closeModal = () => {
    setSelectedOrder(null);
    setNote(''); // Clear note input field when modal closes
  };

  // Handle search
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = orders.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.customerId.toLowerCase().includes(query)
    );
    setFilteredOrders(filtered);
  };

  // Filter for partially delivered orders
  const filterPartiallyDeliveredOrders = () => {
    setActiveFilter('partially-delivered');
    const filtered = orders.filter(order => order.orderStatus === 'PARTIALLY DELIVERED');
    setFilteredOrders(filtered);
  };

  // Show all orders
  const showAllOrders = () => {
    setActiveFilter('all');
    setFilteredOrders(orders); // Reset to show all orders
  };

  return (
    <div className="order-status-management">
      <h2>Order Status Management</h2>

      <input
        type="text"
        placeholder="Search by Order ID or Customer ID"
        value={searchQuery}
        onChange={handleSearch}
        className="search-bar"
      />

      {/* Filter buttons */}
      <div className="filter-buttons">
        <button
          onClick={showAllOrders}
          className={`btn-filter ${activeFilter === 'all' ? 'active-filter' : ''}`}
        >
          Show All Orders
        </button>
        <button
          onClick={filterPartiallyDeliveredOrders}
          className={`btn-filter ${activeFilter === 'partially-delivered' ? 'active-filter' : ''}`}
        >
          Partially Delivered Orders
        </button>
      </div>

      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Number of Items</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerId || 'N/A'}</td>
                <td>{order.items ? order.items.length : 0}</td>
                <td>${order.totalOrderPrice ? order.totalOrderPrice.toFixed(2) : '0.00'}</td>
                <td>{order.orderStatus}</td>
                <td>{order.note || 'N/A'}</td> {/* Displaying note */}
                <td>
                  <button className="btn-view-details" onClick={() => openModal(order)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for order details */}
      {selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-content">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> {selectedOrder.id}</p>
            <p><strong>Customer:</strong> {selectedOrder.customerId || 'N/A'}</p>
            <p><strong>Total Price:</strong> ${selectedOrder.totalOrderPrice ? selectedOrder.totalOrderPrice.toFixed(2) : '0.00'}</p>
            <p><strong>Status:</strong> {selectedOrder.orderStatus}</p>
            <p><strong>Note:</strong> {selectedOrder.note || 'No notes added'}</p>

            <h4>Items in Order:</h4>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Vendor Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.productName || 'N/A'}</td>
                    <td>{item.vendorName || 'N/A'}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${item.totalPrice.toFixed(2)}</td>
                    <td style={{ color: item.status === 'Delivered' ? 'green' : 'black' }}>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Dropdown to change status */}
            <label htmlFor="order-status">Change Status:</label>
            <select
              id="order-status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="PROCESSING">Processing</option>
              <option value="PARTIALLY DELIVERED">Partially Delivered</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Input field for note */}
            <label htmlFor="order-note">Add Note:</label>
            <textarea
              id="order-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter note about the status change..."
            />

            <div className="modal-actions">
              <button className="btn-update" onClick={() => handleStatusChange(selectedOrder.id, 'Admin/CSR')}>
                Update Status
              </button>
              <button className="btn-close" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusManagement;
