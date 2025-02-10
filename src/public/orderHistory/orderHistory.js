document.addEventListener('DOMContentLoaded', async () => {
    const ordersContainer = document.getElementById('orders-container');
    const userId = parseInt(localStorage.getItem("userId"), 10); // Get userId from localStorage
    const monthFilter = document.getElementById('month-filter');

    if (!userId) {
        alert('Please log in to view your order history.');
        return;
    }

    let orders = [];

    try {
        // Fetch order history for the logged-in user
        const response = await fetch(`/orderHistory/${userId}`);
        orders = await response.json();

        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p>No orders found.</p>';
            return;
        }

        // Group orders by month and year (e.g., "December 2024")
        const groupedOrders = orders.reduce((acc, order) => {
            const orderDate = new Date(order.createdAt);
            const monthYear = `${orderDate.toLocaleString('default', { month: 'long' })} ${orderDate.getFullYear()}`;

            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }
            acc[monthYear].push(order);
            return acc;
        }, {});

        // Function to render orders for the selected month
        function renderOrders(groupedOrders) {
            ordersContainer.innerHTML = ''; // Clear previous orders

            if (Object.keys(groupedOrders).length === 0) {
                ordersContainer.innerHTML = '<p>There are no orders for this month.</p>';
                return;
            }

            const seenOrderIds = new Set(); // Set to track already processed orderIds

            // Loop through grouped orders and generate HTML
            for (const [monthYear, ordersInMonth] of Object.entries(groupedOrders)) {
                const orderDiv = document.createElement('div');
                orderDiv.classList.add('order-group');
                orderDiv.innerHTML = `
                    <h2 class="order-date">${monthYear}</h2>
                    <div class="order-items">
                        ${ordersInMonth.map(order => {
                    return `
                                <div class="order-item">
                                    <ul>
                                        ${order.products.map(product => {
                        const productName = product.productName;
                        const productPrice = product.productPrice;
                        const productDescription = product.productDescription;
                        const productImg = product.imageUrl;

                        // Format the order date (e.g., "12 Dec 2024")
                        const orderDate = new Date(order.createdAt);
                        const formattedDate = orderDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                        // Check if this orderId has been seen before
                        const orderId = order.orderId;
                        let viewDetailsButton = '';

                        if (!seenOrderIds.has(orderId)) {
                            seenOrderIds.add(orderId);
                            viewDetailsButton = `<button class="view-details" data-order-id="${orderId}">View Details</button>`;
                        }

                        return `
                                            <li class="product">
                                            <img src="${productImg}" class="product-image">
                                            <div class="product-info">
                                            <strong>${productName}</strong> - ${productDescription}<br>
                                            Price: $${productPrice}<br>
                                            Ordered Date: ${formattedDate}
                                            </div>
                                            ${viewDetailsButton ? `<div class="view-details-container">${viewDetailsButton}</div>` : ''}
                                            </li>

                                            `;
                    }).join('')}
                                    </ul>
                                </div>
                            `;
                }).join('')}
                    </div>
                `;
                ordersContainer.appendChild(orderDiv);
            }
        }

        // Initially render all orders
        renderOrders(groupedOrders);

        // Add event listener to the parent container for event delegation
        ordersContainer.addEventListener('click', function (event) {
            if (event.target && event.target.classList.contains('view-details')) {
                const orderId = event.target.getAttribute('data-order-id');
                console.log(`Order ID clicked: ${orderId}`);
                // Redirect to the view details page with orderId as a query parameter
                window.location.href = `/orderHistory/orderDetails.html?orderId=${orderId}`;
            }
        });

        // Filter orders based on selected month
        monthFilter.addEventListener('change', () => {
            const selectedMonth = parseInt(monthFilter.value, 10);

            // If "Select Month" (empty value) is selected, render all orders
            if (selectedMonth === '' || selectedMonth === -1) {
                renderOrders(groupedOrders); // Render all orders without filtering
                return;
            }

            // Filter orders by the selected month
            const filteredOrders = Object.entries(groupedOrders).reduce((acc, [monthYear, ordersInMonth]) => {
                const [month, year] = monthYear.split(' ');
                const orderMonth = new Date(`${month} 1, ${year}`).getMonth();

                if (orderMonth === selectedMonth) {
                    acc[monthYear] = ordersInMonth;
                }

                return acc;
            }, {});

            // Render filtered orders
            renderOrders(filteredOrders);
        });

    } catch (error) {
        console.error('Error fetching order history:', error);
        alert('Failed to load order history. Please try again later.');
    }
});

const logoutLink = document.getElementById("logout-link"); // Logout button
    // Logout functionality
    if (logoutLink) {
        logoutLink.addEventListener("click", function () {
            localStorage.clear(); // Clear localStorage
            window.location.href = "../index.html"; // Redirect to the public index page
        });
    }