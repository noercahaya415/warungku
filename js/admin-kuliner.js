// Fungsi untuk login admin
document.addEventListener('DOMContentLoaded', function() {
  // Cek apakah halaman login
  if (document.getElementById('admin-login-form')) {
    const loginForm = document.getElementById('admin-login-form');
    
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // Validasi sederhana (dalam implementasi nyata, ini akan terhubung ke backend)
      if (username === 'admin' && password === 'password') {
        // Simpan status login (dalam implementasi nyata, gunakan session/token)
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminName', 'Admin Warung Kuliner');
        
        // Redirect ke halaman admin
        window.location.href = 'admin-kuliner.html';
      } else {
        alert('Username atau password salah!');
      }
    });
  }
  
  // Cek apakah halaman admin utama
  if (document.getElementById('logout-btn')) {
    // Cek status login
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
      window.location.href = 'admin-login.html';
      return;
    }
    
    // Tampilkan nama admin
    const adminName = localStorage.getItem('adminName') || 'Admin';
    document.getElementById('admin-name').textContent = adminName;
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', function() {
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminName');
      window.location.href = 'admin-login.html';
    });
    
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const modules = document.querySelectorAll('.module');
    
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all links and modules
        navLinks.forEach(l => l.classList.remove('active'));
        modules.forEach(m => m.classList.remove('active'));
        
        // Add active class to clicked link
        this.classList.add('active');
        
        // Show corresponding module
        const targetId = this.getAttribute('href').substring(1);
        document.getElementById(targetId).classList.add('active');
      });
    });
    
    // Initialize modules
    initMenuManagement();
    initOrderManagement();
    initSettings();
  }
});

// Modul 1: Manajemen Menu
function initMenuManagement() {
  // Load menu data from localStorage or initialize if empty
  let menus = JSON.parse(localStorage.getItem('warungMenus')) || [];
  
  // Render menu list
  renderMenuList(menus);
  
  // Add new menu form submission
  const newMenuForm = document.getElementById('new-menu-form');
  if (newMenuForm) {
    newMenuForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const newMenu = {
        id: Date.now(), // Unique ID based on timestamp
        name: document.getElementById('menu-name').value,
        price: parseInt(document.getElementById('menu-price').value),
        description: document.getElementById('menu-description').value,
        category: document.getElementById('menu-category').value,
        image: document.getElementById('menu-image').value,
        available: true
      };
      
      menus.push(newMenu);
      localStorage.setItem('warungMenus', JSON.stringify(menus));
      
      renderMenuList(menus);
      newMenuForm.reset();
      
      alert('Menu berhasil ditambahkan!');
    });
  }
  
  // Search and filter functionality
  const menuSearch = document.getElementById('menu-search');
  const categoryFilter = document.getElementById('category-filter');
  
  if (menuSearch && categoryFilter) {
    menuSearch.addEventListener('input', filterMenus);
    categoryFilter.addEventListener('change', filterMenus);
  }
  
  function filterMenus() {
    const searchTerm = menuSearch.value.toLowerCase();
    const category = categoryFilter.value;
    
    const filteredMenus = menus.filter(menu => {
      const matchesSearch = menu.name.toLowerCase().includes(searchTerm) || 
                           menu.description.toLowerCase().includes(searchTerm);
      const matchesCategory = category === 'all' || menu.category === category;
      
      return matchesSearch && matchesCategory;
    });
    
    renderMenuList(filteredMenus);
  }
}

function renderMenuList(menus) {
  const menuList = document.getElementById('menu-list');
  if (!menuList) return;
  
  if (menus.length === 0) {
    menuList.innerHTML = '<p class="no-data">Belum ada menu. Silakan tambahkan menu baru.</p>';
    return;
  }
  
  menuList.innerHTML = menus.map(menu => `
    <div class="menu-card">
      <div class="menu-card-header">
        <h4 class="menu-card-title">${menu.name}</h4>
        <span class="menu-card-price">Rp ${menu.price.toLocaleString('id-ID')}</span>
      </div>
      <p class="menu-card-description">${menu.description}</p>
      <div class="menu-card-actions">
        <button class="btn-toggle" onclick="toggleMenuAvailability(${menu.id})">
          ${menu.available ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
        <button class="btn-edit" onclick="editMenu(${menu.id})">Edit</button>
        <button class="btn-delete" onclick="deleteMenu(${menu.id})">Hapus</button>
      </div>
    </div>
  `).join('');
}

// Function to toggle menu availability
function toggleMenuAvailability(menuId) {
  let menus = JSON.parse(localStorage.getItem('warungMenus')) || [];
  const menuIndex = menus.findIndex(menu => menu.id === menuId);
  
  if (menuIndex !== -1) {
    menus[menuIndex].available = !menus[menuIndex].available;
    localStorage.setItem('warungMenus', JSON.stringify(menus));
    renderMenuList(menus);
  }
}

// Function to edit menu (placeholder)
function editMenu(menuId) {
  alert('Fitur edit menu akan segera tersedia!');
  // Implementation for editing menu would go here
}

// Function to delete menu
function deleteMenu(menuId) {
  if (confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
    let menus = JSON.parse(localStorage.getItem('warungMenus')) || [];
    menus = menus.filter(menu => menu.id !== menuId);
    localStorage.setItem('warungMenus', JSON.stringify(menus));
    renderMenuList(menus);
  }
}

// Modul 2: Manajemen Pesanan
function initOrderManagement() {
  // Load order data from localStorage or initialize if empty
  let orders = JSON.parse(localStorage.getItem('warungOrders')) || [];
  
  // Render order list
  renderOrderList(orders);
  
  // Filter functionality
  const applyFiltersBtn = document.getElementById('apply-filters');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
      const statusFilter = document.getElementById('order-status').value;
      const dateFrom = document.getElementById('date-from').value;
      const dateTo = document.getElementById('date-to').value;
      const sortOrder = document.getElementById('sort-order').value;
      
      let filteredOrders = orders;
      
      // Filter by status
      if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
      }
      
      // Filter by date
      if (dateFrom) {
        filteredOrders = filteredOrders.filter(order => new Date(order.date) >= new Date(dateFrom));
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setDate(toDate.getDate() + 1); // Include the end date
        filteredOrders = filteredOrders.filter(order => new Date(order.date) <= toDate);
      }
      
      // Sort orders
      switch(sortOrder) {
        case 'newest':
          filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        case 'oldest':
          filteredOrders.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
        case 'price-asc':
          filteredOrders.sort((a, b) => a.total - b.total);
          break;
        case 'price-desc':
          filteredOrders.sort((a, b) => b.total - a.total);
          break;
      }
      
      renderOrderList(filteredOrders);
    });
  }
}

function renderOrderList(orders) {
  const orderList = document.getElementById('order-list');
  if (!orderList) return;
  
  if (orders.length === 0) {
    orderList.innerHTML = '<p class="no-data">Belum ada pesanan.</p>';
    return;
  }
  
  orderList.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-card-header">
        <div>
          <h4 class="order-id">Order #${order.id}</h4>
          <p class="order-date">${new Date(order.date).toLocaleString('id-ID')}</p>
        </div>
        <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
      </div>
      <div class="order-details">
        <div class="order-customer">
          <strong>Pelanggan:</strong> ${order.customerName} (${order.customerPhone})<br>
          <strong>Alamat:</strong> ${order.customerAddress}
        </div>
        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-item">
              <span>${item.name} x${item.quantity}</span>
              <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-total">
          Total: Rp ${order.total.toLocaleString('id-ID')}
        </div>
      </div>
      <div class="order-actions">
        ${order.status === 'new' ? `
          <button class="btn-primary" onclick="updateOrderStatus(${order.id}, 'processing')">Proses Pesanan</button>
          <button class="btn-cancel" onclick="updateOrderStatus(${order.id}, 'cancelled')">Batalkan</button>
        ` : ''}
        ${order.status === 'processing' ? `
          <button class="btn-primary" onclick="updateOrderStatus(${order.id}, 'delivering')">Mulai Pengiriman</button>
        ` : ''}
        ${order.status === 'delivering' ? `
          <button class="btn-primary" onclick="updateOrderStatus(${order.id}, 'completed')">Selesaikan Pesanan</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function getStatusText(status) {
  const statusTexts = {
    'new': 'Pesanan Baru',
    'processing': 'Diproses',
    'delivering': 'Dikirim',
    'completed': 'Selesai',
    'cancelled': 'Dibatalkan'
  };
  
  return statusTexts[status] || status;
}

function updateOrderStatus(orderId, newStatus) {
  let orders = JSON.parse(localStorage.getItem('warungOrders')) || [];
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex !== -1) {
    orders[orderIndex].status = newStatus;
    localStorage.setItem('warungOrders', JSON.stringify(orders));
    renderOrderList(orders);
  }
}

// Modul 3: Pengaturan
function initSettings() {
  // Load settings from localStorage or initialize if empty
  const settings = JSON.parse(localStorage.getItem('warungSettings')) || {
    name: 'Rumah Makan Padang',
    address: 'Jl. Contoh No. 123, Kota Padang',
    phone: '081234567890',
    hours: '09:00 - 21:00',
    deliveryFee: 10000,
    serviceFee: 2000
  };
  
  // Populate form with current settings
  document.getElementById('warung-name').value = settings.name;
  document.getElementById('warung-address').value = settings.address;
  document.getElementById('warung-phone').value = settings.phone;
  document.getElementById('operational-hours').value = settings.hours;
  document.getElementById('delivery-fee-default').value = settings.deliveryFee;
  document.getElementById('service-fee-default').value = settings.serviceFee;
  
  // Save settings on form submission
  const settingsForm = document.getElementById('warung-settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const newSettings = {
        name: document.getElementById('warung-name').value,
        address: document.getElementById('warung-address').value,
        phone: document.getElementById('warung-phone').value,
        hours: document.getElementById('operational-hours').value,
        deliveryFee: parseInt(document.getElementById('delivery-fee-default').value),
        serviceFee: parseInt(document.getElementById('service-fee-default').value)
      };
      
      localStorage.setItem('warungSettings', JSON.stringify(newSettings));
      alert('Pengaturan berhasil disimpan!');
    });
  }
}