document.addEventListener("DOMContentLoaded", async () => {
  const updateButtons = document.querySelectorAll(".update-btn");
  const updateBox = document.getElementById("update-box");
  const fieldNameSpan = document.getElementById("field-name");
  const updateValueInput = document.getElementById("update-value");
  const saveBtn = document.getElementById("save-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const passwordPromptBox = document.getElementById("password-prompt-box");
  const passwordInput = document.getElementById("password-input");
  const passwordSubmitBtn = document.getElementById("password-submit-btn");

  let currentField = null;
  let userId = localStorage.getItem("userId");

  // Fetch profile data and display it
  async function fetchProfileData() {
    try {
      const response = await fetch(`/profile/${userId}`);
      const userData = await response.json();
      document.getElementById("username").textContent = userData.username || "N/A";
      document.getElementById("email").textContent = userData.email || "N/A";
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  }

  await fetchProfileData();

  // When clicking on update button, show the password prompt and clear previous data
  updateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentField = button.dataset.field;
      fieldNameSpan.textContent = currentField.charAt(0).toUpperCase() + currentField.slice(1); // Capitalize first letter of field name
      passwordPromptBox.classList.remove("hidden");

      // Clear the previous input field values when switching fields
      updateValueInput.value = ""; // Reset update input field
      passwordInput.value = ""; // Reset password input field
      updateBox.classList.add("hidden"); // Hide the update box until password is verified
    });
  });

  passwordSubmitBtn.addEventListener("click", async () => {
    const password = passwordInput.value.trim();
    try {
      const response = await fetch(`/profile/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      if (!response.ok) throw new Error("Incorrect password");

      // Hide password prompt and show the update box
      passwordPromptBox.classList.add("hidden");
      updateBox.classList.remove("hidden");
    } catch (error) {
      alert("Password verification failed. Please try again.");
    }
  });

  // Save the updated value
  saveBtn.addEventListener("click", async () => {
    const value = updateValueInput.value.trim();
    if (currentField === "email" && !validateEmail(value)) {
      alert("Please enter a valid email address.");
      return; // Stop the update if email is not valid
    }

    try {
      const response = await fetch(`/profile/${currentField}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, value }),
      });

      if (!response.ok) throw new Error("Failed to update");

      // Fetch updated profile data and hide the update box
      await fetchProfileData();
      alert("Successfully Updated!!")
      window.location.reload();
      updateBox.classList.add("hidden");

    } catch (error) {
      alert("It already exists!! Use another one!");
    }
  });

  // Cancel the update process and hide the update box
  cancelBtn.addEventListener("click", () => {
    updateBox.classList.add("hidden");
  });

  // Function to validate email
  function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  updateButtons.forEach(button => {
    button.addEventListener("click", function () {
      document.getElementById("password-prompt-box").style.display = "block";
      document.getElementById("tracking-modal").style.display = "none";
    });
  });

  document.getElementById("cancel-btn").addEventListener("click", function () {
    document.getElementById("update-box").style.display = "none";
    document.getElementById("password-prompt-box").style.display = "none";
    window.location.reload();

  });

  document.getElementById("cancel-password-btn").addEventListener("click", function () {
    document.getElementById("password-prompt-box").style.display = "none";
    window.location.reload();

  });

  document.getElementById("track-orders-btn").addEventListener("click", function () {
    document.getElementById("tracking-modal").style.display = "block";
    document.getElementById("password-prompt-box").style.display = "none";
  });

  document.getElementById("close-tracking-btn").addEventListener("click", function () {
    document.getElementById("tracking-modal").style.display = "none";
    window.location.reload();
  });

  document.getElementById("track-btn").addEventListener("click", async function () {
    const trackingNo = document.getElementById("tracking-number").value;
    if (trackingNo.trim() === "") {
      alert("Please enter a tracking number.");
      return;
    }
    try {
      const response = await fetch(`/delivery/trackingOrder/${trackingNo}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to Track Orders!");
      const data = await response.json();
      console.log(data.error);


      const trackingInfoDiv = document.getElementById("tracking-info");




      const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      };

      if (data.error === "Tracking number not found.") {
        trackingInfoDiv.innerHTML = `
      <p>Invalid Tracking Number!</p>
    `;
      } else {

        if (data.deliveredDate === "null") {
          data.deliveredDate = "-";
        }
        trackingInfoDiv.innerHTML = `
      <p>Order Status: ${data.status}</p>
      <p>Delivery Type: ${data.deliveryType}</p>
      <p>Delivery Start Date: ${formatDate(data.deliveryStartDate)}</p>
      <p>Delivered Date: ${formatDate(data.deliveredDate)}</p>
    `;
      }

    } catch (error) {
      alert(error);
    }
  });


});

const logoutLink = document.getElementById("logout-link"); // Logout button
    // Logout functionality
    if (logoutLink) {
        logoutLink.addEventListener("click", function () {
            localStorage.clear(); // Clear localStorage
            window.location.href = "../index.html"; // Redirect to the public index page
        });
    }

// // Endpoint: Get referral dashboard data
// app.get("/api/referral", async (req, res) => {
//   try {
//     // Example user ID (use auth middleware or session in production)
//     const userId = 1;

//     // Fetch user data
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         referralCode: true,
//         referrals: {
//           select: {
//             refereeEmail: true,
//             status: true,
//             reward: true,
//           },
//         },
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json({
//       referralCode: user.referralCode,
//       referrals: user.referrals,
//     });
//   } catch (error) {
//     console.error("Error fetching referral data:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Endpoint: Get potential rewards
// app.get("/api/rewards", (req, res) => {
//   const potentialRewards = [
//     { points: 50, reward: "10% Discount Coupon" },
//     { points: 100, reward: "Free Shipping on Next Order" },
//     { points: 200, reward: "$20 Gift Card" },
//     { points: 500, reward: "Exclusive Merchandise" },
//   ];

//   res.json(potentialRewards);
// });

// // Endpoint: Add a referral
// app.post("/api/referral", async (req, res) => {
//   try {
//     const { refereeEmail, referralCode } = req.body;

//     // Check if referralCode exists
//     const referrer = await prisma.user.findUnique({
//       where: { referralCode },
//     });

//     if (!referrer) {
//       return res.status(404).json({ error: "Invalid referral code" });
//     }

//     // Add the referral
//     const referral = await prisma.referral.create({
//       data: {
//         refereeEmail,
//         referrerId: referrer.id,
//         status: "pending", // Initially set to pending
//       },
//     });

//     res.status(201).json(referral);
//   } catch (error) {
//     console.error("Error adding referral:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });