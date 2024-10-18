import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrdersByVendor } from '../../services/OrderService'; // Order service
import { getProductsByVendor } from '../../services/ProductService'; // Product service
import { getUserById } from '../../services/UserService'; // User service to fetch vendor details
import './VendorDashboard.scss';
import {jwtDecode} from "jwt-decode"; // Import jwtDecode

const VendorDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendorName, setVendorName] = useState(''); // State for vendor's name
  const [totalProducts, setTotalProducts] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [outOfStockItems, setOutOfStockItems] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  // Retrieve vendorId from the JWT token
  const token = localStorage.getItem("token");
  let vendorId = null;

  if (token) {
    const decodedToken = jwtDecode(token);
    vendorId = decodedToken.nameid; // Assuming nameid contains the vendor ID
  }

  useEffect(() => {
    fetchVendorData();
    fetchVendorDetails(); // Fetch vendor details when the component is loaded
  }, []);

  // Fetch vendor details (including name)
  const fetchVendorDetails = async () => {
    try {
      const response = await getUserById(vendorId); // Fetch vendor details by ID
      const vendorData = response.data;
      setVendorName(vendorData.name); // Set vendor's name
    } catch (error) {
      console.error('Error fetching vendor details:', error);
    }
  };

  const fetchVendorData = async () => {
    await fetchVendorOrders();
    await fetchVendorProducts();
  };

  // Fetch vendor orders
  const fetchVendorOrders = async () => {
    try {
      const response = await getOrdersByVendor(vendorId); // Fetch orders for the specific vendor
      const vendorOrders = response.data;
      setOrders(vendorOrders);

      // Calculate dashboard stats for orders, filtering items based on vendorId
      calculateOrderStats(vendorOrders);
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
    }
  };

  // Fetch vendor products
  const fetchVendorProducts = async () => {
    try {
      const response = await getProductsByVendor(vendorId); // Fetch products for the specific vendor
      const vendorProducts = response.data;
      setProducts(vendorProducts);

      // Calculate dashboard stats for products
      calculateProductStats(vendorProducts);
    } catch (error) {
      console.error('Error fetching vendor products:', error);
    }
  };

  const calculateOrderStats = (orders) => {
    let totalProductsCount = 0;
    let pendingOrdersCount = 0;
    let totalSalesAmount = 0;

    orders.forEach(order => {
      // Filter items to only include those belonging to the current vendor
      const vendorItems = order.items.filter(item => item.vendorId === vendorId);

      vendorItems.forEach(item => {
        totalProductsCount += item.quantity; // Total products for the vendor
        totalSalesAmount += item.totalPrice; // Total sales for the vendor
      });

      // If the order contains items for this vendor and the status is PURCHASED, count it as a pending order
      if (vendorItems.length > 0 && order.orderStatus === 'PURCHASED') {
        pendingOrdersCount++;
      }
    });

    setTotalProducts(totalProductsCount);
    setPendingOrders(pendingOrdersCount);
    setTotalSales(totalSalesAmount.toFixed(2)); // Keep 2 decimal places
  };

  const calculateProductStats = (products) => {
    const lowStockItems = products.filter(product => product.isLowStock); // Get products that are low in stock
    setOutOfStockItems(lowStockItems.length); // Set low stock items count
  };

  return (
    <div className="vendor-dashboard">
      {/* Display vendor's name */}
      

      {/* Main Content */}
      <div>
      <h1>Hi, {vendorName}! Welcome to your Vendor Dashboard</h1>
        <h2>Overview</h2>

        {/* Overview Cards */}
        <div className="dashboard-cards">
          <div className="card">
            <h3>Total Products</h3>
            <p>{totalProducts}</p>
          </div>
          <div className="card">
            <h3>Pending Orders</h3>
            <p>{pendingOrders}</p>
          </div>
          <div className="card">
            <h3>Out of Stock Items</h3>
            <p>{outOfStockItems}</p>
          </div>
          <div className="card">
            <h3>Total Sales</h3>
            <p>${totalSales}</p>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="recent-activities">
          <h2>Recent Activities</h2>
          <ul>
            {orders.map((order, index) => (
              <li key={index}>Order #{order.id} was placed by Customer {order.customerId}.</li>
            ))}
          </ul>
        </div>

        {/* Quick Links Section */}
        <div className="quick-links">
          <h2>Quick Links</h2>
          <div className="links">
            <Link to="/vendor/products" className="btn">Manage Products</Link>
            <Link to="/vendor/orders" className="btn">Manage Orders</Link>
            <Link to="/vendor/inventory" className="btn">Customer Reviews</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
