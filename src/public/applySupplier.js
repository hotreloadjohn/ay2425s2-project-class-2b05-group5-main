document.addEventListener('DOMContentLoaded', function () {
    // Get user ID and role from localStorage
    const personId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    // Get navbar elements
    const loggedInNavbar = document.getElementById("logged-in-navbar");
    const publicNavbar = document.getElementById("public-navbar");

    // Display navbar based on login status
    if (role === 'user') {
        loggedInNavbar.style.display = 'block';
        publicNavbar.style.display = 'none';
    } else {
        loggedInNavbar.style.display = 'none';
        publicNavbar.style.display = 'block';
        alert('You must be logged in to access this page.');
        window.location.href = '/login.html'; // Redirect to login if not logged in
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

    // Fetch the user's previous supplier application
    if (personId) {
        fetch(`/supplier/application/person?personId=${personId}`)
            .then((response) => response.json())
            .then((applications) => {
                if (applications.length > 0) {
                    const application = applications[0]; // Assuming a single application per user
                    const status = application.status;

                    // Display existing application details
                    document.getElementById("existing-application").style.display = 'block';
                    document.getElementById("existing-company-name").textContent = application.companyName;
                    document.getElementById("existing-product-type").textContent = application.productType;
                    document.getElementById("existing-reason").textContent = application.Reason;
                    document.getElementById("existing-status").textContent = status;

                    // If the status is 'reject', enable editing
                    if (status === 'rejected') {
                        document.getElementById("edit-application-btn").style.display = 'block';
                        document.getElementById("company-name").value = application.companyName;
                        document.getElementById("product-type").value = application.productType;
                        document.getElementById("reason_id").value = application.Reason;
                        // Ensure the form is visible for editing
                        document.getElementById("apply-supplier-form").style.display = 'block';
                    } else {
                        // Hide the form if status is not 'rejected'
                        document.getElementById("apply-supplier-form").style.display = 'none';
                    }
                }
            })
            .catch((error) => {
                console.error("Error fetching application:", error);
            });
    }

    // Handle application form submission
    const form = document.getElementById("apply-supplier-form");
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        // Ensure user is logged in
        if (!personId) {
            alert('You must be logged in to submit the application.');
            return;
        }

        // Get form values
        const companyName = document.getElementById("company-name").value;
        const productType = document.getElementById("product-type").value;
        const Reason = document.getElementById("reason_id").value;

        // Validate fields
        if (!companyName || !productType || !Reason) {
            alert('All fields are required.');
            return;
        }

        // Send the application data to the backend
        fetch("/supplier/application/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ personId, companyName, productType, Reason }),
        })
            .then((response) => {
                if (response.ok) {
                    alert("Application submitted successfully!");
                    form.reset();
                } else {
                    response.json().then((data) => {
                        throw new Error(data.message || "Failed to submit application.");
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert(error.message);
            });
    });
});
