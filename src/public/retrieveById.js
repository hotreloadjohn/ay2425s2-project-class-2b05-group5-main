document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem("token"); 
    const role = localStorage.getItem("role");  
    const loggedInNavbar = document.getElementById("logged-in-navbar");
    const publicNavbar = document.getElementById("public-navbar");

    if (token && role === 'user') {
        loggedInNavbar.style.display = 'block';
        publicNavbar.style.display = 'none';
        
    } else {
        loggedInNavbar.style.display = 'none';
        publicNavbar.style.display = 'block';
    }

    // Get the product ID from localStorage
    const productId = localStorage.getItem("productId");

    // Function to fetch product details using the ID
    function fetchProductDetails(productId) {
        fetch(`/products/id/${productId}`)  // Backend API endpoint
            .then(response => response.json())
            .then(product => {
                renderProductDetails(product);
            })
            .catch(error => {
                console.error("Error fetching product details:", error);
            });
    }

    // Function to render product details in the page
    function renderProductDetails(product) {
        const productContainer = document.getElementById("product-details-container");

        if (product) {
            productContainer.innerHTML = `
                <h1>${product.name}</h1>
                <img src="${product.imageUrl}" alt="${product.name}" />
                <p><strong>Description:</strong> ${product.description}</p>
                <p><strong>Manufactured Country:</strong> ${product.country}</p>
                <p><strong>Product Type:</strong> ${product.productType}</p>
                <p><strong>Price:</strong> $${product.unitPrice}</p>
            `;

            // Check if the user is authenticated and has the role of 'user'
            if (token && role === 'user') {
                const buttonHTML = `
                    <button id="add-to-cart">Add to Cart</button>
                `;
                productContainer.innerHTML += buttonHTML;

                const addToCartButton = document.getElementById("add-to-cart");
                if (addToCartButton) {
                    addToCartButton.addEventListener('click', function () {
                        localStorage.setItem("cartProductId", product.id);
                        const productId = product.id; // Get the product ID from the product object
                        const personId = parseInt(localStorage.getItem("userId"), 10);

                    
                        if (!personId) {
                            alert("Please log in to add items to your cart.");
                            return;
                        }
                    
                        const requestBody = {
                            personId: personId,
                            productId: productId,
                            quantity: 1 // Default quantity
                        };
                    
                        fetch('/carts/create', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify(requestBody)
                        })
                            .then(response => {
                                if (response.ok) {
                                    alert("Product added to cart successfully!");
                                    window.location.href = "/cart/cart.html";
                                    
                                } else {
                                    return response.json().then(data => {
                                        throw new Error(data.message || 'Failed to add product to cart.');
                                    });
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                alert("An error occurred while adding the product to the cart.");
                            });
                    });
                }
            }
        } else {
            productContainer.innerHTML = `<p>Product not found.</p>`;
        }
    }

    // Clear the productId from localStorage when the user navigates away (for logged-in and public users)
    const productLink = document.getElementById("product-link");
    productLink.addEventListener('click', function () {
        localStorage.removeItem("productId");
    });

    fetchProductDetails(productId);

    // Also, clear productId when navigating to other pages (like cart or profile pages)
    const cartLink = document.getElementById("cart-link");
    cartLink.addEventListener('click', function () {
        localStorage.removeItem("productId");
    });

    const profileLink = document.getElementById("profile-link");
    profileLink.addEventListener('click', function () {
        localStorage.removeItem("productId");
    });

    // For public users (who are not logged in), also clear productId on navigation
    const loginLink = document.getElementById("login-link");
    const registerLink = document.getElementById("register-link");

    loginLink.addEventListener('click', function () {
        localStorage.removeItem("productId");
    });

    registerLink.addEventListener('click', function () {
        localStorage.removeItem("productId");
    });

    const logoutLink = document.getElementById("logout-link"); // Logout button
    // Logout functionality
    if (logoutLink) {
        logoutLink.addEventListener("click", function () {
            localStorage.clear(); // Clear localStorage
            window.location.href = "index.html"; // Redirect to the public index page
        });
    }
});
