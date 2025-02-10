document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "supplier") {
        alert("You must be logged in as a supplier to access this page.");
        window.location.href = "../";
        return;
    }
    
    document.getElementById("logged-in-navbar").style.display = "flex";
    
    document.getElementById("logout-link").addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.clear();
        alert("You have been logged out.");
        window.location.href = "/login.html";
    });
    
    const productTableBody = document.querySelector("#product-table tbody");
    const expiredProductsTable = document.querySelector("#expired-products-table tbody");
    const expiredProductsSection = document.getElementById("expired-products-section");
    const confirmationModal = document.getElementById("confirmation-modal");
    const addStockModal = document.getElementById("add-stock-modal");
    
    let deleteProductId = null;
    let selectedProductId = null;
    
    async function fetchProducts(searchTerm = "", sortBy = "") {
        try {
            const response = await fetch(`/crProduct/getAll?search=${searchTerm}&sort=${sortBy}`);
            if (!response.ok) throw new Error("Failed to fetch products.");
            const products = await response.json();
            
            productTableBody.innerHTML = products.map(product => `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.unitPrice}</td>
                    <td>${product.description}</td>
                    <td>${product.totalStock}</td>
                    <td>
                        <button class="update-btn" data-id="${product.id}">Update</button>
                        <button class="delete-btn" data-id="${product.id}">Delete</button>
                        <button class="add-stock-btn" data-id="${product.id}">Add Stock</button>
                    </td>
                </tr>
            `).join("");
            attachEventListeners();
        } catch (error) {
            console.error(error.message);
        }
    }
    
    async function fetchExpiredStock() {
        try {
            const response = await fetch("/crProduct/expiredStock");
            if (!response.ok) throw new Error("Failed to fetch expired stock.");
            const expiredProducts = await response.json();
            
            expiredProductsTable.innerHTML = expiredProducts.map(product => `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.productId}</td>
                    <td>${product.quantity}</td>
                    <td>${new Date(product.expiryDate).toLocaleDateString()}</td>
                    <td>${product.isAvailable}</td>
                </tr>
            `).join("");
            
            expiredProductsSection.style.display = expiredProducts.length ? "block" : "none";
        } catch (error) {
            console.error(error.message);
        }
    }
    
    function attachEventListeners() {
        document.querySelectorAll(".update-btn").forEach(btn =>
            btn.addEventListener("click", e => window.location.href = `updateProduct.html?productId=${e.target.dataset.id}`)
        );
        
        document.querySelectorAll(".delete-btn").forEach(btn =>
            btn.addEventListener("click", e => {
                deleteProductId = e.target.dataset.id;
                confirmationModal.style.display = "block";
            })
        );
        
        document.querySelectorAll(".add-stock-btn").forEach(btn =>
            btn.addEventListener("click", e => {
                selectedProductId = e.target.dataset.id;
                addStockModal.style.display = "block";
            })
        );
        
        document.getElementById("filter-btn").addEventListener("click", () => {
            fetchProducts(
                document.getElementById("search-product").value,
                document.getElementById("sort-by").value
            );
        });
    }
    
    document.getElementById("confirm-delete-btn").addEventListener("click", async () => {
        try {
            await fetch(`/crProduct/delete/${deleteProductId}`, { method: "DELETE" });
            alert("Product deleted successfully.");
            fetchProducts();
            fetchExpiredStock();
        } catch (error) {
            console.error(error.message);
        }
        confirmationModal.style.display = "none";
    });
    
    document.getElementById("cancel-delete-btn").addEventListener("click", () => {
        confirmationModal.style.display = "none";
    });
    
    document.getElementById("confirm-add-stock-btn").addEventListener("click", async () => {
        const quantity = document.getElementById("stock-quantity").value;
        const expiryDate = document.getElementById("stock-expiry").value;
        
        if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
            return alert("Please enter a valid quantity (positive integer).");
        }
        if (!expiryDate) return alert("Enter stock expiry date!");
        
        await fetch(`/crProduct/addStock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: selectedProductId, quantity, expiryDate })
        });
        
        addStockModal.style.display = "none";
        fetchProducts();
        fetchExpiredStock();
    });
    
    document.getElementById("cancel-add-stock-btn").addEventListener("click", () => {
        addStockModal.style.display = "none";
    });
    
    fetchProducts();
    fetchExpiredStock();
});
