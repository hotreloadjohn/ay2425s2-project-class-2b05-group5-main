document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const message = document.getElementById("message");

  // Navigate to login page on "Sign In" button click
  const signInButton = document.querySelector(".switch-btn");
  if (signInButton) {
    signInButton.addEventListener("click", function () {
      window.location.href = "login.html";
    });
  }

  // Handle form submission for registration
  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    console.log("Form Data:", { username, email, password });

    try {
      const response = await fetch("/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and role to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "user"); // Assuming default role is "user"
        localStorage.setItem("username", username); // Save username for personalization

        console.log(data);
        if (message) {
          message.textContent = "Registration successful!";
          message.style.color = "green";
        }

        // Redirect to index.html after a short delay
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        if (message) {
          message.textContent = data.message || "Registration failed.";
          message.style.color = "red";
        }
      }
    } catch (error) {
      if (message) {
        message.textContent = "An error occurred. Please try again.";
        message.style.color = "red";
      }
      console.error("Error:", error);
    }
  });
});
