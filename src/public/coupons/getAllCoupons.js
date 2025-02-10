document.addEventListener("DOMContentLoaded", function () {
  console.log("JavaScript Loaded, fetching vouchers...");

  // Get user token and role from localStorage
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Get navbar elements
  const loggedInNavbar = document.getElementById("logged-in-navbar");

  // Check if user is logged in as an admin
  if (token && role === "admin") {
    loggedInNavbar.style.display = "block";
  } else {
    alert("You must be logged in as an admin to access this page.");
    window.location.href = "/login.html";
    return;
  }

  // Logout functionality
  document
    .getElementById("logout-link")
    .addEventListener("click", function (event) {
      event.preventDefault();
      localStorage.clear();
      alert("You have been logged out.");
      window.location.href = "/login.html";
    });

  // Fetch vouchers from backend
  fetchVouchers();
});

// Fetch and display all vouchers
function fetchVouchers() {
  fetch("/coupons/getAll")
    .then((response) => response.json())
    .then((data) => {
      console.log("Coupons received:", data);
      displayVouchers(data);
    })
    .catch((error) => {
      console.error("Error fetching Coupons:", error);
      document.getElementById("couponsContainer").innerHTML =
        "<p>Failed to load coupons.</p>";
    });
}

// Display vouchers in the container
function displayVouchers(Coupons) {
  const container = document.getElementById("couponsContainer");
  container.innerHTML = ""; // Clear existing content

  if (!Coupons.length) {
    container.innerHTML = "<p>No coupons available.</p>";
    return;
  }

  Coupons.forEach((coupon) => {
    const card = document.createElement("div");
    card.classList.add("coupon-card");

    // Use default image if picture is missing
    const imgSrc = "../images/voucher.png";

    card.innerHTML = `
            <img src="${imgSrc}" alt="Voucher Image" class="voucher-image">
            <div class="voucher-code">ID: ${coupon.stripeId}</div>
            <div class="voucher-description">Name: ${coupon.name}</div>
            <div class="voucher-duration">Duration: ${
              coupon.duration || "N/A"
            }</div>
        <div class="voucher-discount">
  ${
    coupon.percentOff
      ? `${coupon.percentOff}% Off`
      : coupon.amountOff
      ? `S$${coupon.amountOff} SGD Off`
      : "N/A"
  }
</div>

            <div class="button-group">
                <button class="delete-btn" onclick="confirmDelete('${
                  coupon.stripeId
                }')">Delete</button>
            </div>
        `;

    container.appendChild(card);
  });
}

// Confirm before deleting a voucher
function confirmDelete(couponId) {
  if (confirm(`Are you sure you want to delete Coupon ID: "${couponId}"?`)) {
    deleteVoucher(couponId);
  }
}

// Delete the voucher
function deleteVoucher(couponId) {
  fetch(`/coupons/delete/${couponId}`, { method: "DELETE" })
    .then((response) => response.json())
    .then((result) => {
      alert(`Coupon ID: "${couponId}" deleted successfully.`);
      fetchVouchers(); // Refresh the vouchers
    })
    .catch((error) => {
      console.error("Error deleting Coupon:", error);
      alert("Failed to delete the Coupon.");
    });
}