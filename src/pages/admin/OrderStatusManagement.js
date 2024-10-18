import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, createOrder } from '../../services/OrderStatusService';
import { getProducts } from '../../services/ProductService'; // For fetching products
import './OrderStatusManagement.scss';

const OrderStatusManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null); // For modal order
  const [newStatus, setNewStatus] = useState(''); // Dropdown status
  const [note, setNote] = useState(''); // Note input
  const [activeFilter, setActiveFilter] = useState('all'); // For active button styling

  const [showCreateModal, setShowCreateModal] = useState(false); // For creating an order
  const [products, setProducts] = useState([]); // All products fetched
  const [productSearchResults, setProductSearchResults] = useState([]); // Filtered search results
  const [selectedProducts, setSelectedProducts] = useState([]); // Products added to the order
  const [customerId, setCustomerId] = useState(''); // Customer ID input
  const [address, setAddress] = useState(''); // Address input

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

  // Fetch products for search
  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
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

  // Search products dynamically
  const handleProductSearch = (event) => {
    const query = event.target.value.toLowerCase();
    if (query) {
      const results = products.filter(product =>
        product.name.toLowerCase().includes(query)
      );
      setProductSearchResults(results.length > 0 ? results : [{ id: 'no-results', name: 'No results found' }]);
    } else {
      setProductSearchResults([]);
    }
  };

  // Add product to order
  const addProductToOrder = (product) => {
    if (product.id === 'no-results') return; // Prevent adding 'No results found'
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (!existingProduct) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
    setProductSearchResults([]); // Clear the search results after adding a product
  };

  // Update product quantity
  const updateProductQuantity = (productId, delta) => {
    setSelectedProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, quantity: Math.max(1, product.quantity + delta) }
          : product
      )
    );
  };

  // Function to remove a product from the selected products list
  const removeProductFromOrder = (productId) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId)
    );
  };


  // Create order
  const handleCreateOrder = async () => {
    if (!customerId || !address || selectedProducts.length === 0) {
      alert('Please fill in all fields and add at least one product.');
      return;
    }

    const orderData = {
      customerId,
      address,
      items: selectedProducts.map(product => ({
        productId: product.id,
        productName: product.name,
        quantity: product.quantity,
        price: product.price,
        totalPrice: product.price * product.quantity,
        vendorId: product.vendorId,
        vendorName: product.vendorName
      })),
      totalOrderPrice: selectedProducts.reduce((total, product) => total + product.price * product.quantity, 0),
      orderStatus: 'PURCHASED',
      note: ''
    };

    try {
      await createOrder(orderData);
      alert('Order created successfully!');
      setShowCreateModal(false);
      setSelectedProducts([]);
      setCustomerId('');
      setAddress('');
    } catch (error) {
      console.error('Error creating order:', error);
    }
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
        <button
          onClick={() => {
            setShowCreateModal(true);
            fetchProducts(); // Fetch products when opening the modal
          }}
          className="btn-create-order"
        >
          Create Order
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

      {/* Modal for creating an order */}
      {showCreateModal && (
        <div className="order-details-modal">
          <div className="modal-content">
            <h3>Create New Order</h3>

            <div className="form-group">
              <label htmlFor="customer-id">Customer ID</label>
              <input
                type="text"
                id="customer-id"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="form-input"
                placeholder="Enter customer ID"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-input"
                placeholder="Enter shipping address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-search">Search Product</label>
              <input
                type="text"
                id="product-search"
                className="form-input"
                placeholder="Type to search for products"
                onChange={handleProductSearch}
              />
              {productSearchResults.length > 0 && (
                <ul className="product-search-results">
                  {productSearchResults.map(product => (
                    <li key={product.id} onClick={() => addProductToOrder(product)}>
                      {product.name} - ${product.price}
                    </li>
                  ))}
                </ul>
              )}
              {productSearchResults.length === 0 && searchQuery !== "" && (
                <div className="no-results">No products found</div>
              )}
            </div>

            {/* Selected products list */}
            <h4>Selected Products</h4>
            <div className="selected-products-container">
              <ul className="selected-products-list">
                {selectedProducts.map((product) => (
                  <li key={product.id} className="selected-product-item">
                    <span>{product.name} - ${product.price}</span>
                    <div className="product-quantity">
                      <button onClick={() => updateProductQuantity(product.id, -1)} disabled={product.quantity <= 1}>-</button>
                      <span>{product.quantity}</span>
                      <button onClick={() => updateProductQuantity(product.id, 1)}>+</button>
                    </div>
                    <button onClick={() => removeProductFromOrder(product.id)} className="btn-remove">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="form-group buttons-container">
              <button onClick={handleCreateOrder} className="btn-create">
                Create Order
              </button>
              <button onClick={() => setShowCreateModal(false)} className="btn-close">
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
