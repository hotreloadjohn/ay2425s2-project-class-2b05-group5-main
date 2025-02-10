document.addEventListener("DOMContentLoaded", () => {
    const faqContainer = document.getElementById("faq-container");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const faqTabs = document.querySelectorAll(".faq-tab");

    const faqs = [
        { question: "What is the return policy?", answer: "You can return items within 7 days.", category: "returns" },
        { question: "How can I track my order?", answer: "Use the tracking link provided in your email.", category: "orders" },
        { question: "What payment methods are accepted?", answer: "We accept credit cards and PayPal.", category: "payments" },
        { question: "How long does it take to receive a response from customer service?", answer: "We aim to respond to all inquiries within 24 hours.", category: "support" },
        { question: "Can I change my shipping address?", answer: "Yes, contact support before shipment.", category: "orders" },
        { question: "Do you ship internationally?", answer: "No, we only ship in Singapore.", category: "shipping" },
        { question: "How do I reset my password?", answer: "Go to the 'Forgot Password' page to reset your password.", category: "account" },
        { question: "Are all products original?", answer: "Yes, we guarantee 100% authenticity for all products.", category: "products" },
        { question: "How do I use a discount code?", answer: "Enter the code at checkout to apply the discount.", category: "promotions" },
        { question: "Why isn't my coupon code working?", answer: "Ensure the code is still valid and applicable to your cart items.", category: "promotions" },
        { question: "What should I do if the website isn't loading?", answer: "Clear your browser cache and try again.", category: "technical" },
        { question: "Can I return a product without the original packaging?", answer: "No, we require the original packaging to process your return. This ensures the product is in resalable condition.", category: "returns" },
        { question: "What should I do if I receive a damaged item?", answer: "Please contact our customer support immediately with photos of the damaged item. We will assist with a replacement or refund.", category: "returns" },
        { question: "How long does it take to process a refund?", answer: "Refunds typically take 3-5 business days to appear in your account, depending on your bank or payment provider.", category: "returns" },
        { question: "How do I modify an existing order?", answer: "You can modify your order within 2 hour of placing it by contacting customer support.", category: "orders" },
        { question: "What does the 'Processing' status mean for my order?", answer: "It means your order is being prepared for shipment and cannot be modified.", category: "orders" },
        { question: "Can I cancel my order after it has been shipped?", answer: "No, once an order has been shipped, it cannot be canceled. However, you can initiate a return upon receipt.", category: "orders" },
        { question: "How can I reorder an item I previously purchased?", answer: " Log in to your account, go to 'Order History' and select the reorder option for the desired item.", category: "orders" },
        { question: "Are my payment details secure?", answer: "Yes, we use secure encryption protocols to protect your payment information.", category: "payments" },
        { question: "Why was my payment declined?", answer: "Common reasons include incorrect payment details, insufficient funds, or product is not available.", category: "payments" },
        { question: "Does my card get charged immediately upon placing an order?", answer: "Yes, your card is charged at the time of purchase.", category: "payments" },
        { question: "How can I check the shipping status of my order?", answer: "You can track your order using the tracking link provided in the confirmation email or through your account dashboard.", category: "shipping" },
        { question: "Do you offer express shipping?", answer: "Yes, we offer express shipping options at checkout for an additional fee.", category: "shipping" },
        { question: "Can I change the delivery address after placing an order?", answer: "Yes, but changes must be requested before the order is shipped. Contact customer support to request a change.", category: "shipping" },
        { question: "Can I delete my account permanently?", answer: "Yes, please contact customer support to request permanent account deletion.", category: "account" },
        { question: "How do I update my account details?", answer: "Log in to your account and navigate to the 'Profile' section to update your details.", category: "account" },
        { question: "Can I have multiple accounts using the same email address?", answer: "No, each email address can be associated with only one account.", category: "account" },
        { question: "How do I check the availability of a product?", answer: "Availability is displayed on the product page. If a product is out of stock, you can sign up for notifications.", category: "products" },
        { question: "Are all products in the store original and authentic?", answer: " Yes, we guarantee the authenticity of all products sold in our store.", category: "products" },
        { question: "Can I request a custom product design?", answer: "No, but we are try hard to provide this services soon", category: "products" },
        { question: "Is live chat available for customer service?", answer: "Yes, live chat is available during business hours. Look for the chat icon on the bottom right of our website.", category: "support" },
    ];

    const renderFAQs = (filteredFAQs) => {
        faqContainer.innerHTML = "";
        filteredFAQs.forEach((faq) => {
            const faqItem = document.createElement("div");
            faqItem.classList.add("faq-item");

            const question = document.createElement("div");
            question.classList.add("faq-question");
            question.textContent = faq.question;

            const answer = document.createElement("div");
            answer.classList.add("faq-answer");
            answer.textContent = faq.answer;

            question.addEventListener("click", () => {
                const isVisible = answer.style.display === "block";
                answer.style.display = isVisible ? "none" : "block";
            });

            faqItem.appendChild(question);
            faqItem.appendChild(answer);
            faqContainer.appendChild(faqItem);
        });
    };

    renderFAQs(faqs);

    // Search functionality
    searchButton.addEventListener("click", () => {
        const query = searchInput.value.toLowerCase();
        const filteredFAQs = faqs.filter((faq) =>
            faq.question.toLowerCase().includes(query)
        );

        renderFAQs(filteredFAQs);

        // Automatically show answers if they match the query
        if (query.trim()) {
            const faqItems = faqContainer.querySelectorAll(".faq-item");
            faqItems.forEach((item) => {
                const question = item.querySelector(".faq-question");
                const answer = item.querySelector(".faq-answer");
                if (question.textContent.toLowerCase().includes(query)) {
                    answer.style.display = "block"; // Show the answer
                }
            });
        }
    });

    // Tab filtering
    faqTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            faqTabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");

            const category = tab.getAttribute("data-category");
            const filteredFAQs = category === "all" ? faqs : faqs.filter((faq) => faq.category === category);
            renderFAQs(filteredFAQs);
        });
    });

    // Logout functionality
     const logoutLink = document.getElementById("logout-link");

    if (logoutLink) {
        logoutLink.addEventListener("click", function (event) {
         event.preventDefault(); 
      
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
