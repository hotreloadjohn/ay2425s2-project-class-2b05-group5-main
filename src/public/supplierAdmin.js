document.addEventListener('DOMContentLoaded', function () {
    // Get user ID and role from localStorage
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Get navbar elements
    const loggedInNavbar = document.getElementById("logged-in-navbar");
    const publicNavbar = document.getElementById("public-navbar");

    // Check if the user is logged in and is an admin
    if (token && role === 'admin') {
        loggedInNavbar.style.display = 'block';
        if (publicNavbar) publicNavbar.style.display = 'none';

        // Fetch data for the page
        fetchSupplierApplications(); 
    } else {
        loggedInNavbar.style.display = 'none';
        if (publicNavbar) publicNavbar.style.display = 'block';
        alert('You must be logged in as an admin to access this page.');
        window.location.href = '/login.html';  
        return;
    }

    // Logout functionality
    document.getElementById('logout-link').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior

        // Clear localStorage and redirect to login page
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        alert('You have been logged out.');
        window.location.href = '/login.html';
    });

    function fetchSupplierApplications(searchTerm = '', status = '') {
        let url = '/supplier/application/all';
        const params = new URLSearchParams();

        if (searchTerm) params.append('search', searchTerm);
        if (status) params.append('status', status);

        if (params.toString()) url += `?${params.toString()}`;

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch applications');
                return response.json();
            })
            .then((applications) => renderApplications(applications))
            .catch((error) => console.error('Error fetching applications:', error));
    }

    function renderApplications(applications) {
        const applicationsContainer = document.getElementById('applications-container');
        applicationsContainer.innerHTML = ''; 

        if (applications.length === 0) {
            applicationsContainer.innerHTML = '<p>No applications found.</p>';
            return;
        }

        applications.forEach((application) => {
            const card = document.createElement('div');
            card.classList.add('application-card');
            let statusClass = '';

            switch (application.status.toLowerCase()) {
                case 'approved': statusClass = 'status-approve-card'; break;
                case 'rejected': statusClass = 'status-reject-card'; break;
                case 'pending': statusClass = 'status-pending-card'; break;
            }

            card.classList.add(statusClass);

            card.innerHTML = ` 
                <p><strong>Application ID:</strong> ${application.id}</p>
                <p><strong>Person ID:</strong> ${application.personId}</p>
                <p><strong>Company Name:</strong> ${application.companyName}</p>
                <p><strong>Product Type:</strong> ${application.productType}</p>
                <p><strong>Status:</strong> <span class="${statusClass}">${application.status}</span></p>
                <p><strong>Reason:</strong> ${application.Reason || 'N/A'}</p>
                <p><strong>Person Details:</strong></p>
                <ul>
                    <li><strong>Name:</strong> ${application.user.username}</li>
                    <li><strong>Email:</strong> ${application.user.email}</li>
                    <li><strong>Role:</strong> ${application.user.role || 'None'}</li>
                </ul>`;

            if (application.status.toLowerCase() === 'pending') {
                card.innerHTML += ` 
                    <button class="approve-btn" data-id="${application.id}" data-status="approved">Approve</button>
                    <button class="reject-btn" data-id="${application.id}" data-status="rejected">Reject</button>`;
            }

            applicationsContainer.appendChild(card);
        });

        document.querySelectorAll('.approve-btn, .reject-btn').forEach(button => {
            button.addEventListener('click', function () {
                const applicationId = this.getAttribute('data-id');
                const status = this.getAttribute('data-status');
                goToUpdateSupplierPage(applicationId, status);
            });
        });
    }

    function goToUpdateSupplierPage(applicationId, status) {
        window.location.href = `updateSupplierS.html?${applicationId}/${status}`;
    }

    document.querySelector('.search-btn').addEventListener('click', function () {
        const searchTerm = document.querySelector('.search-box').value.trim();
        const status = document.querySelector('.status-filter').value;
        fetchSupplierApplications(searchTerm, status);
    });
});
