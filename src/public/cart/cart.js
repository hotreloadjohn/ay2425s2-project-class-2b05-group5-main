document.addEventListener('DOMContentLoaded', () => {
    const cartTable = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-btn');
    const userId = parseInt(localStorage.getItem("userId"), 10);
    let selectedProductIds = new Set(); // Track selected products

    if (!userId) {
        alert('Please log in to view your cart');
        return;
    }

    // Fetch cart data for the logged-in user
    async function fetchCartData() {
        try {
            const response = await fetch(`/carts/${userId}`);
            const data = await response.json();

            if (data.error) {
                alert(data.error);
                return;
            }

            // Populate cart items
            cartTable.innerHTML = '';
            selectedProductIds.clear(); // Reset selected products

            data.products.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="checkout-item" data-id="${item.productId}"></td>
                    <td>${item.name}</td>
                    <td>$${item.unitPrice}</td>
                    <td>
                        <div class="quantity-btns">
                            <button class="decrease" data-id="${item.productId}">-</button>
                            <span id="quantity-${item.productId}">${item.quantity}</span>
                            <button class="increase" data-id="${item.productId}">+</button>
                        </div>
                    </td>
                    <td>$${(item.totalPrice).toFixed(2)}</td>
                    <td><button class="delete" data-id="${item.productId}" style="background-color: #ff3333; color: #ffffff;">Delete</button></td>
                `;
                cartTable.appendChild(row);
            });

            // Update total price
            totalPriceElement.textContent = `$${parseFloat(data.totalPrice).toFixed(2)}`;
        } catch (error) {
            console.error('Error fetching cart data:', error);
            alert('Failed to load cart data. Please try again later.');
        }
    }

    // Handle checkbox selection
    cartTable.addEventListener('change', (event) => {
        const target = event.target;
        if (target.classList.contains('checkout-item')) {
            const productId = target.getAttribute('data-id');
            if (target.checked) {
                selectedProductIds.add(productId);
            } else {
                selectedProductIds.delete(productId);
            }
        }
    });

    cartTable.addEventListener('click', async (event) => {
        const target = event.target;
        const productId = target.getAttribute('data-id');
        const quantityElement = document.getElementById(`quantity-${productId}`);
    
        if (target.classList.contains('increase') || target.classList.contains('decrease')) {
            // Get the current quantity value from the element
            let currentQuantity = parseInt(quantityElement.innerText, 10);
    
            // Prevent going below 1
            if (currentQuantity < 1) return;
    
            // Increment or decrement the quantity
            let newQuantity = target.classList.contains('increase') ? currentQuantity + 1 : currentQuantity - 1;
    
            if (newQuantity < 1) return; // Prevent quantity from going below 1
    
            try {
                // Update the quantity on the server
                await fetch(`/carts/update/${userId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ productId, quantity: newQuantity }),
                    headers: { 'Content-Type': 'application/json' },
                });
    
                // Optionally, update the displayed quantity in the UI
                quantityElement.innerText = newQuantity;
    
                // Refresh cart data after update
                fetchCartData();
            } catch (error) {
                console.error('Error updating quantity:', error);
            }
        }
    });
    
    // Delete a product from the cart
    cartTable.addEventListener('click', async (event) => {
        const target = event.target;
        if (target.classList.contains('delete')) {
            const productId = target.getAttribute('data-id');
            try {
                await fetch(`/carts/delete/${userId}`, {
                    method: 'DELETE',
                    body: JSON.stringify({ productId }),
                    headers: { 'Content-Type': 'application/json' }
                });
                fetchCartData(); // Refresh cart data after deletion
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    });

    checkoutButton.addEventListener('click', async () => {
        const selectedItems = Array.from(document.querySelectorAll('.checkout-item:checked'))
            .map(checkbox => checkbox.getAttribute('data-id'));
    
        const couponCode = document.getElementById('couponCode').value.trim();  // Get the coupon code
    
        if (selectedItems.length === 0) {
            alert('Please select items to checkout.');
            return;
        }
    
        const selectedItemsInt = selectedItems.map(item => parseInt(item, 10));

        try {
            const response = await fetch(`/carts/checkout/${userId}`, {
                method: 'POST',
                body: JSON.stringify({ selectedItemsInt, couponCode }),  // Include coupon code in request
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (response.ok) {
                const stripe = Stripe('pk_test_51QOcvUAuYNt6Tkf5oWboG32WTArbrGTHyMmSwfg3Y4DQlxc0dChnKB6F5kqgLL9nKeJzXZsJDKNrjRNuWz7WyFDb004QP7z7Hj');
                stripe.redirectToCheckout({ sessionId: data.sessionId });
            } else {
                const errorMessage = data.error || 'Failed to proceed to checkout.';
                const insufficientItems = data.insufficientItems || [];
        
                // Construct the message to be shown
                let finalMessage = errorMessage; // Start with the general error message
        
                if (insufficientItems.length > 0) {
                    // Add the list of insufficient items to the error message
                    const itemsMessage = insufficientItems.map(item =>
                        `Product: ${item.productName}, Requested: ${item.requested}, Available: ${item.available}`
                    ).join('\n');
                    
                    finalMessage += '\n\nInsufficient stock for the following items:\n' + itemsMessage;
                }
        
                // Show the final combined message in a single alert
                alert(finalMessage);
            }
            
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('Checkout failed. Please try again later.');
        }
    });

    fetchCartData();
});

const logoutLink = document.getElementById("logout-link"); // Logout button
    // Logout functionality
    if (logoutLink) {
        logoutLink.addEventListener("click", function () {
            localStorage.clear(); // Clear localStorage
            window.location.href = "../index.html"; // Redirect to the public index page
        });
    }