// // document.addEventListener("DOMContentLoaded", function () {
// //     fetchDeliveryData();
// // });

// // const statuses = ["PENDING", "PROCESSING", "PACKED", "SORTING", "OUTFORDELIVERY", "DELIVERED"];

// // function fetchDeliveryData() {
// //     fetch("/delivery/getAllDeliveryData")
// //         .then(response => response.json())
// //         .then(data => displayDeliveries(data))
// //         .catch(error => console.error("Error fetching delivery data:", error));
// // }

// // function displayDeliveries(deliveries) {
// //     const tableBody = document.getElementById("deliveryTableBody");
// //     tableBody.innerHTML = "";

// //     deliveries.forEach(delivery => {
// //         const row = document.createElement("tr");
// //         row.setAttribute("data-id", delivery.orderId); // Add data-orderid attribute to each row

// //         row.innerHTML = `
// //             <td>${delivery.id}</td>
// //             <td>${delivery.orderId}</td>
// //             <td>${delivery.deliveryNo}</td>
// //             <td>${delivery.name}</td>
// //             <td>${delivery.address}</td>
// //             <td>${delivery.unit}</td>
// //             <td>${delivery.postalCode}</td>
// //             <td>${delivery.phoneNumber}</td>
// //             <td>${delivery.notes}</td>
// //             <td>${new Date(delivery.deliveryStartDate).toLocaleString()}</td>
// //             <td>${delivery.deliveredDate ? new Date(delivery.deliveredDate).toLocaleString() : "N/A"}</td>
// //             <td>${delivery.deliveryType}</td>
// //             <td>${delivery.status}</td>
// //             <td>
// //                 <div class="status-container">
// //                     <select class="status-dropdown" onchange="confirmStatusChange(${delivery.orderId}, this.value)">
// //                         ${statuses.map(status => `<option value="${status}" ${status === delivery.status ? "selected" : ""}>${status}</option>`).join("")}
// //                     </select>
// //                     <button onclick="toggleStatusDropdown(${delivery.orderId})">Update</button>
// //                 </div>
// //             </td>
// //         `;

// //         tableBody.appendChild(row);
// //     });
// // }

// // function toggleStatusDropdown(orderId) {
// //     const row = document.querySelector(`#deliveryTableBody tr[data-id="${orderId}"]`);
    
// //     if (!row) {
// //         console.error(`❌ No row found for orderId: ${orderId}`);
// //         return;
// //     }

// //     const dropdown = row.querySelector(".status-dropdown");

// //     if (!dropdown) {
// //         console.error(`❌ No status dropdown found for orderId: ${orderId}`);
// //         return;
// //     }

// //     dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
// // }

// // function confirmStatusChange(id, newStatus) {
// //     const confirmChange = confirm("Are you sure you want to change the status?");
// //     if (confirmChange) {
// //         updateStatus(id, newStatus);
// //     } else {
// //         fetchDeliveryData(); // Reset dropdown to previous value
// //     }
// // }

// // function updateStatus(id, status) {
// //     fetch(`/delivery/updateStatus/${id}`, {
// //         method: "PUT",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ status })
// //     })
// //     .then(response => response.json())
// //     .then(data => {
// //         alert("Status updated successfully!");
// //         fetchDeliveryData(); // Refresh table
// //     })
// //     .catch(error => console.error("Error updating status:", error));
// // }

// // document.getElementById("logout-button").addEventListener("click", function () {
// //     localStorage.clear(); // Remove all stored data
// //     window.location.href = "../login.html"; // Redirect to login page
// // });






// document.addEventListener("DOMContentLoaded", function () {
//     fetchDeliveryData();
//     populateStatusFilter();
// });

// const statuses = ["PENDING", "PROCESSING", "PACKED", "SORTING", "OUTFORDELIVERY", "DELIVERED"];

// // Fetch delivery data
// function fetchDeliveryData() {
//     fetch("/delivery/getAllDeliveryData")
//         .then(response => response.json())
//         .then(data => displayDeliveries(data))
//         .catch(error => console.error("Error fetching delivery data:", error));
// }

// // Populate status filter dropdown
// function populateStatusFilter() {
//     const statusFilter = document.getElementById("statusFilter");

//     statuses.forEach(status => {
//         const option = document.createElement("option");
//         option.value = status;
//         option.textContent = status;
//         statusFilter.appendChild(option);
//     });

//     statusFilter.addEventListener("change", applyStatusFilter);
// }

// // Display deliveries with filtering
// function displayDeliveries(deliveries) {
//     const tableBody = document.getElementById("deliveryTableBody");
//     tableBody.innerHTML = "";

//     const selectedStatus = document.getElementById("statusFilter").value;

//     deliveries
//         .filter(delivery => !selectedStatus || delivery.status === selectedStatus) // Apply filter
//         .forEach(delivery => {
//             const row = document.createElement("tr");
//             row.setAttribute("data-id", delivery.orderId);

//             row.innerHTML = `
//                 <td>${delivery.id}</td>
//                 <td>${delivery.orderId}</td>
//                 <td>${delivery.deliveryNo}</td>
//                 <td>${delivery.name}</td>
//                 <td>${delivery.address}</td>
//                 <td>${delivery.unit}</td>
//                 <td>${delivery.postalCode}</td>
//                 <td>${delivery.phoneNumber}</td>
//                 <td>${delivery.notes}</td>
//                 <td>${new Date(delivery.deliveryStartDate).toLocaleString()}</td>
//                 <td>${delivery.deliveredDate ? new Date(delivery.deliveredDate).toLocaleString() : "N/A"}</td>
//                 <td>${delivery.deliveryType}</td>
//                 <td>${delivery.status}</td>
//                 <td>
//                     <div class="status-container">
//                         <select class="status-dropdown" onchange="confirmStatusChange(${delivery.orderId}, this.value)">
//                             ${statuses.map(status => `<option value="${status}" ${status === delivery.status ? "selected" : ""}>${status}</option>`).join("")}
//                         </select>
//                         <button onclick="toggleStatusDropdown(${delivery.orderId})">Update</button>
//                     </div>
//                 </td>
//             `;

//             tableBody.appendChild(row);
//         });
// }

// // Apply filter when status is selected
// function applyStatusFilter() {
//     fetchDeliveryData();
// }

// // Toggle status dropdown visibility
// function toggleStatusDropdown(id) {
//     const row = document.querySelector(`#deliveryTableBody tr[data-id="${id}"]`);
//     const dropdown = row.querySelector(".status-dropdown");
//     dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
// }

// // Confirm and update status
// function confirmStatusChange(id, newStatus) {
//     const confirmChange = confirm("Are you sure you want to change the status?");
//     if (confirmChange) {
//         updateStatus(id, newStatus);
//     } else {
//         fetchDeliveryData(); // Reset dropdown to previous value
//     }
// }

// // Send status update request
// function updateStatus(id, status) {
//     fetch(`/delivery/updateStatus/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status })
//     })
//     .then(response => response.json())
//     .then(data => {
//         alert("Status updated successfully!");
//         fetchDeliveryData(); // Refresh table
//     })
//     .catch(error => console.error("Error updating status:", error));
// }

// // Logout and clear session
// document.getElementById("logout-button").addEventListener("click", function () {
//     localStorage.clear(); 
//     window.location.href = "../login.html";
// });




// document.addEventListener("DOMContentLoaded", function () {
//     fetchDeliveryData();
//     populateStatusFilter();
// });

// const statuses = ["PENDING", "PROCESSING", "PACKED", "SORTING", "OUTFORDELIVERY", "DELIVERED"];

// // Fetch delivery data
// function fetchDeliveryData() {
//     fetch("/delivery/getAllDeliveryData")
//         .then(response => response.json())
//         .then(data => displayDeliveries(data))
//         .catch(error => console.error("Error fetching delivery data:", error));
// }

// // Populate status filter dropdown
// function populateStatusFilter() {
//     const statusFilter = document.getElementById("statusFilter");

//     statuses.forEach(status => {
//         const option = document.createElement("option");
//         option.value = status;
//         option.textContent = status;
//         statusFilter.appendChild(option);
//     });

//     statusFilter.addEventListener("change", applyStatusFilter);
// }

// // Display deliveries with filtering
// function displayDeliveries(deliveries) {
//     const tableBody = document.getElementById("deliveryTableBody");
//     tableBody.innerHTML = ""; // Clear table before displaying data

//     const selectedStatus = document.getElementById("statusFilter").value;

//     // Filter the deliveries based on selected status
//     const filteredDeliveries = deliveries.filter(delivery => 
//         !selectedStatus || delivery.status === selectedStatus
//     );

//     // If no data matches, display "No data available"
//     if (filteredDeliveries.length === 0) {
//         tableBody.innerHTML = `<tr><td colspan="15" style="text-align:center;">No data available.</td></tr>`;
//         return;
//     }

//     // Populate the table with filtered deliveries
//     filteredDeliveries.forEach(delivery => {
//         const row = document.createElement("tr");
//         row.setAttribute("data-id", delivery.orderId);

//         row.innerHTML = `
//             <td>${delivery.id}</td>
//             <td>${delivery.orderId}</td>
//             <td>${delivery.deliveryNo}</td>
//             <td>${delivery.name}</td>
//             <td>${delivery.address}</td>
//             <td>${delivery.unit}</td>
//             <td>${delivery.postalCode}</td>
//             <td>${delivery.phoneNumber}</td>
//             <td>${delivery.notes}</td>
//             <td>${new Date(delivery.deliveryStartDate).toLocaleString()}</td>
//             <td>${delivery.deliveredDate ? new Date(delivery.deliveredDate).toLocaleString() : "N/A"}</td>
//             <td>${delivery.deliveryType}</td>
//             <td>${delivery.status}</td>
//             <td>
//                 <div class="status-container">
//                     <select class="status-dropdown" onchange="confirmStatusChange(${delivery.orderId}, this.value)">
//                         ${statuses.map(status => 
//                             `<option value="${status}" ${status === delivery.status ? "selected" : ""}>${status}</option>`
//                         ).join("")}
//                     </select>
//                     <button onclick="toggleStatusDropdown(${delivery.orderId})">Update</button>
//                 </div>
//             </td>
//         `;

//         tableBody.appendChild(row);
//     });
// }

// // Apply filter when status is selected
// function applyStatusFilter() {
//     fetchDeliveryData();
// }

// // Toggle status dropdown visibility
// function toggleStatusDropdown(id) {
//     const row = document.querySelector(`#deliveryTableBody tr[data-id="${id}"]`);
//     const dropdown = row.querySelector(".status-dropdown");
//     dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
// }

// // Confirm and update status
// function confirmStatusChange(id, newStatus) {
//     const confirmChange = confirm("Are you sure you want to change the status?");
//     if (confirmChange) {
//         updateStatus(id, newStatus);
//     } else {
//         fetchDeliveryData(); // Reset dropdown to previous value
//     }
// }

// // Send status update request
// function updateStatus(id, status) {
//     fetch(`/delivery/updateStatus/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status })
//     })
//     .then(response => response.json())
//     .then(data => {
//         alert("Status updated successfully!");
//         fetchDeliveryData(); // Refresh table
//     })
//     .catch(error => console.error("Error updating status:", error));
// }

// // Logout and clear session
// document.getElementById("logout-button").addEventListener("click", function () {
//     localStorage.clear(); 
//     window.location.href = "../login.html";
// });




document.addEventListener("DOMContentLoaded", function () {
    fetchDeliveryData();
    populateStatusFilter();
});

const statuses = ["PENDING", "PROCESSING", "PACKED", "SORTING", "OUTFORDELIVERY", "DELIVERED"];

// Fetch delivery data
function fetchDeliveryData() {
    fetch("/delivery/getAllDeliveryData")
        .then(response => response.json())
        .then(data => displayDeliveries(data))
        .catch(error => console.error("Error fetching delivery data:", error));
}

// Populate status filter dropdown
function populateStatusFilter() {
    const statusFilter = document.getElementById("statusFilter");

    statuses.forEach(status => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        statusFilter.appendChild(option);
    });

    statusFilter.addEventListener("change", applyStatusFilter);
}

// Display deliveries with filtering
function displayDeliveries(deliveries) {
    const tableBody = document.getElementById("deliveryTableBody");
    tableBody.innerHTML = ""; // Clear table before displaying data

    const selectedStatus = document.getElementById("statusFilter").value;

    // Filter the deliveries based on selected status
    const filteredDeliveries = deliveries.filter(delivery => 
        !selectedStatus || delivery.status === selectedStatus
    );

    // If no data matches, display "No data available"
    if (filteredDeliveries.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="15" style="text-align:center;">No data available.</td></tr>`;
        return;
    }

    // Populate the table with filtered deliveries
    filteredDeliveries.forEach(delivery => {
        const row = document.createElement("tr");
        row.setAttribute("data-id", delivery.orderId);

        row.innerHTML = `
            <td>${delivery.id}</td>
            <td>${delivery.orderId}</td>
            <td>${delivery.deliveryNo}</td>
            <td>${delivery.name}</td>
            <td>${delivery.address}</td>
            <td>${delivery.unit}</td>
            <td>${delivery.postalCode}</td>
            <td>${delivery.phoneNumber}</td>
            <td>${delivery.notes}</td>
            <td>${new Date(delivery.deliveryStartDate).toLocaleString()}</td>
            <td>${delivery.deliveredDate ? new Date(delivery.deliveredDate).toLocaleString() : "N/A"}</td>
            <td>${delivery.deliveryType}</td>
            <td>${delivery.status}</td>
            <td>
                <div class="status-container">
                    <select class="status-dropdown" onchange="confirmStatusChange(${delivery.orderId}, this.value)" 
                        ${delivery.status === "DELIVERED" ? "disabled" : ""}>
                        ${statuses.map(status => 
                            `<option value="${status}" ${status === delivery.status ? "selected" : ""}>${status}</option>`
                        ).join("")}
                    </select>
                    ${delivery.status !== "DELIVERED" ? 
                        `<button onclick="toggleStatusDropdown(${delivery.orderId})">Update</button>` : ""}
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Apply filter when status is selected
function applyStatusFilter() {
    fetchDeliveryData();
}

// Toggle status dropdown visibility
function toggleStatusDropdown(id) {
    const row = document.querySelector(`#deliveryTableBody tr[data-id="${id}"]`);
    const dropdown = row.querySelector(".status-dropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Confirm and update status
function confirmStatusChange(id, newStatus) {
    const confirmChange = confirm("Are you sure you want to change the status?");
    if (confirmChange) {
        updateStatus(id, newStatus);
    } else {
        fetchDeliveryData(); // Reset dropdown to previous value
    }
}

// Send status update request
function updateStatus(id, status) {
    fetch(`/delivery/updateStatus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    })
    .then(response => response.json())
    .then(data => {
        alert("Status updated successfully!");
        fetchDeliveryData(); // Refresh table
    })
    .catch(error => console.error("Error updating status:", error));
}

// Logout and clear session
document.getElementById("logout-button").addEventListener("click", function () {
    localStorage.clear(); 
    window.location.href = "../login.html";
});
