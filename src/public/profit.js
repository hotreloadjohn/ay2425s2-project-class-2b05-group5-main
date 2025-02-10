// Mock data function to generate random values for sales, revenue, and orders
function generateMockData() {
  const totalSales = (Math.random() * 100000).toFixed(2); // Random number up to $100,000
  const totalRevenue = (Math.random() * 200000).toFixed(2); // Random number up to $200,000
  const totalOrders = Math.floor(Math.random() * 5000) + 1000; // Random number between 1000 and 6000 orders

  return {
      sales: totalSales,
      revenue: totalRevenue,
      orders: totalOrders
  };
}

// Function to update the key metrics with mock data
function updateMetrics() {
  const mockData = generateMockData();

  document.getElementById('total-sales').textContent = `$${mockData.sales}`;
  document.getElementById('total-revenue').textContent = `$${mockData.revenue}`;
  document.getElementById('total-orders').textContent = mockData.orders;
}

// Mock data function to generate random orders
function generateMockOrders(numOrders) {
  const orderStatuses = ['Processing', 'Shipped', 'Delivered', 'Canceled'];
  const customers = ['John Doe', 'Jane Smith', 'Alice Brown', 'Bob White', 'Charlie Green'];
  const orders = [];

  for (let i = 0; i < numOrders; i++) {
      const orderId = `ORD-${Math.floor(Math.random() * 10000) + 1}`; // Random Order ID
      const customer = customers[Math.floor(Math.random() * customers.length)]; // Random Customer
      const total = (Math.random() * 500).toFixed(2); // Random Total up to $500
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]; // Random Status
      orders.push({ orderId, customer, total, status });
  }
  return orders;
}

// Function to update the table with mock order data
function updateRecentOrders() {
  const orders = generateMockOrders(5); // Generate 5 random orders
  const tableBody = document.getElementById('recentOrdersTableBody');
  tableBody.innerHTML = ''; // Clear existing table rows

  orders.forEach(order => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${order.orderId}</td>
          <td>${order.customer}</td>
          <td>$${order.total}</td>
          <td>
              <span class="order-status">${order.status}</span>
              <button onclick="openChangeStatusModal('${order.orderId}')">Change Status</button>
          </td>
      `;
      tableBody.appendChild(row);
  });
}

// Function to open the modal for changing the order status
function openChangeStatusModal(orderId) {
  const modal = document.getElementById('changeStatusModal');
  modal.style.display = 'block';
  // You can store the orderId in the modal and use it later when saving the new status
  // Example: document.getElementById('orderIdInModal').textContent = orderId;
}

// Function to save the new status when the 'Save' button is clicked
document.getElementById('saveStatusButton').onclick = function() {
  const status = document.getElementById('statusSelect').value;
  // Handle saving the status (you would typically update the status in your data here)
  console.log(`Order status changed to: ${status}`);
  document.getElementById('changeStatusModal').style.display = 'none';
}

// Update the metrics and recent orders when the page loads
window.onload = function() {
  updateMetrics();
  updateRecentOrders();
};

// Function to update the table with mock order data
function updateRecentOrders() {
  const orders = generateMockOrders(5); // Generate 5 random orders
  const tableBody = document.getElementById('recentOrdersTableBody');
  tableBody.innerHTML = ''; // Clear existing table rows

  orders.forEach(order => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${order.orderId}</td>
          <td>${order.customer}</td>
          <td>$${order.total}</td>
          <td>
              <span class="order-status">${order.status}</span>
              <div class="actions">
                  <button onclick="openChangeStatusModal('${order.orderId}')">Change Status</button>
              </div>
          </td>
      `;
      tableBody.appendChild(row);
  });
}


// const apiUrl = 'https://example.com/api'; // Replace with your actual API endpoint

// // Function to fetch and display recent orders
// function populateRecentOrders() {
//     fetch(`${apiUrl}/orders/recent`)
//         .then((response) => response.json())
//         .then((orders) => {
//             const tableBody = document.getElementById('recentOrdersTableBody');
//             tableBody.innerHTML = ''; // Clear existing rows

//             orders.forEach((order) => {
//                 const row = document.createElement('tr');

//                 // Order ID
//                 const idCell = document.createElement('td');
//                 idCell.textContent = order.id;
//                 row.appendChild(idCell);

//                 // Customer Name
//                 const customerCell = document.createElement('td');
//                 customerCell.textContent = order.customer.name;
//                 row.appendChild(customerCell);

//                 // Total
//                 const totalCell = document.createElement('td');
//                 totalCell.textContent = `$${order.total.toFixed(2)}`;
//                 row.appendChild(totalCell);

//                 // Status
//                 const statusCell = document.createElement('td');
//                 statusCell.textContent = order.status.text;
//                 row.appendChild(statusCell);

//                 // Actions (Change Status button)
//                 const actionsCell = document.createElement('td');
//                 const changeButton = document.createElement('button');
//                 changeButton.className = 'btn btn-primary btn-sm';
//                 changeButton.textContent = 'Change Status';
//                 changeButton.onclick = () => openChangeStatusModal(order.id, order.status.id);
//                 actionsCell.appendChild(changeButton);
//                 row.appendChild(actionsCell);

//                 tableBody.appendChild(row);
//             });
//         })
//         .catch((error) => {
//             console.error('Error fetching recent orders:', error);
//             alert('Failed to load recent orders. Please try again later.');
//         });
// }

// // Replace static chart data with fetched data
// function updateRevenueChart() {
//     fetch(`${apiUrl}/revenue`)
//         .then((response) => response.json())
//         .then((data) => {
//             revenueChart.data.labels = data.months;
//             revenueChart.data.datasets[0].data = data.revenue;
//             revenueChart.update();
//         })
//         .catch((error) => console.error('Error fetching revenue data:', error));
// }

// // Example: Populate sales by category
// function updateSalesByCategoryChart() {
//     fetch(`${apiUrl}/sales/category`)
//         .then((response) => response.json())
//         .then((data) => {
//             salesByCategoryChart.data.labels = data.categories;
//             salesByCategoryChart.data.datasets[0].data = data.sales;
//             salesByCategoryChart.update();
//         })
//         .catch((error) => console.error('Error fetching sales data:', error));
// }

// // Add event listener to load all data when the DOM is ready
// document.addEventListener('DOMContentLoaded', () => {
//     populateRecentOrders();
//     updateRevenueChart();
//     updateSalesByCategoryChart();
// });

// // Mock Data for Testing
// const mockData = {
//   months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
//   revenue: [10000, 20000, 15000, 30000, 25000, 40000, 35000],
//   sales: [200, 400, 300, 600, 500, 800, 700],
//   categories: ["Electronics", "Clothing", "Home & Garden", "Beauty", "Sports"],
//   salesByCategory: [15000, 12000, 8000, 7000, 10000],
//   recentOrders: [
//       { id: "ORD001", customer: { name: "John Doe" }, total: 250.50, status: { id: 1, text: "Completed" } },
//       { id: "ORD002", customer: { name: "Jane Smith" }, total: 120.00, status: { id: 2, text: "Pending" } },
//       { id: "ORD003", customer: { name: "Mike Johnson" }, total: 300.75, status: { id: 3, text: "Cancelled" } }
//   ],
//   statuses: [
//       { id: 1, text: "Completed" },
//       { id: 2, text: "Pending" },
//       { id: 3, text: "Cancelled" },
//       { id: 4, text: "Processing" }
//   ]
// };

// // Use mockData to populate your charts and tables
// updateRevenueChart(mockData.revenue, mockData.months);
// updateSalesByCategoryChart(mockData.categories, mockData.salesByCategory);
// populateRecentOrders(mockData.recentOrders);

// // Mock data function to generate random values for sales, revenue, and orders
// function generateMockData() {
//   // Mock data for sales, revenue, and orders
//   const totalSales = (Math.random() * 100000).toFixed(2); // Random number up to $100,000
//   const totalRevenue = (Math.random() * 200000).toFixed(2); // Random number up to $200,000
//   const totalOrders = Math.floor(Math.random() * 5000) + 1000; // Random number between 1000 and 6000 orders

//   return {
//       sales: totalSales,
//       revenue: totalRevenue,
//       orders: totalOrders
//   };
// }

// // Function to update the page with the generated mock data
// function updateMetrics() {
//   const mockData = generateMockData();

//   // Updating the HTML elements with mock data
//   document.getElementById('total-sales').textContent = `$${mockData.sales}`;
//   document.getElementById('total-revenue').textContent = `$${mockData.revenue}`;
//   document.getElementById('total-orders').textContent = mockData.orders;
// }

// // Update the metrics when the page loads
// window.onload = updateMetrics;

// // Mock data function to generate random orders
// function generateMockOrders(numOrders) {
//   const orderStatuses = ['Processing', 'Shipped', 'Delivered', 'Canceled'];
//   const customers = ['John Doe', 'Jane Smith', 'Alice Brown', 'Bob White', 'Charlie Green'];
//   const orders = [];

//   for (let i = 0; i < numOrders; i++) {
//       const orderId = `ORD-${Math.floor(Math.random() * 10000) + 1}`; // Random Order ID
//       const customer = customers[Math.floor(Math.random() * customers.length)]; // Random Customer
//       const total = (Math.random() * 500).toFixed(2); // Random Total up to $500
//       const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]; // Random Status
//       orders.push({ orderId, customer, total, status });
//   }
//   return orders;
// }

// // Function to update the table with mock order data
// function updateRecentOrders() {
//   const orders = generateMockOrders(5); // Generate 5 random orders
//   const tableBody = document.getElementById('recentOrdersTableBody');
//   tableBody.innerHTML = ''; // Clear existing table rows

//   orders.forEach(order => {
//       const row = document.createElement('tr');
//       row.innerHTML = `
//           <td>${order.orderId}</td>
//           <td>${order.customer}</td>
//           <td>$${order.total}</td>
//           <td>
//               <span class="order-status">${order.status}</span>
//               <button onclick="openChangeStatusModal('${order.orderId}')">Change Status</button>
//           </td>
//       `;
//       tableBody.appendChild(row);
//   });
// }

// // Function to open the modal for changing the order status
// function openChangeStatusModal(orderId) {
//   const modal = document.getElementById('changeStatusModal');
//   modal.style.display = 'block';
//   // You can store the orderId in the modal and use it later when saving the new status
//   // Example: document.getElementById('orderIdInModal').textContent = orderId;
// }

// // Function to save the new status when the 'Save' button is clicked
// document.getElementById('saveStatusButton').onclick = function() {
//   const status = document.getElementById('statusSelect').value;
//   // Handle saving the status (you would typically update the status in your data here)
//   console.log(`Order status changed to: ${status}`);
//   document.getElementById('changeStatusModal').style.display = 'none';
// }

// // Update the recent orders when the page loads
// window.onload = updateRecentOrders;