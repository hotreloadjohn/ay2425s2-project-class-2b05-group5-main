document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const personId = urlParams.get('personId');

    if (sessionId && personId) {
        // Mark the cart as inactive
        fetch('/carts/makecartinactive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ personId: parseInt(personId, 10) }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Cart marked as inactive:', data);
            })
            .catch(err => {
                console.error('Error updating cart:', err);
            });
        } else {
        console.error('Missing session_id or personId in the URL.');
    }
});

const logoutLink = document.getElementById("logout-link"); // Logout button
    // Logout functionality
    if (logoutLink) {
        logoutLink.addEventListener("click", function () {
            localStorage.clear(); // Clear localStorage
            window.location.href = "../index.html"; // Redirect to the public index page
        });
    }