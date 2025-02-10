document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    const orderDetailsContainer = document.getElementById('order-details-container');

    if (!orderId) {
        alert('Order ID is missing in the URL.');
        return;
    }

    try {
        const response = await fetch(`/orderHistory/orderDetails/${orderId}`);
        const orderDetails = await response.json();

        if (!orderDetails) {
            orderDetailsContainer.innerHTML = '<p>Order not found.</p>';
            return;
        }

        const formatDate = (dateString) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        };

        const statuses = ["PENDING", "PROCESSING", "PACKED", "SORTING", "OUTFORDELIVERY", "DELIVERED"];
        const currentStatus = orderDetails.deliveryDetails?.[0]?.deliveryStatus;
        const statusIndex = statuses.indexOf(currentStatus);

        const deliveryStatusHTML = `
            <div class="delivery-tracker">
                <div class="status-line">
                    ${statuses.map((status, index) => `
                        <div class="status-dot ${index <= statusIndex ? 'active' : ''}" data-status="${status}">
                            ${status}
                        </div>
                    `).join('')}
                    <div class="progress-bar" style="width: ${statusIndex / (statuses.length - 1) * 100}%;"></div>
                </div>
            </div>
        `;

        const hasDeliveryDetails = orderDetails.deliveryDetails && orderDetails.deliveryDetails.length > 0;
        const isDelivered = currentStatus === "DELIVERED"; // Check if the order is delivered

        orderDetailsContainer.innerHTML = `
            <h3>Order Items:</h3>
            <table class="order-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Product Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderDetails.orderItems.map(item => `
                        <tr>
                            <td><img src="${item.productImage}" alt="${item.productName}" class="product-image"></td>
                            <td>${item.productName}</td>
                            <td>${item.productDetail}</td>
                            <td>$${item.unitPrice}</td>
                            <td>${item.quantity}</td>
                            <td>$${item.totalPrice}</td>
                        </tr>
                    `).join('')}
                    <tr class="final-row">
                        <td colspan="4"></td>
                        <td><strong>Total Amount:</strong></td>
                        <td><strong>$${orderDetails.finalAmount}</strong></td>
                    </tr>
                </tbody>
            </table>

            <h3>Delivery Details:</h3>
            ${deliveryStatusHTML}
            <table class="delivery-table">
                <thead>
                    <tr>
                        <th>Tracking No.</th>
                        <th>Delivery Method</th>
                        <th>Location</th>
                        <th>Delivery Start Date</th>
                        <th>Delivered Date</th>
                        <th>Delivery Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${hasDeliveryDetails ? orderDetails.deliveryDetails.map(detail => `
                        <tr>
                            <td id="deliveryNo">${detail.deliveryNo}</td>
                            <td>${detail.deliveryType}</td>
                            <td>${detail.deliveryType === 'DIRECT' ? '-' : `${detail.collectionPointName} - ${detail.collectionPointLocations}`}</td>
                            <td>${formatDate(detail.deliveryStartDate)}</td>
                            <td>${formatDate(detail.deliveredDate)}</td>
                            <td>${detail.deliveryStatus}</td>
                        </tr>
                    `).join('') : ''}
                </tbody>
            </table>

            ${!hasDeliveryDetails ? `
                <p style="color: red; font-weight: bold; text-align: center;">
                    ! Please fill in the delivery information<br>
                    <a href="/delivery/deliveryChoice.html?orderId=${orderId}" style="color: red; text-decoration: underline;">
                        Click here to add delivery details
                    </a>
                </p>
            ` : ''}
        `;

        // Show refund section only if the order is delivered
        if (isDelivered) {
            // Call to check if refund request already exists
            const refundResponse = await fetch(`/delivery/getRefundData/${orderId}`);
            const refundData = await refundResponse.json();

            if (refundData && refundData.message !== 'Refund history not found for this order.') {
                // If refund request exists and is processed, show refund status only
                orderDetailsContainer.innerHTML += `
                    <div class="refund-status-card">
                        <h3 class="refund-status-header">Refund Status</h3>
                        <div class="refund-status-details">
                            
                            <p><strong>Issue Type:</strong> ${refundData.issueType}</p>
                            <p><strong>Issued Date:</strong> ${formatDate(refundData.createdAt)}</p>
                            <p><strong>Refund Message:</strong> ${refundData.issueDescription}</p>
                        </div>
                        ${renderProofImages(refundData.proofImages)}
                        <p><strong>Status:</strong> ${refundData.status}</p>
                        <p><strong>Updated Date:</strong> ${refundData.updatedAt ? formatDate(refundData.updatedAt) : '-'}</p>
                        <p><strong>Reason:</strong> ${refundData.reason || '-'}</p>
                    </div>
                `;
                // Assuming refundData is already defined and contains the status
                const refundStatusCard = document.querySelector('.refund-status-card');

                if (refundData.status === 'APPROVED') {
                    refundStatusCard.classList.add('approved');
                } else if (refundData.status === 'REJECTED') {
                    refundStatusCard.classList.add('rejected');
                }


            } else {
                // Show the refund request form if no refund exists
                orderDetailsContainer.innerHTML += `
                    <div class="refund-section">
                        <h3>Request Refund / Report Issue</h3>
                        <p>If there is an issue with your order, please select the problem, describe the issue, and upload proof images.</p>
                        
                        <label for="issue-type">Select Issue:</label>
                        <select id="issue-type">
                            <option value="wrong-item">Wrong Item</option>
                            <option value="damaged">Damaged Item</option>
                            <option value="other">Other</option>
                        </select>
                
                        <label for="issue-description">Describe the Issue:</label>
                        <textarea id="issue-description" placeholder="Provide additional details..."></textarea>
                
                        <div class="upload-container">
                            <label for="proof-images" class="upload-box">
                                <span class="plus-icon">+</span>
                                <input type="file" id="proof-images" multiple accept="image/*" style="display: none;">
                            </label>
                            <div id="image-preview"></div>
                        </div>            
                        <button id="submit-refund">Submit Request</button>
                    </div>
                `;

                attachRefundButtonListener(); // Call the function to attach the listener
            }
        } else {
            alert('This order has not been delivered yet. Refund requests can only be made for delivered orders.');
        }

        // Handle file input change event to show image preview and upload images one by one
        const proofImagesInput = document.getElementById('proof-images');
        const imagePreviewContainer = document.getElementById('image-preview');

        if (proofImagesInput) {
            proofImagesInput.addEventListener('change', (event) => {
                const files = event.target.files;

                if (files.length > 0) {
                    Array.from(files).forEach(file => {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            const imageContainer = document.createElement('div');
                            imageContainer.classList.add('image-container');

                            const imgElement = document.createElement('img');
                            imgElement.src = e.target.result;
                            imgElement.alt = file.name;
                            imgElement.style.maxWidth = '100px'; // Resize image preview

                            const deleteButton = document.createElement('button');
                            deleteButton.textContent = 'X';
                            deleteButton.classList.add('delete-btn');
                            deleteButton.onclick = function () {
                                imagePreviewContainer.removeChild(imageContainer);
                            };

                            imageContainer.appendChild(imgElement);
                            imageContainer.appendChild(deleteButton);
                            imagePreviewContainer.appendChild(imageContainer);
                        };
                        reader.readAsDataURL(file);
                    });
                }
            });
        }

        function renderProofImages(proofImages) {
            const images = JSON.parse(proofImages);

            let imagesHtml = '<div class="refund-images-container">'; // Start the image container

            // Get the tracking number from the <td> element with id="deliveryNo"
            const trackingNumber = document.getElementById("deliveryNo").textContent;

            images.forEach(image => {
                // Build the relative image path using the tracking number
                const imageUrl = `../../refund_images/${trackingNumber}/${image.filename}`;

                imagesHtml += `
                    <div class="refund-image">
                        <img src="${imageUrl}" alt="Refund Proof Image" class="refund-image-thumbnail"/>
                    </div>
                `;
            });

            imagesHtml += '</div>'; // Close the image container

            return imagesHtml;
        }



        function attachRefundButtonListener() {
            const submitRefundButton = document.getElementById('submit-refund');
            if (submitRefundButton) {
                submitRefundButton.addEventListener('click', async (event) => {
                    event.preventDefault();

                    const issueType = document.getElementById('issue-type').value;
                    const issueDescription = document.getElementById('issue-description').value;
                    const proofImages = document.getElementById('proof-images').files;
                    const trackingNumber = document.getElementById("deliveryNo").innerText;
                    const formData = new FormData();
                    formData.append('issueType', issueType);
                    formData.append('issueDescription', issueDescription);
                    formData.append('trackingNumber', trackingNumber);

                    for (let i = 0; i < proofImages.length; i++) {
                        formData.append('proofImages', proofImages[i]);
                    }

                    try {
                        const response = await fetch(`/delivery/return/${orderId}`, {
                            method: 'POST',
                            body: formData
                        });

                        const data = await response.json();

                        if (response.ok) {
                            alert('Refund request submitted successfully!');
                            location.reload(); // Refresh the page after successful submission
                        } else {
                            alert('Error submitting refund request. Please try again.');
                        }
                    } catch (error) {
                        console.error('Error with refund request:', error);
                        alert('Failed to submit refund request. Please try again later.');
                    }
                });
            } else {
                setTimeout(attachRefundButtonListener, 100); // Retry after 100ms
            }
        }

    } catch (error) {
        console.error('Error fetching order details:', error);
        orderDetailsContainer.innerHTML = '<p>Unable to fetch order details. Please try again later.</p>';
    }
});

const logoutLink = document.getElementById("logout-link"); // Logout button
    // Logout functionality
    if (logoutLink) {
        logoutLink.addEventListener("click", function () {
            localStorage.clear(); // Clear localStorage
            window.location.href = "index.html"; // Redirect to the public index page
        });
    }