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

  // Fetch data from the URL path
  const urlPath = window.location.search.slice(1); // Remove the leading "?" from the search
  const [suapplyId, status] = urlPath.split('/'); // Split the path by "/"

  // Set the default values in the form fields
  if (suapplyId) {
    document.getElementById('suapplyId').value = suapplyId;
  }
  if (status) {
    document.getElementById('status').value = status;
  }

  // Form submission handler
  document.getElementById('update-status-form').addEventListener('submit', function (e) {
      e.preventDefault(); // Prevent the form from refreshing the page

      const updatedStatus = document.getElementById('status').value;
      const adminreason = document.getElementById('adminreason').value; // Get the adminreason value

      // Ensure adminreason is provided
      if (!adminreason.trim()) {
          alert("Please provide a reason for the status update.");
          return;
      }

      fetch(`/supplier/application/status/${suapplyId}/${updatedStatus}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ adminreason }), // Include adminreason in the body of the request
      })
      .then((response) => {
          if (!response.ok) throw new Error('Failed to update application status');
          return response.json();
      })
      .then(() => {
          alert(`Application status updated to ${updatedStatus}.`);

          // Navigate to the appropriate page
          if (updatedStatus === 'approved') {
              const createSupplierUrl = `createSupplier.html?suapplyId=${suapplyId}`;
              window.location.href = createSupplierUrl;
          } else {
              window.location.href = 'supplierAdmin.html'; // Redirect to the main admin page
          }
      })
      .catch((error) => console.error('Error updating application:', error));
  });
});
