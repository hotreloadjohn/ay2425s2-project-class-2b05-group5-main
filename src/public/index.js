document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwt_decode(token) : null; // Decode the JWT if token exists

    if (decodedToken) {
        localStorage.setItem("role", decodedToken.role);
        localStorage.setItem("userId", decodedToken.id);
    }

    const role = localStorage.getItem("role") || ''; // Default to empty if no role
    const userId = localStorage.getItem("userId") || ''; // Default to empty if no userId
    const wishlistKey = `wishlist_${userId}`; 

    const loggedInNavbar = document.getElementById("logged-in-navbar");
    const publicNavbar = document.getElementById("public-navbar");
    const logoutLink = document.getElementById("logout-link"); // Logout button

    const searchBox = document.querySelector(".search-box");
    const searchButton = document.querySelector(".search-btn");
    const filterButton = document.querySelector(".filter-btn");
    const filterPopup = document.querySelector("#filter-popup");
    const closePopupButton = document.querySelector("#close-popup");
    const applyFilterButton = document.querySelector(".apply-filter");

    let currentSearchTerm = '';

    // Check if user is logged in and their role
    if (token && role === 'user') {
        loggedInNavbar.style.display = 'block'; // Show logged-in navbar
        publicNavbar.style.display = 'none';   // Hide public navbar
    } else {
        loggedInNavbar.style.display = 'none'; // Hide logged-in navbar
        publicNavbar.style.display = 'block'; // Show public navbar
    }

    // Logout functionality
    if (logoutLink) {
        logoutLink.addEventListener("click", function () {
            localStorage.clear(); // Clear localStorage
            window.location.href = "index.html"; // Redirect to the public index page
        });
    }

    // Fetch and render products
    function fetchProducts(searchTerm = '', sortOrder = '') {
        let url = searchTerm ? `/products/${searchTerm}` : '/products';
        if (sortOrder) url += `?sort=${sortOrder}`;

        fetch(url, {
            headers: {
                Authorization: `Bearer ${token || ''}`,
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                return response.json();
            })
            .then(products => {
                const selectedSort = document.querySelector('input[name="sort"]:checked');
                if (selectedSort) {
                    const sortValue = parseInt(selectedSort.value);
                    if (sortValue === 1) {
                        products.sort((a, b) => a.unitPrice - b.unitPrice);
                    } else if (sortValue === 2) {
                        products.sort((a, b) => b.unitPrice - a.unitPrice);
                    }
                }

                renderProducts(products);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    }

    function renderProducts(products) {
        const productContainer = document.querySelector("#product-container");
        const searchResultCount = document.getElementById("search-result-count");
        productContainer.innerHTML = ''; // Clear container before adding new products
        const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || []; // Get wishlist from local storage

        if (currentSearchTerm) {
            const itemCount = products.length;
            searchResultCount.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''} found`;
            searchResultCount.style.display = 'block';
        } else {
            searchResultCount.style.display = 'none';
        }

        if (products.length === 0) {
            const noProductsMessage = document.createElement("p");
            noProductsMessage.textContent = "No products found.";
            productContainer.appendChild(noProductsMessage);
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");

            const image = document.createElement("img");
            image.src = product.imageUrl;
            image.alt = product.name;
            image.classList.add("product-image");

            const productName = document.createElement("h3");
            productName.textContent = product.name;

            const productPrice = document.createElement("p");
            productPrice.textContent = `$${product.unitPrice}`;
            productPrice.classList.add("product-price");

            // "View Details" button
            const viewButton = document.createElement("button");
            viewButton.textContent = "View Details";
            viewButton.classList.add("view-button");
            viewButton.addEventListener('click', function () {
                localStorage.setItem("productId", product.id);
                window.location.href = `retrieveById.html`;
            });

            // "Add to Cart" button
            const addToCartButton = document.createElement("button");
            addToCartButton.textContent = "Add to Cart";
            addToCartButton.classList.add("add-to-cart-button");

            if (token && role === 'user') {
                addToCartButton.addEventListener('click', function () {
                    const productId = product.id;
                    const personId = parseInt(userId, 10);

                    if (!personId) {
                        alert("Please log in to add items to your cart.");
                        return;
                    }

                    const requestBody = {
                        personId: personId,
                        productId: productId,
                        quantity: 1
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
            } else {
                addToCartButton.style.display = 'none';
            }

            // "Add to Wishlist" button
            const addToWishlistButton = document.createElement("button");
            addToWishlistButton.textContent = "Add to Wishlist";
            addToWishlistButton.classList.add("add-to-wishlist-button");

            if (wishlist.includes(product.id)) {
                addToWishlistButton.textContent = "Added to Wishlist";
                addToWishlistButton.disabled = true;
                addToWishlistButton.style.backgroundColor = "#bdbdbd";
                addToWishlistButton.style.cursor = "not-allowed";
            }

            if (token && role === 'user') {
                addToWishlistButton.addEventListener('click', function () {
                    const productId = product.id;
                    const personId = parseInt(userId, 10);

                    if (!personId) {
                        alert("Please log in to add items to your wishlist.");
                        return;
                    }

                    const requestBody = {
                        personId: personId,
                        productId: productId
                    };

                    fetch('/wishlist/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify(requestBody)
                    })
                        .then(response => {
                            if (response.ok) {
                                alert("Product added to wishlist successfully!");
                                wishlist.push(productId);
                                localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
                                
                                addToWishlistButton.textContent = "Added to Wishlist";
                                addToWishlistButton.disabled = true;
                                addToWishlistButton.style.backgroundColor = "grey";
                                // addToWishlistButton.style.cursor = "not-allowed";

                            } else {
                                return response.json().then(data => {
                                    throw new Error(data.message || 'Failed to add product to wishlist.');
                                });
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert("An error occurred while adding the product to the wishlist.");
                        });
                });
            } else {
                addToWishlistButton.style.display = 'none';
            }

            // Append elements to the product card
            productCard.appendChild(image);
            productCard.appendChild(productName);
            productCard.appendChild(productPrice);
            productCard.appendChild(viewButton);

            if (addToCartButton.style.display !== 'none') {
                productCard.appendChild(addToCartButton);
            }
            if (addToWishlistButton.style.display !== 'none') {
                productCard.appendChild(addToWishlistButton);
            }

            productContainer.appendChild(productCard);
        });
    }

    // Search functionality
    searchButton.addEventListener('click', function () {
        currentSearchTerm = searchBox.value.trim();
        fetchProducts(currentSearchTerm);
    });

    searchBox.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            currentSearchTerm = searchBox.value.trim();
            fetchProducts(currentSearchTerm);
        }
    });

    // Filter functionality
    filterButton.addEventListener('click', function () {
        filterPopup.style.display = 'block';
        document.body.classList.add("popup-open");
    });

    closePopupButton.addEventListener('click', function () {
        filterPopup.style.display = 'none';
        document.body.classList.remove("popup-open");
    });

    applyFilterButton.addEventListener('click', function () {
        const selectedSort = document.querySelector('input[name="sort"]:checked');
        const sortOrder = selectedSort ? selectedSort.value : '';
        fetchProducts(currentSearchTerm, sortOrder);
        filterPopup.style.display = 'none';
        document.body.classList.remove("popup-open");
    });

    // Initially, load all products
    fetchProducts();
});
