import React, { useEffect, useState } from "react";
import {
  getVendorReviewsById,
  getUsers,
  getAverageRating, // Import the function to fetch average rating
} from "../../services/VendorReviewService";
import {jwtDecode} from "jwt-decode";
import { FaStar } from "react-icons/fa";

const VendorReviews = () => {
  const [reviews, setReviews] = useState([]); // Reviews state
  const [averageRating, setAverageRating] = useState(null); // Average rating state
  const [loading, setLoading] = useState(true);

  // Retrieve vendorId from the JWT token
  const token = localStorage.getItem("token");
  let vendorId = null;

  if (token) {
    const decodedToken = jwtDecode(token);
    vendorId = decodedToken.nameid; // Assuming nameid contains the vendor ID
  }

  useEffect(() => {
    // Fetch vendor reviews and average rating on component mount
    const fetchData = async () => {
      if (vendorId) {
        try {
          const reviewsResponse = await getVendorReviewsById(vendorId);
          setReviews(reviewsResponse.data); // Set the reviews data

          const averageRatingResponse = await getAverageRating(vendorId); // Fetch average rating
          setAverageRating(averageRatingResponse.data.averageRating); // Set the average rating
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [vendorId]);

  const renderStars = (rating) => {
    // Helper function to display star icons
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        color={index < rating ? "#ffc107" : "#e4e5e9"}
        size={20}
      />
    ));
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="vendor-reviews">
      <h1>Vendor Reviews</h1>

      {averageRating && (
        <div className="average-rating">
          <h2>Average Rating</h2>
          <div className="stars">{renderStars(Math.round(averageRating))}</div>
          <p>{averageRating.toFixed(1)} / 5</p>
        </div>
      )}

      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-details">
              <h2>Review ID: {review.id}</h2>
              <p><strong>Comment:</strong> {review.comment}</p>
              <p><strong>Customer ID:</strong> {review.customerId}</p>
              <p><strong>Date:</strong> {new Date(review.createdAt).toLocaleString()}</p>
            </div>
            <div className="review-rating">
              <h3>Rating: {renderStars(review.rating)}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorReviews;
