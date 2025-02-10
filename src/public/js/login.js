document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const message = document.getElementById("message");

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get user inputs
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    console.log("Login Form Data:", { email, password });

    // Input validation
    if (!email || !password) {
      if (message) {
        message.textContent = "Email and password are required.";
        message.style.color = "red";
      }
      return;
    }

    try {
      // Send POST request to the login endpoint
      const response = await fetch("/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Response Data:", data); // Log response data for debugging

      if (response.ok) {
        // Save token, role, and username to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role); 
        localStorage.setItem("username", data.username); 
        localStorage.setItem("userId", data.userId);
        console.log("Login successful:", data);

        // Display success message
        if (message) {
          message.textContent = "Login successful! Redirecting...";
          message.style.color = "green";
        }

        // Redirect based on role
        setTimeout(() => {
          if (data.role) {
            const role = data.role.toLowerCase();
            if (role === "admin") {
              window.location.href = "supplierAdmin.html"; // Admin page
            } else if (role === "user") {
              window.location.href = "index.html"; // User page
            }
            else if (role === "delivery") {
              window.location.href = "delivery/deliveryProgress.html"; // User page
            }else if(role === "supplier"){
              window.location.href ="productManagement/productManagement.html"
            } else {
              message.textContent = "Unknown role. Please contact support.";
              message.style.color = "red";
            }
          } else {
            message.textContent = "Login failed. No role assigned.";
            message.style.color = "red";
          }
        }, 500);
      } else {
        // Display error message from the server
        if (message) {
          message.textContent = data.message || "Login failed.";
          message.style.color = "red";
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      if (message) {
        message.textContent = "An error occurred. Please try again.";
        message.style.color = "red";
      }
    }
  });
});