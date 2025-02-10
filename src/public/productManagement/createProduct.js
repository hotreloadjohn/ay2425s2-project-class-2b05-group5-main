document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const personId = localStorage.getItem("userId"); // Retrieve personId from localStorage

    const loggedInNavbar = document.getElementById("logged-in-navbar");
    const publicNavbar = document.getElementById("public-navbar");

    if (token && role === 'supplier') {
        loggedInNavbar.style.display = 'block';
        if (publicNavbar) publicNavbar.style.display = 'none';
    } else {
        loggedInNavbar.style.display = 'none';
        if (publicNavbar) publicNavbar.style.display = 'block';
        alert('You must be logged in as a supplier to access this page.');
        // window.location.href = '../';
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

    // Fetch supplier details
    async function getSupplierDetails(personId) {
        try {
            const response = await fetch(`/supplier/check/${personId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch supplier details');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching supplier details:', error.message);
            alert('An error occurred while fetching supplier details: ' + error.message);
        }
    }

    const form = document.getElementById('create-product-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const productData = {
            name: document.getElementById('product-name').value.trim(),
            unitPrice: parseFloat(document.getElementById('product-price').value),
            description: document.getElementById('product-description').value.trim(),
            stockQuantity: parseInt(document.getElementById('product-stock').value),
            country: document.getElementById('product-country').value.trim(),
            productType: document.getElementById('product-type').value.trim(),
        };

        try {
            const response = await fetch('/crProduct/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create product');
            }

            const result = await response.json();
            alert(result.message || 'Product created successfully!');
            form.reset();
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        }
    });
});
