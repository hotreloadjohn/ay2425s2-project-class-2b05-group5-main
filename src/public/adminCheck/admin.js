document.addEventListener("DOMContentLoaded", async () => {
  const totalUsersEl = document.getElementById("total-users").querySelector("p");
  const activeUsersEl = document.getElementById("active-users").querySelector("p");
  const totalAdminsEl = document.getElementById("total-admins").querySelector("p");
  const activeAdminsEl = document.getElementById("active-admins").querySelector("p");
  const totalSuppliersEl = document.getElementById("total-suppliers").querySelector("p");
  const activeSuppliersEl = document.getElementById("active-suppliers").querySelector("p");

  const errorMessageEl = document.getElementById("error-message");

  // Check if the user is logged in and has the admin role
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    alert("Access denied. Only admins can view this page.");
    window.location.href = "/login.html"; 
    return;
  }

  try {
    const response = await fetch("/admin/adminCheck", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin statistics.");
    }

    const { data } = await response.json();

    totalUsersEl.textContent = data.totalUsers;
    activeUsersEl.textContent = data.activeUsers;
    totalAdminsEl.textContent = data.totalAdmins;
    activeAdminsEl.textContent = data.activeAdmins;
    totalSuppliersEl.textContent = data.totalSuppliers;
    activeSuppliersEl.textContent = data.activeSuppliers;

  } catch (error) {
    console.error(error.message);
    errorMessageEl.style.display = "block";

    totalUsersEl.textContent = "Error";
    activeUsersEl.textContent = "Error";
    totalAdminsEl.textContent = "Error";
    activeAdminsEl.textContent = "Error";
    totalSuppliersEl.textContent = "Error";
    activeSuppliersEl.textContent = "Error";
  }

  // Logout functionality
  const logoutLink = document.getElementById("logout-link");

  if (logoutLink) {
    logoutLink.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default link behavior

      // Clear all authentication-related data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");

      // Show logout confirmation and redirect to login page
      alert("You have been logged out.");
      window.location.href = "/login.html";
    });
  }
});
