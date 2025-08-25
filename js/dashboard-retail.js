// Dashboard Retail JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date range picker
    const dateRangePicker = flatpickr("#dateRangePicker", {
        mode: "range",
        locale: "id",
        dateFormat: "d-m-Y",
        defaultDate: [new Date().setDate(new Date().getDate() - 30), new Date()],
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length === 2) {
                loadDashboardData(selectedDates[0], selectedDates[1]);
            }
        }
    });

    // Initialize charts
    initCharts();

    // Load initial data
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    loadDashboardData(defaultStartDate, new Date());

    // Event listeners
    document.getElementById('exportReportBtn').addEventListener('click', exportReport);
    document.getElementById('backToAdminBtn').addEventListener('click', function() {
        window.location.href = 'admin-retail.html';
    });

    // Chart period buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateChartPeriod(this.dataset.period);
        });
    });

    // Modal functionality
    const modal = document.getElementById('reportModal');
    const closeModal = document.querySelector('.modal-header .close');
    
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Simulate data loading
    simulateDataLoading();
});

// Initialize charts
function initCharts() {
    // Sales Trend Chart
    const salesTrendCtx = document.getElementById('salesTrendChart').getContext('2d');
    window.salesTrendChart = new Chart(salesTrendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Penjualan (Rp)',
                data: [],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + value.toLocaleString('id-ID');
                        }
                    }
                }
            }
        }
    });

    // Category Sales Chart
    const categorySalesCtx = document.getElementById('categorySalesChart').getContext('2d');
    window.categorySalesChart = new Chart(categorySalesCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4361ee', '#38b000', '#f9a826', '#e5383b', '#6c757d',
                    '#9d4edd', '#f72585', '#4cc9f0', '#ff9e00', '#7209b7'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });

    // Sales Prediction Chart
    const salesPredictionCtx = document.getElementById('salesPredictionChart').getContext('2d');
    window.salesPredictionChart = new Chart(salesPredictionCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Prediksi',
                data: [],
                backgroundColor: 'rgba(67, 97, 238, 0.5)',
                borderColor: '#4361ee',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + value.toLocaleString('id-ID');
                        }
                    }
                }
            }
        }
    });
}

// Load dashboard data based on date range
function loadDashboardData(startDate, endDate) {
    // Show loading state
    showLoading();
    
    // In a real application, you would fetch data from your API
    // For demonstration, we'll use simulated data
    setTimeout(() => {
        // Simulate API response
        const data = generateSimulatedData(startDate, endDate);
        
        // Update charts with new data
        updateCharts(data);
        
        // Update metrics
        updateMetrics(data);
        
        // Hide loading state
        hideLoading();
    }, 1000);
}

// Update charts with new data
function updateCharts(data) {
    // Update sales trend chart
    window.salesTrendChart.data.labels = data.salesTrend.labels;
    window.salesTrendChart.data.datasets[0].data = data.salesTrend.values;
    window.salesTrendChart.update();
    
    // Update category sales chart
    window.categorySalesChart.data.labels = data.categories.labels;
    window.categorySalesChart.data.datasets[0].data = data.categories.values;
    window.categorySalesChart.update();
    
    // Update sales prediction chart
    window.salesPredictionChart.data.labels = data.prediction.labels;
    window.salesPredictionChart.data.datasets[0].data = data.prediction.values;
    window.salesPredictionChart.update();
}

// Update metrics with new data
function updateMetrics(data) {
    // Update health score
    document.querySelector('#healthScore span').textContent = data.healthScore.score;
    document.querySelector('.score-label').textContent = data.healthScore.status;
    document.querySelector('.score-label').style.color = getStatusColor(data.healthScore.status);
    
    // Update score breakdown
    const breakdownItems = document.querySelectorAll('.breakdown-item');
    breakdownItems[0].querySelector('.progress-fill').style.width = data.healthScore.breakdown.sales + '%';
    breakdownItems[0].querySelector('.value').textContent = data.healthScore.breakdown.sales + '%';
    
    breakdownItems[1].querySelector('.progress-fill').style.width = data.healthScore.breakdown.margin + '%';
    breakdownItems[1].querySelector('.value').textContent = data.healthScore.breakdown.margin + '%';
    
    breakdownItems[2].querySelector('.progress-fill').style.width = data.healthScore.breakdown.inventory + '%';
    breakdownItems[2].querySelector('.value').textContent = data.healthScore.breakdown.inventory + '%';
    
    // Update key metrics
    document.querySelector('.metric-card:nth-child(1) .metric-value').textContent = 
        formatCurrency(data.keyMetrics.todaySales);
    
    document.querySelector('.metric-card:nth-child(1) .metric-change').innerHTML = 
        data.keyMetrics.salesChange > 0 ? 
        `<i class="fas fa-arrow-up"></i> ${data.keyMetrics.salesChange}% dari kemarin` :
        `<i class="fas fa-arrow-down"></i> ${Math.abs(data.keyMetrics.salesChange)}% dari kemarin`;
    
    document.querySelector('.metric-card:nth-child(1) .metric-change').className = 
        `metric-change ${data.keyMetrics.salesChange > 0 ? 'positive' : 'negative'}`;
    
    document.querySelector('.metric-card:nth-child(2) .metric-value').textContent = 
        data.keyMetrics.margin + '%';
    
    document.querySelector('.metric-card:nth-child(2) .metric-change').innerHTML = 
        data.keyMetrics.marginChange > 0 ? 
        `<i class="fas fa-arrow-up"></i> ${data.keyMetrics.marginChange}% dari bulan lalu` :
        `<i class="fas fa-arrow-down"></i> ${Math.abs(data.keyMetrics.marginChange)}% dari bulan lalu`;
    
    document.querySelector('.metric-card:nth-child(2) .metric-change').className = 
        `metric-change ${data.keyMetrics.marginChange > 0 ? 'positive' : 'negative'}`;
    
    document.querySelector('.metric-card:nth-child(3) .metric-value').textContent = 
        data.keyMetrics.inventoryTurnover + 'x';
    
    document.querySelector('.metric-card:nth-child(3) .metric-change').innerHTML = 
        data.keyMetrics.inventoryChange > 0 ? 
        `<i class="fas fa-arrow-up"></i> ${data.keyMetrics.inventoryChange}x dari kuartal lalu` :
        `<i class="fas fa-arrow-down"></i> ${Math.abs(data.keyMetrics.inventoryChange)}x dari kuartal lalu`;
    
    document.querySelector('.metric-card:nth-child(3) .metric-change').className = 
        `metric-change ${data.keyMetrics.inventoryChange > 0 ? 'positive' : 'negative'}`;
    
    // Update top products tables
    updateTable('topProductsBody', data.topProducts);
    updateTable('topMarginProductsBody', data.topMarginProducts);
    
    // Update inventory metrics
    const inventoryMetrics = document.querySelectorAll('.inventory-metric');
    inventoryMetrics[0].querySelector('.value').textContent = formatCurrency(data.inventoryMetrics.averageStockValue);
    inventoryMetrics[1].querySelector('.value').textContent = data.inventoryMetrics.daysOfSupply + ' hari';
    inventoryMetrics[2].querySelector('.value').textContent = data.inventoryMetrics.slowMovingCount + ' produk';
    inventoryMetrics[3].querySelector('.value').textContent = data.inventoryMetrics.outOfStockCount + ' produk';
    
    // Update customer metrics
    const customerMetrics = document.querySelectorAll('.customer-metric');
    customerMetrics[0].querySelector('.value').textContent = formatCurrency(data.customerMetrics.avgTransaction);
    customerMetrics[1].querySelector('.value').textContent = data.customerMetrics.transactionsPerDay;
    customerMetrics[2].querySelector('.value').textContent = data.customerMetrics.newCustomers;
    
    // Update prediction summary
    const predictionItems = document.querySelectorAll('.prediction-item');
    predictionItems[0].querySelector('.value').textContent = formatCurrency(data.predictionSummary.total);
    predictionItems[1].querySelector('.value').textContent = 
        (data.predictionSummary.change > 0 ? '+' : '') + data.predictionSummary.change + '%';
    predictionItems[1].querySelector('.value').className = 
        `value ${data.predictionSummary.change > 0 ? 'positive' : ''}`;
}

// Update table with data
function updateTable(tableId, data) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.sold}</td>
            <td>${formatCurrency(item.revenue)}</td>
            <td>${item.margin}%</td>
        `;
        tableBody.appendChild(row);
    });
}

// Export report functionality
function exportReport() {
    // In a real application, this would generate a PDF or Excel file
    alert('Fitur export laporan akan membuka dialog untuk mengunduh laporan dalam format PDF atau Excel.');
}

// Update chart period
function updateChartPeriod(period) {
    // In a real application, this would reload data for the selected period
    console.log('Period changed to:', period);
}

// Show loading state
function showLoading() {
    // Add loading indicator to charts and metrics
    document.querySelectorAll('.chart-container, .metric-card, .analysis-table').forEach(el => {
        el.classList.add('loading');
    });
}

// Hide loading state
function hideLoading() {
    document.querySelectorAll('.chart-container, .metric-card, .analysis-table').forEach(el => {
        el.classList.remove('loading');
    });
}

// Format currency for Indonesian Rupiah
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Get color based on status
function getStatusColor(status) {
    switch(status.toLowerCase()) {
        case 'sangat baik': return '#38b000';
        case 'baik': return '#4361ee';
        case 'cukup': return '#f9a826';
        case 'kurang': return '#e5383b';
        default: return '#6c757d';
    }
}

// Generate simulated data for demonstration
function generateSimulatedData(startDate, endDate) {
    // Calculate days between dates
    const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Generate sales trend data
    const salesTrendLabels = [];
    const salesTrendValues = [];
    
    for (let i = 0; i <= daysDiff; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        salesTrendLabels.push(date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
        
        // Simulate sales with some randomness
        const baseSales = 800000;
        const randomFactor = 0.3; // 30% randomness
        const dayOfWeekFactor = date.getDay() === 0 || date.getDay() === 6 ? 1.2 : 1; // Weekend boost
        const sales = baseSales * (1 + (Math.random() * randomFactor)) * dayOfWeekFactor;
        salesTrendValues.push(Math.round(sales));
    }
    
    // Generate category data
    const categories = {
        labels: ['Makanan', 'Minuman', 'Perawatan', 'Rokok', 'Lainnya'],
        values: [45, 25, 15, 10, 5]
    };
    
    // Generate prediction data
    const predictionLabels = ['Hari 1', 'Hari 2', 'Hari 3', 'Hari 4', 'Hari 5', 'Hari 6', 'Hari 7'];
    const predictionValues = [1250000, 1320000, 1280000, 1350000, 1400000, 1450000, 1500000];
    
    return {
        healthScore: {
            score: 72,
            status: 'Baik',
            breakdown: {
                sales: 85,
                margin: 65,
                inventory: 78
            }
        },
        keyMetrics: {
            todaySales: 1250000,
            salesChange: 12,
            margin: 32,
            marginChange: -3,
            inventoryTurnover: 4.2,
            inventoryChange: 0.8
        },
        salesTrend: {
            labels: salesTrendLabels,
            values: salesTrendValues
        },
        categories: categories,
        topProducts: [
            { name: 'Mie Instan Sedap Goreng', sold: 125, revenue: 625000, margin: 28 },
            { name: 'Beras Ramos 5kg', sold: 42, revenue: 1050000, margin: 15 },
            { name: 'Aqua Gelas 240ml', sold: 98, revenue: 294000, margin: 25 }
        ],
        topMarginProducts: [
            { name: 'Kopi Kapal Api 250g', sold: 64, revenue: 768000, margin: 42 },
            { name: 'Sabun Lifebuoy 100g', sold: 55, revenue: 550000, margin: 38 },
            { name: 'Minyak Goreng Bimoli 2L', sold: 48, revenue: 1200000, margin: 35 }
        ],
        inventoryMetrics: {
            averageStockValue: 8500000,
            daysOfSupply: 24,
            slowMovingCount: 12,
            outOfStockCount: 5
        },
        customerMetrics: {
            avgTransaction: 45000,
            transactionsPerDay: 28,
            newCustomers: 15
        },
        prediction: {
            labels: predictionLabels,
            values: predictionValues
        },
        predictionSummary: {
            total: 8750000,
            change: 8
        }
    };
}

// Simulate data loading for demonstration
function simulateDataLoading() {
    // This is just for demonstration - in a real app, data would come from your backend
    console.log('Simulating data loading...');
}