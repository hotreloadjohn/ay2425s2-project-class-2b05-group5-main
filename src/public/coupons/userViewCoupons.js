document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript Loaded, fetching vouchers...");
    // Get user ID and role from localStorage
    const personId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    // Get navbar elements
    const loggedInNavbar = document.getElementById("logged-in-navbar");
    const publicNavbar = document.getElementById("public-navbar");

    // Display navbar based on login status
    if (role === 'user') {
        loggedInNavbar.style.display = 'block';
        publicNavbar.style.display = 'none';
        fetchVouchers();
    } else {
        loggedInNavbar.style.display = 'none';
        publicNavbar.style.display = 'block';
        alert('You must be logged in to access this page.');
        window.location.href = '/login.html'; // Redirect to login if not logged in
    }
    document.getElementById('logout-link').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior

        // Clear localStorage and redirect to login page
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        alert('You have been logged out.');
        window.location.href = '/login.html';
    });
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
            <div class="voucher-code">
                <span>ID: <span id="stripeId-${coupon.stripeId}">${coupon.stripeId}</span></span>
                <button class="copy-btn" onclick="copyStripeId('${coupon.stripeId}')">Copy</button>
            </div>
            <div class="voucher-description">Name: ${coupon.name}</div>
            <div class="voucher-description">Duration: ${coupon.duration || "N/A"}</div>
            <div class="voucher-discount">
                ${
                    coupon.percentOff
                        ? `${coupon.percentOff}% Off`
                        : coupon.amountOff
                        ? `S$${coupon.amountOff} SGD Off`
                        : "N/A"
                }
            </div>
        `;

        container.appendChild(card);
    });
}

// Copy function for Stripe ID
function copyStripeId(stripeId) {
    const textToCopy = document.getElementById(`stripeId-${stripeId}`).textContent;
    navigator.clipboard.writeText(textToCopy)
        .then(() => alert("Copied: " + textToCopy))
        .catch(err => console.error("Failed to copy text: ", err));
}
