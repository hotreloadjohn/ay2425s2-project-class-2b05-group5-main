document.addEventListener('DOMContentLoaded', () => {
    const wishlistTable = document.getElementById('wishlist-items');
    const checkoutButton = document.getElementById('checkout-btn');
    const totalSelectedElement = document.getElementById('selected-items-count');
    const userId = parseInt(localStorage.getItem("userId"), 10);
    const priceDropList = document.getElementById('price-drop-list'); 
    const sortDropdown = document.getElementById('sort-month'); 
    const priceDropBanner = document.getElementById('priceDropBanner'); 
    const wishlistKey = `wishlist_${userId}`; 
    const navbar = document.getElementById('logged-in-navbar');
    let selectedProductIds = new Set();

    if (!userId) {
        alert('Please log in to view your wishlist');
        window.location.href = '../login.html';
        return;
    } else {
        navbar.style.display = 'block';
    }

    // Fetch wishlist data for the logged-in user
    async function fetchWishlistData() {
        try {
            const response = await fetch(`/wishlist/${userId}`);
            const data = await response.json();

            if (data.error) {
                alert(data.error);
                return;
            }

            // Populate wishlist items
            wishlistTable.innerHTML = '';
            selectedProductIds.clear();

            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="select-product" data-id="${item.productId}"></td>
                    <td>${item.name}</td>
                    <td>$${item.currentPrice}</td>
                    <td>${item.lastKnownPrice ? `$${item.lastKnownPrice}` : '-'}</td>
                    <td>${(item.currentPrice - (item.lastKnownPrice || 0)).toFixed(2)}</td>
                    <td>${item.isInStock ? 'In Stock' : 'Out of Stock'}</td>
                    <td><button class="delete" data-id="${item.productId}" style="background-color: #ff3333; color: #ffffff;">Delete</button></td>
                `;
                wishlistTable.appendChild(row);
            });

            updateTotalSelectedCount();
        } catch (error) {
            console.error('Error fetching wishlist data:', error);
            alert('Failed to load wishlist data. Please try again later.');
        }
    }

    // Fetch Price Drop Notifications
    // async function fetchPriceDropNotifications() {
    //     try {
    //         const response = await fetch(`/wishlist/notify/${userId}`);
    //         const data = await response.json();

    //         console.log('Price Drop Data:', data);

    //         if (data.length > 0) {
    //             const priceDropDetails = data.map(notification => `
    //                 <li>
    //                     ${notification.name}: 
    //                     <span style="color: green;">$${notification.priceDifference}</span>
    //                     (Old: $${notification.oldPrice}, New: $${notification.newPrice})
    //                 </li>
    //             `).join('');

    //             // Update the price drop list
    //             priceDropList.innerHTML = priceDropDetails;

    //             // Update the banner
    //             priceDropBanner.innerHTML = 'Price Drops Detected!';
    //             priceDropBanner.style.display = 'block';
    //         } else {
    //             // No price drops detected
    //             priceDropBanner.innerHTML = 'No price drops detected.';
    //             priceDropList.innerHTML = '<li>No price drops found.</li>';
    //             priceDropBanner.style.display = 'block';
    //         }
    //     } catch (error) {
    //         console.error('Error fetching price drop notifications:', error);
    //         priceDropBanner.innerHTML = 'Error fetching price drop notifications.';
    //         priceDropBanner.style.display = 'block';
    //     }
    // }

    // Simulated price drop data
    const priceDrops = [
        {
            name: "Wireless Mouse",
            priceDifference: 14.01,
            oldPrice: 40.0,
            newPrice: 25.99,
            date: "2025-02-20",
        },
        {
            name: "Portable Mini Fan",
            priceDifference: 10.0,
            oldPrice: 29.99,
            newPrice: 19.99,
            date: "2025-02-15",
        },
        {
            name: "Running Shoes",
            priceDifference: 10.01,
            oldPrice: 70.0,
            newPrice: 59.99,
            date: "2025-02-12",
        },
        {
            name: "Organic Green Tea",
            priceDifference: 4.0,
            oldPrice: 19.99,
            newPrice: 15.99,
            date: "2025-02-10",
        },
        {
            name: "Wireless Charger",
            priceDifference: 6.0,
            oldPrice: 45.99,
            newPrice: 39.99,
            date: "2025-02-18",
        },
        {
            name: "Office Chair",
            priceDifference: 10.01,
            oldPrice: 199.99,
            newPrice: 210,
            date: "2025-02-18",
        },
        {
            name: "Bluetooth Headphones",
            priceDifference: 20.00,
            oldPrice: 149.99,
            newPrice: 129.99,
            date: "2025-03-05",
        },
        {
            name: "Air Fryer",
            priceDifference: 30.00,
            oldPrice: 159.99,
            newPrice: 129.99,
            date: "2025-03-10",
        },
        {
            name: "Running Shoes",
            priceDifference: 4.00,
            oldPrice: 59.99,
            newPrice: 55.99,
            date: "2025-05-12",
        },
        {
            name: "Wireless Charger",
            priceDifference: 2.00,
            oldPrice: 39.99,
            newPrice: 37.99,
            date: "2025-06-18",
        },
    ];

    // Function to render price drop notifications
    function renderPriceDrops(filteredData) {
        priceDropList.innerHTML = ''; 

        if (filteredData.length === 0) {
            priceDropList.innerHTML = '<li>No price drops found for this month.</li>';
            return;
        }

        filteredData.forEach((item) => {
            const listItem = document.createElement('div');
            listItem.classList.add('price-drop-item');
            listItem.innerHTML = `
                <p><strong>${item.name}:</strong> 
                    <span style="color: green;">$${item.priceDifference.toFixed(2)}</span> 
                    (Old: $${item.oldPrice.toFixed(2)}, New: $${item.newPrice.toFixed(2)})
                </p>
            `;
            priceDropList.appendChild(listItem);
        });

        priceDropBanner.innerHTML = 'Price Drops Detected!';
        priceDropBanner.style.display = 'block';
    }

    // Function to filter data by selected month
    function filterByMonth(month) {
        const filteredData = priceDrops.filter((item) => {
            const itemDate = new Date(item.date);
            return itemDate.getMonth() === month;
        });

        renderPriceDrops(filteredData);
    }

    // Event listener for dropdown change
    sortDropdown.addEventListener('change', (event) => {
        const selectedMonth = parseInt(event.target.value, 10);
        filterByMonth(selectedMonth);
    });

    // // Initially render price drops for the current month 
    // const currentMonth = new Date().getMonth(); // Get current month
    // sortDropdown.value = currentMonth; // Set the dropdown to current month
    // filterByMonth(currentMonth);

    // Update the total selected count
    function updateTotalSelectedCount() {
        totalSelectedElement.textContent = selectedProductIds.size;
    }

    // Handle checkbox selection
    wishlistTable.addEventListener('change', (event) => {
        const target = event.target;
        if (target.classList.contains('select-product')) {
            const productId = target.getAttribute('data-id');
            if (target.checked) {
                selectedProductIds.add(parseInt(productId, 10));
            } else {
                selectedProductIds.delete(parseInt(productId, 10));
            }
            updateTotalSelectedCount();
        }
    });

    // Delete a product from the wishlist
    wishlistTable.addEventListener('click', async (event) => {
        const target = event.target;
        if (target.classList.contains('delete')) {
            const productId = target.getAttribute('data-id');
            try {
                await fetch(`/wishlist/delete/${userId}`, {
                    method: 'DELETE',
                    body: JSON.stringify({ productId }),
                    headers: { 'Content-Type': 'application/json' }
                });

                // Update localStorage after deletion
                const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
                const updatedWishlist = wishlist.filter(id => id !== parseInt(productId, 10));
                localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));

                fetchWishlistData(); // Refresh wishlist data after deletion

                // Optionally refresh the product page to update button state
                window.dispatchEvent(new Event('storage'));
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    });

    // Handle "Add to Cart" for selected items
    checkoutButton.addEventListener('click', async () => {
        const selectedItemsInt = Array.from(selectedProductIds);

        if (selectedItemsInt.length === 0) {
            alert('Please select items to add to the cart.');
            return;
        }

        try {
            for (const productId of selectedItemsInt) {
                const response = await fetch(`/carts/create`, {
                    method: 'POST',
                    body: JSON.stringify({
                        productId: productId,
                        personId: userId,
                        quantity: 1,
                    }),
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || `Failed to add product ID ${productId} to the cart.`);
                }
            }

            // If all items are added successfully, redirect to the cart page
            alert('Selected items added to the cart successfully.');
            window.location.href = '/cart/cart.html';
        } catch (error) {
            console.error('Error adding items to cart:', error);
            alert(error.message || 'Failed to add items to the cart.');
        }
    });

    // Call the functions to initialize data
    fetchWishlistData();
    fetchPriceDropNotifications();

    // Logout functionality
    const logoutLink = document.getElementById("logout-link");

    if (logoutLink) {
        logoutLink.addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            alert("You have been logged out.");
            window.location.href = "/login.html";
        });
    }
});
