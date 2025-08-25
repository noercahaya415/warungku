document.addEventListener('DOMContentLoaded', function() {
  // Inisialisasi dashboard
  initDashboard();
  
  // Event listener untuk filter periode waktu
  document.getElementById('time-period').addEventListener('change', function() {
    updateDashboardData(this.value);
  });
  
  // Event listener untuk tab laporan
  const tabLinks = document.querySelectorAll('.tab-link');
  tabLinks.forEach(tab => {
    tab.addEventListener('click', function() {
      // Hapus kelas active dari semua tab
      tabLinks.forEach(t => t.classList.remove('active'));
      
      // Tambahkan kelas active ke tab yang diklik
      this.classList.add('active');
      
      // Sembunyikan semua konten tab
      const tabContents = document.querySelectorAll('.tab-content');
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Tampilkan konten tab yang sesuai
      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  // Event listener untuk tombol export
  document.getElementById('export-btn').addEventListener('click', function() {
    exportReport();
  });
});

// Fungsi inisialisasi dashboard
function initDashboard() {
  // Load data dari localStorage atau API
  loadDashboardData();
  
  // Inisialisasi chart
  initCharts();
  
  // Isi tabel laporan
  populateReportTables();
}

// Fungsi untuk memuat data dashboard
function loadDashboardData() {
  // Dalam implementasi nyata, ini akan mengambil data dari API
  // Untuk demo, kita menggunakan data dummy
  
  // Simpan data ke localStorage untuk simulasi
  const salesData = {
    "period": "month",
    "revenue": 8250000,
    "orders": 142,
    "customers": 98,
    "avgOrderValue": 58099,
    "revenueChange": 12.5,
    "ordersChange": 8.4,
    "customersChange": 5.2,
    "aovChange": 3.8,
    "revenueTrend": [2100000, 1950000, 2450000, 1850000],
    "topMenus": [
      {"name": "Rendang", "sales": 58, "revenue": 1740000},
      {"name": "Ayam Pop", "sales": 42, "revenue": 1260000},
      {"name": "Gulai Ikan", "sales": 35, "revenue": 1050000},
      {"name": "Dendeng Batokok", "sales": 28, "revenue": 1120000},
      {"name": "Sate Padang", "sales": 25, "revenue": 1000000}
    ],
    "categories": [
      {"name": "Makanan", "value": 72},
      {"name": "Minuman", "value": 18},
      {"name": "Snack", "value": 10}
    ],
    "peakHours": [
      {"hour": "10:00", "orders": 8},
      {"hour": "11:00", "orders": 12},
      {"hour": "12:00", "orders": 25},
      {"hour": "13:00", "orders": 22},
      {"hour": "14:00", "orders": 15},
      {"hour": "15:00", "orders": 10},
      {"hour": "16:00", "orders": 8},
      {"hour": "17:00", "orders": 14},
      {"hour": "18:00", "orders": 18},
      {"hour": "19:00", "orders": 12},
      {"hour": "20:00", "orders": 8}
    ]
  };
  
  const financialData = {
    "grossMargin": 42,
    "operationalCost": 28,
    "netMargin": 14
  };
  
  const customerData = {
    "newCustomers": 32,
    "returningCustomers": 68,
    "retentionRate": 45
  };
  
  const operationalData = {
    "avgPrepTime": 18,
    "delayRate": 7,
    "customerSatisfaction": 4.5
  };
  
  // Simpan data ke localStorage
  localStorage.setItem('salesData', JSON.stringify(salesData));
  localStorage.setItem('financialData', JSON.stringify(financialData));
  localStorage.setItem('customerData', JSON.stringify(customerData));
  localStorage.setItem('operationalData', JSON.stringify(operationalData));
  
  // Update UI dengan data
  updateUIWithData(salesData, financialData, customerData, operationalData);
}

// Fungsi untuk mengupdate data dashboard berdasarkan periode
function updateDashboardData(period) {
  // Dalam implementasi nyata, ini akan mengambil data dari API berdasarkan periode
  console.log('Mengupdate data untuk periode:', period);
  
  // Untuk demo, kita hanya menampilkan pesan
  alert(`Data untuk periode ${period} akan dimuat...`);
}

// Fungsi untuk inisialisasi chart
function initCharts() {
  // Ambil data dari localStorage
  const salesData = JSON.parse(localStorage.getItem('salesData'));
  
  // Chart trend pendapatan
  const revenueCtx = document.getElementById('revenue-chart').getContext('2d');
  new Chart(revenueCtx, {
    type: 'line',
    data: {
      labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
      datasets: [{
        label: 'Pendapatan (Rp)',
        data: salesData.revenueTrend,
        borderColor: '#4e73df',
        backgroundColor: 'rgba(78, 115, 223, 0.05)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
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
              return 'Rp ' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
  
  // Chart performa menu
  const menuCtx = document.getElementById('menu-performance-chart').getContext('2d');
  new Chart(menuCtx, {
    type: 'bar',
    data: {
      labels: salesData.topMenus.map(menu => menu.name),
      datasets: [{
        label: 'Pendapatan (Rp)',
        data: salesData.topMenus.map(menu => menu.revenue),
        backgroundColor: [
          'rgba(78, 115, 223, 0.7)',
          'rgba(111, 66, 193, 0.7)',
          'rgba(28, 200, 138, 0.7)',
          'rgba(54, 185, 204, 0.7)',
          'rgba(246, 194, 62, 0.7)'
        ]
      }]
    },
    options: {
      responsive: true,
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
              return 'Rp ' + (value / 1000000).toFixed(1) + ' jt';
            }
          }
        }
      }
    }
  });
  
  // Chart distribusi kategori
  const categoryCtx = document.getElementById('category-chart').getContext('2d');
  new Chart(categoryCtx, {
    type: 'doughnut',
    data: {
      labels: salesData.categories.map(cat => cat.name),
      datasets: [{
        data: salesData.categories.map(cat => cat.value),
        backgroundColor: [
          'rgba(78, 115, 223, 0.7)',
          'rgba(28, 200, 138, 0.7)',
          'rgba(54, 185, 204, 0.7)'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
  
  // Chart jam puncak
  const peakCtx = document.getElementById('peak-hours-chart').getContext('2d');
  new Chart(peakCtx, {
    type: 'bar',
    data: {
      labels: salesData.peakHours.map(h => h.hour),
      datasets: [{
        label: 'Jumlah Pesanan',
        data: salesData.peakHours.map(h => h.orders),
        backgroundColor: 'rgba(28, 200, 138, 0.7)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Fungsi untuk mengisi tabel laporan
function populateReportTables() {
  // Ambil data dari localStorage
  const salesData = JSON.parse(localStorage.getItem('salesData'));
  
  // Isi tabel laporan penjualan
  const salesTable = document.querySelector('#sales-report tbody');
  salesTable.innerHTML = `
    <tr>
      <td>01/08/2023 - 07/08/2023</td>
      <td>32</td>
      <td>Rp 2.100.000</td>
      <td>25</td>
      <td>Rp 65.625</td>
    </tr>
    <tr>
      <td>08/08/2023 - 14/08/2023</td>
      <td>28</td>
      <td>Rp 1.950.000</td>
      <td>22</td>
      <td>Rp 68.182</td>
    </tr>
    <tr>
      <td>15/08/2023 - 21/08/2023</td>
      <td>45</td>
      <td>Rp 2.450.000</td>
      <td>35</td>
      <td>Rp 70.000</td>
    </tr>
    <tr>
      <td>22/08/2023 - 28/08/2023</td>
      <td>37</td>
      <td>Rp 1.850.000</td>
      <td>30</td>
      <td>Rp 61.667</td>
    </tr>
  `;
  
  // Isi tabel laporan pelanggan
  const customerTable = document.querySelector('#customer-report tbody');
  customerTable.innerHTML = `
    <tr>
      <td>Pelanggan Baru</td>
      <td>31</td>
      <td>42</td>
      <td>Rp 55.200</td>
      <td>+12%</td>
    </tr>
    <tr>
      <td>Pelanggan Kembali</td>
      <td>67</td>
      <td>100</td>
      <td>Rp 72.500</td>
      <td>+8%</td>
    </tr>
    <tr>
      <td>Pelanggan VIP</td>
      <td>12</td>
      <td>28</td>
      <td>Rp 95.300</td>
      <td>+15%</td>
    </tr>
  `;
  
  // Isi tabel laporan menu
  const menuTable = document.querySelector('#menu-report tbody');
  menuTable.innerHTML = '';
  salesData.topMenus.forEach(menu => {
    const margin = Math.floor(Math.random() * 20) + 30; // Margin acak antara 30-50%
    const popularity = Math.floor((menu.sales / salesData.orders) * 100);
    
    menuTable.innerHTML += `
      <tr>
        <td>${menu.name}</td>
        <td>${menu.sales}</td>
        <td>Rp ${menu.revenue.toLocaleString()}</td>
        <td>${margin}%</td>
        <td>${popularity}%</td>
      </tr>
    `;
  });
}

// Fungsi untuk update UI dengan data
function updateUIWithData(salesData, financialData, customerData, operationalData) {
  // Update metrik kunci
  document.querySelector('.metric-value.revenue').textContent = `Rp ${salesData.revenue.toLocaleString()}`;
  document.querySelector('.metric-value.orders').textContent = salesData.orders;
  document.querySelector('.metric-value.customers').textContent = salesData.customers;
  document.querySelector('.metric-value.avg-order').textContent = `Rp ${salesData.avgOrderValue.toLocaleString()}`;
  
  // Update perubahan metrik
  document.querySelectorAll('.metric-change.revenue').forEach(el => {
    el.innerHTML = `<i class="fas fa-arrow-up"></i> ${salesData.revenueChange}%`;
  });
  
  document.querySelectorAll('.metric-change.orders').forEach(el => {
    el.innerHTML = `<i class="fas fa-arrow-up"></i> ${salesData.ordersChange}%`;
  });
  
  document.querySelectorAll('.metric-change.customers').forEach(el => {
    el.innerHTML = `<i class="fas fa-arrow-up"></i> ${salesData.customersChange}%`;
  });
  
  document.querySelectorAll('.metric-change.avg-order').forEach(el => {
    el.innerHTML = `<i class="fas fa-arrow-up"></i> ${salesData.aovChange}%`;
  });
  
  // Update analisis profitabilitas
  document.querySelectorAll('.profit-metric .value')[0].textContent = `${financialData.grossMargin}%`;
  document.querySelectorAll('.profit-metric .value')[1].textContent = `${financialData.operationalCost}%`;
  document.querySelectorAll('.profit-metric .value')[2].textContent = `${financialData.netMargin}%`;
  
  // Update analisis pelanggan
  document.querySelectorAll('.customer-metric .value')[0].textContent = `${customerData.newCustomers}%`;
  document.querySelectorAll('.customer-metric .value')[1].textContent = `${customerData.returningCustomers}%`;
  document.querySelectorAll('.customer-metric .value')[2].textContent = `${customerData.retentionRate}%`;
  
  // Update analisis operasional
  document.querySelectorAll('.operational-metric .value')[0].textContent = `${operationalData.avgPrepTime} menit`;
  document.querySelectorAll('.operational-metric .value')[1].textContent = `${operationalData.delayRate}%`;
  document.querySelectorAll('.operational-metric .value')[2].textContent = `${operationalData.customerSatisfaction}/5`;
}

// Fungsi untuk export laporan
function exportReport() {
  // Dalam implementasi nyata, ini akan menghasilkan file PDF/Excel
  // Untuk demo, kita hanya menampilkan pesan
  
  // Simpan data ke folder data (simulasi)
  const salesData = localStorage.getItem('salesData');
  const financialData = localStorage.getItem('financialData');
  const customerData = localStorage.getItem('customerData');
  const operationalData = localStorage.getItem('operationalData');
  
  // Buat blob untuk simulasi penyimpanan
  const dataStr = `Data Penjualan: ${salesData}\n\nData Keuangan: ${financialData}\n\nData Pelanggan: ${customerData}\n\nData Operasional: ${operationalData}`;
  const blob = new Blob([dataStr], { type: 'text/plain' });
  
  // Buat URL untuk blob
  const url = URL.createObjectURL(blob);
  
  // Buat elemen a untuk download
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan-warungku-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  
  // Hapus elemen setelah download
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('Laporan berhasil diexport!');
}