// Helper function to format date as "DD/MM/YYYY"
function formatDate(dateString) {
    if (!dateString || dateString === "-") return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

async function fetchRefundData() {
    try {
        const response = await fetch("/delivery/getRefundData");
        const refundData = await response.json();

        if (!Array.isArray(refundData)) {
            console.error("Invalid data format:", refundData);
            return [];
        }

        return refundData;
    } catch (error) {
        console.error("Error fetching refund data:", error);
        return [];
    }
}

async function applyFilter() {
    const filterValue = document.getElementById("filterDropdown").value.toLowerCase();
    const refundData = await fetchRefundData();

    const filteredRefunds = refundData.filter(refund =>
        filterValue === "all" ||
        (refund.status && refund.status.trim().toLowerCase() === filterValue)
    );

    renderTable(filteredRefunds);
}

function renderTable(refunds) {
    const tableBody = document.getElementById("returnTableBody");
    tableBody.innerHTML = ""; // Clear existing table content

    // If no data is available, show a message
    if (refunds.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="11" class="no-data-message">No data available.</td>
            </tr>
        `;
        return;
    }

    refunds.forEach(refund => {
        const row = document.createElement("tr");

        // Handle proof images: Parse JSON string
        let proofImagesHtml = "-"; // Default value
        if (refund.proofImages) {
            try {
                const proofImages = JSON.parse(refund.proofImages);
                if (Array.isArray(proofImages) && proofImages.length > 0) {
                    proofImagesHtml = proofImages.map(image => `
                        <div class="refund-image">
                            <a href="../../refund_images/${refund.deliveryNo}/${image.filename}" target="_blank">
                                <img src="../../refund_images/${refund.deliveryNo}/${image.filename}" 
                                     alt="Proof Image" class="refund-image-thumbnail">
                            </a>
                        </div>
                    `).join(""); // Display multiple images as thumbnails
                }
            } catch (error) {
                console.error("Error parsing proof images:", error);
            }
        }

        // Determine if the update button should be hidden
        const isFinalStage = refund.status === "APPROVED" || refund.status === "REJECTED";
        const updateButtonHtml = isFinalStage
            ? ""  // If final stage, do not show the button
            : `<button onclick="toggleUpdateForm(${refund.id})">Update</button>`;

        row.innerHTML = `
            <td>${refund.id}</td>
            <td>${refund.orderId}</td>
            <td>${refund.deliveryNo || "-"}</td>
            <td>${refund.issueType}</td>
            <td>${refund.issueDescription || "-"}</td>
            <td>${proofImagesHtml}</td>
            <td>${formatDate(refund.createdAt)}</td>
            <td class="refund-status">${refund.status}</td>
            <td>${refund.updatedAt && refund.updatedAt !== "null" ? formatDate(refund.updatedAt) : "-"}</td>
            <td>${refund.reason || "-"}</td>
            <td>
                <div class="status-container" id="status-container-${refund.id}">
                    ${updateButtonHtml}
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to toggle (show/hide) the update form inside the status container
function toggleUpdateForm(refundId) {
    const container = document.getElementById(`status-container-${refundId}`);
    let form = container.querySelector(".update-form");

    // If the form already exists, do nothing (or toggle its visibility if desired)
    if (form) {
        return;
    }

    // Hide the original update button
    container.querySelector("button").style.display = "none";

    // Create the update form
    form = document.createElement("div");
    form.classList.add("update-form");
    form.innerHTML = `
        <select class="update-status-dropdown" id="update-status-dropdown-${refundId}">
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="PENDING">PENDING</option> <!-- Added more stages if necessary -->
        </select>
        <br>
        <textarea placeholder="Enter reason..." class="update-reason" id="update-reason-${refundId}"></textarea>
        <br>
        <button class="confirm-btn" onclick="confirmStatusChange(${refundId})">Update</button>
        <button class="cancel-btn" onclick="cancelUpdateForm(${refundId})">Cancel</button>
    `;
    container.appendChild(form);
}

// Function to cancel the update form and revert to the original update button
function cancelUpdateForm(refundId) {
    const container = document.getElementById(`status-container-${refundId}`);
    const form = container.querySelector(".update-form");
    if (form) {
        container.removeChild(form);
    }
    // Show the original update button again
    const updateButton = container.querySelector("button");
    if (updateButton) {
        updateButton.style.display = "inline-block";
    }
}

// Function to update refund status using the dropdown value and reason
async function confirmStatusChange(refundId) {
    const dropdown = document.getElementById(`update-status-dropdown-${refundId}`);
    const newStatus = dropdown.value;
    const reasonField = document.getElementById(`update-reason-${refundId}`);
    const reason = reasonField.value;

    try {
        const response = await fetch(`/delivery/updateRefundStatus/${refundId}`, {
            method: "PUT", // Using PUT as per your route example
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus, reason: reason }),
        });

        // If status is 204 (No Content), we do not parse JSON
        if (response.status === 204) {
            alert("Status updated successfully!");
            location.reload(); // Refresh the page to show the updated status
        } else {
            // Otherwise, try to parse the response
            const result = await response.json();
            alert("Failed to update status: " + result.message);
        }
    } catch (error) {
        console.error("Error updating refund status:", error);
        alert("An error occurred while updating status.");
    }
}

// Initial load of data and filter functionality
document.addEventListener("DOMContentLoaded", async () => {
    await applyFilter();
});

// Function for logging out
document.getElementById("logout-button").addEventListener("click", function () {
    localStorage.clear(); // Remove all stored data
    window.location.href = "../login.html"; // Redirect to login page
});
