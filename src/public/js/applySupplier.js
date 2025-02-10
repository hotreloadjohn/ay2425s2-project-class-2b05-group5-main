// script.js
document.addEventListener('DOMContentLoaded', function () {
    
    const token = localStorage.getItem("token");
    const loggedInNavbar = document.getElementById("logged-in-navbar");
 
    if (token) {
        loggedInNavbar.style.display = 'block';
        fetchMyApplications(); // Load applications if logged in
    } else {
        loggedInNavbar.style.display = 'none';
    }
 
    // Handle application submission
    document.getElementById('supplierApplicationForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const companyName = document.getElementById('companyName').value.trim();
        const productType = document.getElementById('productType').value.trim();
        const reason = document.getElementById('reason').value.trim();
 
        submitApplication(companyName, productType, reason);
    });
 
    // Function to submit a new supplier application
    function submitApplication(companyName, productType, reason) {
        fetch('/application/create', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ personId:'userPersonId', companyName, productType, Reason: reason }) // Replace with actual user ID
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            fetchMyApplications(); // Refresh applications after submission
            document.getElementById('supplierApplicationForm').reset(); // Clear the form
        })
        .catch(error => console.error('Error submitting application:', error));
    }
 
    // Function to fetch user's applications
    function fetchMyApplications() {
        fetch('/application/my', { // Adjust endpoint as necessary
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => response.json())
        .then(applications => renderApplications(applications))
        .catch(error => console.error('Error fetching applications:', error));
    }
 
    // Function to render applications
    function renderApplications(applications) {
        const applicationsContainer = document.getElementById('applicationsContainer');
        applicationsContainer.innerHTML = ''; // Clear previous entries
 
        if (applications.length === 0) {
            applicationsContainer.innerHTML = '<p>No applications found.</p>';
            return;
        }
 
        applications.forEach(application => {
            const card = document.createElement('div');
            card.classList.add('application-card');
            card.innerHTML = `
                <p><strong>Company Name:</strong> ${application.companyName}</p>
                <p><strong>Product Type:</strong> ${application.productType}</p>
                <p><strong>Status:</strong> ${application.status}</p>
                <button onclick='editApplication("${application.id}")'>Edit</button>
                <button onclick='deleteApplication("${application.id}")'>Delete</button>`;
            applicationsContainer.appendChild(card);
        });
    }
 
    // Function to edit an application
    window.editApplication = function(applicationId) {
        const newCompanyName = prompt("Enter new Company Name:");
        const newProductType = prompt("Enter new Product Type:");
        const newReason = prompt("Enter new Reason:");
 
        if (newCompanyName && newProductType && newReason) {
            fetch('/application/edit', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ suapplyId: applicationId, personId:'userPersonId', companyName:newCompanyName, productType:newProductType, Reasonforapply:newReason }) // Replace with actual user ID
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                fetchMyApplications(); // Refresh applications after editing
            })
            .catch(error => console.error('Error editing application:', error));
        }
    };
 
    // Function to delete an application
    window.deleteApplication = function(applicationId) {
        if (confirm("Are you sure you want to delete this application?")) {
            fetch('/application/delete', {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ suApplyId: applicationId, personId:'userPersonId' }) // Replace with actual user ID
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                fetchMyApplications(); // Refresh applications after deletion
            })
            .catch(error => console.error('Error deleting application:', error));
        }
    };
 });