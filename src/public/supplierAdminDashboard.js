document.addEventListener('DOMContentLoaded', async () => {
    // Get user ID and role from localStorage
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Get navbar elements
    const loggedInNavbar = document.getElementById("logged-in-navbar");
    const publicNavbar = document.getElementById("public-navbar");

    // Check if the user is logged in and is an admin
    if (token && role === 'admin') {
        loggedInNavbar.style.display = 'block';
        if (publicNavbar) publicNavbar.style.display = 'none';
    } else {
        loggedInNavbar.style.display = 'none';
        if (publicNavbar) publicNavbar.style.display = 'block';
        alert('You must be logged in as an admin to access this page.');
        window.location.href = '/login.html';  
        return;
    }

    // Logout functionality
    document.getElementById('logout-link').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior

        // Clear localStorage and redirect to login page
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        alert('You have been logged out.');
        window.location.href = '/login.html';
    });

    if (token && role === 'admin') {
        const barChart = echarts.init(document.getElementById('bar-chart'));

        const barChartOptions = {
            title: {
                text: 'Top Companies by Approvals',
                left: 'center',
                top: 20
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} approvals'
            },
            xAxis: {
                type: 'category',
                data: [] // Initially empty
            },
            yAxis: {
                type: 'value',
                name: 'Approvals'
            },
            series: [{
                data: [], // Initially empty
                type: 'bar',
                barWidth: '40%',
                itemStyle: {
                    borderRadius: 4
                }
            }]
        };

        barChart.setOption(barChartOptions);

        try {
            // Fetch statistics
            const statsResponse = await fetch("/supplier/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const statsData = await statsResponse.json();

            document.getElementById("total-applications").textContent = `Total: ${statsData.total}`;
            document.getElementById("approved-applications").textContent = `Approved: ${statsData.approved}`;
            document.getElementById("rejected-applications").textContent = `Rejected: ${statsData.rejected}`;

            // Fetch top companies
            const companiesResponse = await fetch("/supplier/countByCompany", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const companiesData = await companiesResponse.json();

            if (Array.isArray(companiesData) && companiesData.length > 0) {
                // Sort the companies by supplierCount in descending order
                const sortedCompanies = companiesData.sort((a, b) => b.supplierCount - a.supplierCount);

                // Get top 5 companies
                const top5Companies = sortedCompanies.slice(0, 5);

                const companyNames = top5Companies.map(company => company.companyName);
                const companyCounts = top5Companies.map(company => company.supplierCount);

                // Generate a color for each company dynamically
                const colors = top5Companies.map((_, index) => {
                    const colorList = ['#246dec', '#cc3c43', '#367952', '#f5b74f', '#4f35a1', '#f49c42', '#9b6c5e', '#2f7b6b', '#e955ff', '#fa6532'];
                    return colorList[index % colorList.length]; // Cycle through available colors
                });

                // Update ECharts with actual data
                barChart.setOption({
                    xAxis: {
                        data: companyNames
                    },
                    series: [{
                        data: companyCounts,
                        itemStyle: {
                            color: (params) => colors[params.dataIndex] // Assign color based on index
                        }
                    }]
                });

                // Display the top company in the card with animation
                const topCompany = top5Companies[0];
                document.getElementById('top-company-name').textContent = `${topCompany.companyName} - ${topCompany.supplierCount} approvals`;

                const topCompaniesList = document.getElementById("top-companies");
                top5Companies.forEach(company => {
                    const listItem = document.createElement("li");
                    listItem.textContent = `${company.companyName}: ${company.supplierCount} approvals`;
                    topCompaniesList.appendChild(listItem);
                });
            } else {
                console.warn("Companies data not found.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    } else {
        alert('You must be logged in as an admin to access this page.');
        window.location.href = '/login.html';
    }
});
