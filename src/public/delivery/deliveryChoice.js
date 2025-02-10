document.addEventListener('DOMContentLoaded', function () {
    const deliveryChoiceForm = document.getElementById('delivery-choice-form');
    const deliveryOptionRadios = document.querySelectorAll('input[name="delivery-option"]');
    const radioGroup = document.querySelector('.radio-group');
    const pickupLocationGroup = document.getElementById('pickup-location-group');
    const pickupLocationSelect = document.getElementById('pickup-location');
    const postalCodeInput = document.getElementById('postal-code');
    const loadingIndicator = document.getElementById('loading');

    // Initially hide radio group and pickup location dropdown
    radioGroup.style.display = 'none';
    pickupLocationGroup.style.display = 'none';

    // Add input event listeners for form validation
    const requiredFields = ['name', 'address', 'unit', 'postal-code', 'phone-number'];
    requiredFields.forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('input', validateForm);
    });

    function validateForm() {
        const isFormValid = requiredFields.every(fieldId => {
            const field = document.getElementById(fieldId);
            return field.checkValidity();
        });

        radioGroup.style.display = isFormValid ? 'block' : 'none';
    }

    // Handle radio button selection
    deliveryOptionRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (radio.value === 'pickup-option') {
                const postalCode = postalCodeInput.value.trim();
                if (postalCode) {
                    fetchCollectionPoints(postalCode);
                }
            } else {
                pickupLocationGroup.style.display = 'none';
            }
        });
    });

    // Track postal code input change
    postalCodeInput.addEventListener('input', function () {
        // Reset radio selection when user changes postal code
        deliveryOptionRadios.forEach(radio => radio.checked = false);

        // Hide pickup location until user reselects "Pickup"
        pickupLocationGroup.style.display = 'none';
    });

    function fetchCollectionPoints(postalCode) {
        pickupLocationGroup.style.display = 'none';
        loadingIndicator.style.display = 'block';

        fetch(`/delivery/collectionPoints/${postalCode}`)
            .then(response => response.json())
            .then(data => {
                loadingIndicator.style.display = 'none';

                if (data && data.length > 0) {
                    pickupLocationSelect.innerHTML = '';
                    data.forEach(point => {
                        const option = document.createElement('option');
                        option.value = point.id;
                        option.textContent = `${point.name}, ${point.location}, ${point.postalCode} - ${point.distance} km`;
                        pickupLocationSelect.appendChild(option);
                    });

                    pickupLocationGroup.style.display = 'block';
                } else {
                    alert('Invalid Postal Code, Try Again!');
                }
            })
            .catch(error => {
                console.error('Error fetching collection points:', error);
                loadingIndicator.style.display = 'none';
                if (error.message) {
                    alert(error.message);
                } else {
                    alert('An error occurred while fetching collection points. Please Try Again!');
                }
            });
    }

    deliveryChoiceForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const unit = document.getElementById('unit').value;
        const postalCode = postalCodeInput.value;
        const phoneNumber = document.getElementById('phone-number').value;
        const notes = document.getElementById('notes').value;
        const sessionId = localStorage.getItem("session_id");

        function generateDeliveryNo() {
            const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            const numbers = Math.floor(100000 + Math.random() * 900000).toString();
            return letter + numbers;
        }

        const selectedDeliveryOption = document.querySelector('input[name="delivery-option"]:checked');
        if (!selectedDeliveryOption) {
            alert('Please select a delivery option.');
            return;
        }

        let collectionPointId = null;
        if (selectedDeliveryOption.value === 'pickup-option') {
            collectionPointId = Number(pickupLocationSelect.value);
        }

        fetch(`/orderHistory/order/${sessionId}`)
            .then(response => response.json())
            .then(orderData => {
                console.log(orderData)
                const orderId = orderData.orderId;
                const deliveryData = {
                    orderId: orderId,
                    deliveryNo: generateDeliveryNo(),
                    name: name,
                    address: address,
                    unit: unit,
                    postalCode: postalCode,
                    phoneNumber: phoneNumber,
                    notes: notes,
                    deliveryStartDate: new Date(),
                    deliveredDate: null,
                    deliveryType: selectedDeliveryOption.value === 'pickup-option' ? 'COLLECTION' : 'DIRECT',
                    collectionPointId: collectionPointId,
                };

                fetch('/delivery/createDeliveryForm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(deliveryData),
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('Delivery form submitted successfully!');
                            deliveryChoiceForm.reset();
                            localStorage.removeItem('session_id');
                            window.location.href = '/orderHistory/orderHistory.html';
                        } else {
                            alert('Error submitting delivery form.');
                        }
                    })
                    .catch(error => {
                        console.error('Error submitting delivery form:', error);
                        alert('An error occurred while submitting.');
                    });
            })
            .catch(error => {
                console.error('Error fetching order data:', error);
                alert('An error occurred while fetching order data.');
            });
    });
});
