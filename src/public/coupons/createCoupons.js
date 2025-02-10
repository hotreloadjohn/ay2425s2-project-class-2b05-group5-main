document.addEventListener('DOMContentLoaded', function () {
    console.log("Coupon Management Loaded");

    // Check if user is admin
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const loggedInNavbar = document.getElementById("logged-in-navbar");

    if (token && role === 'admin') {
        loggedInNavbar.style.display = 'block';
    } else {
        alert('You must be logged in as an admin to access this page.');
        window.location.href = '/login.html';  
        return;
    }

    // Logout functionality
    document.getElementById('logout-link').addEventListener('click', function (event) {
        event.preventDefault();
        localStorage.clear();
        alert('You have been logged out.');
        window.location.href = '/login.html';
    });

    // Show/hide duration in months field
    const durationSelect = document.getElementById('duration');
    const durationMonthsLabel = document.getElementById('durationMonthsLabel');
    const durationMonthsInput = document.getElementById('durationInMonths');

    durationSelect.addEventListener('change', function () {
        if (this.value === 'repeating') {
            durationMonthsLabel.style.display = 'block';
            durationMonthsInput.style.display = 'block';
            durationMonthsInput.setAttribute('required', 'true');
        } else {
            durationMonthsLabel.style.display = 'none';
            durationMonthsInput.style.display = 'none';
            durationMonthsInput.removeAttribute('required');
        }
    });

    // Create Coupon
    const createVoucherForm = document.getElementById('createVoucherForm');
    if (createVoucherForm) {
        createVoucherForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const discount = parseFloat(document.getElementById('discount').value);
            const discountType = document.getElementById('discountType').value;
            const duration = document.getElementById('duration').value;
            const durationInMonths = duration === 'repeating' ? parseInt(document.getElementById('durationInMonths').value) : null;

            if (isNaN(discount) || discount <= 0) {
                alert('Please enter a valid discount amount.');
                return;
            }

            fetch("/coupons/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, discount, discountType, duration, durationInMonths }),
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message || "Coupon created successfully!");
                createVoucherForm.reset();
            })
            .catch(error => {
                console.error("Error:", error);
                alert('Error creating coupon');
            });
        });
    }
});
