document.addEventListener("DOMContentLoaded", () => {
  const reviewForm = document.getElementById("review-form");
  const reviewsContainer = document.getElementById("reviews-container");
  const productFilter = document.getElementById("product-filter");
  const loggedInNavbar = document.getElementById("logged-in-navbar");
  const publicNavbar = document.getElementById("public-navbar");

  // Show the appropriate navbar based on the login status.
  const showNavbar = () => {
    const isLoggedIn = true; 
    if (isLoggedIn) {
      if (loggedInNavbar) loggedInNavbar.style.display = "flex";
      if (publicNavbar) publicNavbar.style.display = "none";
    } else {
      if (loggedInNavbar) loggedInNavbar.style.display = "none";
      if (publicNavbar) publicNavbar.style.display = "flex";
    }
  };

  // Fetch and display reviews with optional filtering
  const fetchReviews = async (productId = "All") => {
    try {
      const query = productId !== "All" ? `?productId=${productId}` : "";
      const response = await fetch(`/reviews${query}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const reviews = await response.json();
      reviewsContainer.innerHTML = ""; // Clear existing reviews

      reviews.forEach((review) => {
        const reviewItem = document.createElement("div");
        reviewItem.classList.add("review-item");

        reviewItem.innerHTML = `
          <p><strong>${review.username}</strong> (${review.rating}⭐️ / 5⭐️)</p>
          <p>${review.text}</p>
          <small>Product: ${review.product?.name || "Unknown"} (ID: ${review.productId})</small>
        `;
        reviewsContainer.appendChild(reviewItem);
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Populate the product filter dropdown
  const populateProductFilter = async () => {
    try {
      const response = await fetch("/reviews");
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }
  
      const reviews = await response.json();
  
      // Map product IDs to names and sort by product ID
      const productMap = reviews.reduce((acc, review) => {
        acc[review.productId] = review.product?.name || `Product ${review.productId}`;
        return acc;
      }, {});
  
      const sortedProductIds = Object.keys(productMap)
        .map((id) => parseInt(id, 10)) // Convert to integers
        .sort((a, b) => a - b); // Sort in ascending order
  
      productFilter.innerHTML = '<option value="All">All</option>'; // Reset dropdown
      sortedProductIds.forEach((productId) => {
        const option = document.createElement("option");
        option.value = productId;
        option.textContent = `${productMap[productId]} (ID: ${productId})`;
        productFilter.appendChild(option);
      });
    } catch (error) {
      console.error("Error populating product filter:", error);
      alert("An error occurred while populating the product filter.");
    }
  };

  // Handle filter change to fetch reviews for a specific product
  productFilter.addEventListener("change", (event) => {
    const selectedProductId = event.target.value;
    fetchReviews(selectedProductId); // Fetch reviews for the selected product
  });

  // Handle form submission for creating a review
  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const productId = parseInt(document.getElementById("product-id").value, 10);
    const rating = parseInt(document.getElementById("rating").value, 10);
    const text = document.getElementById("review-text").value.trim();
    const username = document.getElementById("username").value.trim();

    if (isNaN(productId) || isNaN(rating) || !text || !username || rating < 1 || rating > 5) {
      alert("Please fill in all fields correctly.");
      return;
    }

    try {
      const response = await fetch("/reviews/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, rating, text, username }),
      });

      if (response.ok) {
        alert("Review submitted!");
        fetchReviews(productFilter.value); // Refresh reviews with the current filter
        reviewForm.reset(); // Clear the form fields
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  });

    // Logout functionality
    const logoutLink = document.getElementById("logout-link");

    if (logoutLink) {
      logoutLink.addEventListener("click", function (event) {
        event.preventDefault();
  
        // Clear all authentication-related data from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
  
        // Show logout confirmation and redirect to login page
        alert("You have been logged out.");
        window.location.href = "/login.html";
      });
    }

  showNavbar();
  populateProductFilter(); 
  fetchReviews(); 
});
