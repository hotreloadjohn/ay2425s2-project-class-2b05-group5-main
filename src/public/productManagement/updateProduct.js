document.addEventListener("DOMContentLoaded", async () => {

    // Get user ID and role from localStorage
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Get navbar elements
    const loggedInNavbar = document.getElementById("logged-in-navbar");
    const publicNavbar = document.getElementById("public-navbar");

    // Check if the user is logged in and is an admin
    if (token && role === 'supplier') {
        loggedInNavbar.style.display = 'block';
        if (publicNavbar) publicNavbar.style.display = 'none';
    } else {
        loggedInNavbar.style.display = 'none';
        if (publicNavbar) publicNavbar.style.display = 'block';
        alert('You must be logged in as an admin to access this page.');
        window.location.href = '../';  // Redirect to login page
        return;
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


    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("productId");
    if (!productId) {
        alert("Product ID is missing!");
        return;
    }

    const fetchProductDetails = async () => {
        try {
            const response = await fetch(`/crProduct/getById/${productId}`);
            if (!response.ok) throw new Error("Failed to fetch product details.");
            const product = await response.json();

            // Populate the form with product details
            document.querySelector("#name").value = product.name;
            document.querySelector("#description").value = product.description;
            document.querySelector("#unitPrice").value = product.unitPrice;
            document.querySelector("#country").value = product.country;
            document.querySelector("#productType").value = product.productType;
        } catch (error) {
            console.error(error.message);
            alert("Error fetching product details.");
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        const updatedProduct = {
            name: document.querySelector("#name").value,
            description: document.querySelector("#description").value,
            unitPrice: parseFloat(document.querySelector("#unitPrice").value),
            country: document.querySelector("#country").value,
            productType: document.querySelector("#productType").value,
        };

        try {
            const response = await fetch(`/crProduct/update/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProduct),
            });

            if (!response.ok) throw new Error("Failed to update product.");
            alert("Product updated successfully!");
            window.location.href = "productManagement.html"; // Redirect back to product management
        } catch (error) {
            console.error(error.message);
            alert("Error updating product.");
        }
    };

    // Fetch product details and populate the form
    await fetchProductDetails();

    // Attach form submission handler
    document.querySelector("#update-form").addEventListener("submit", handleFormSubmit);
});
