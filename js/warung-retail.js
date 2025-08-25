// js/warung-retail.js
// Data produk (akan diganti dengan data dari API/inventory)
let products = [];
let cart = [];
let currentCategory = 'all';
let filters = {
    minPrice: null,
    maxPrice: null,
    stock: []
};
let sortBy = 'newest';

// Elemen DOM
const productsGrid = document.getElementById('productsGrid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const cartCount = document.querySelector('.cart-count');
const cartPopup = document.getElementById('cartPopup');
const cartIcon = document.getElementById('cartIcon');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const categoryItems = document.querySelectorAll('.category-item-horizontal');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const filterBtn = document.getElementById('filterBtn');
const filterOptions = document.getElementById('filterOptions');
const applyFilter = document.getElementById('applyFilter');
const sortSelect = document.getElementById('sortSelect');
const productsCount = document.getElementById('productsCount');
const namaToko = document.getElementById('nama-toko');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    
    // Event listeners untuk interaksi
    cartIcon.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    loginBtn.addEventListener('click', () => loginModal.classList.add('show'));
    closeModal.addEventListener('click', () => loginModal.classList.remove('show'));
    adminLoginBtn.addEventListener('click', handleAdminLogin);
    checkoutBtn.addEventListener('click', handleCheckout);
    
    // Filter dan pencarian
    filterBtn.addEventListener('click', () => filterOptions.classList.toggle('show'));
    applyFilter.addEventListener('click', applyFilters);
    sortSelect.addEventListener('change', () => {
        sortBy = sortSelect.value;
        renderProducts();
    });
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Kategori
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentCategory = item.getAttribute('data-category');
            renderProducts();
        });
    });
    
    // Tutup filter saat klik di luar
    document.addEventListener('click', (e) => {
        if (!filterBtn.contains(e.target) && !filterOptions.contains(e.target)) {
            filterOptions.classList.remove('show');
        }
    });
});

// Inisialisasi aplikasi
function initializeApp() {
    // Ambil data toko dari localStorage (setelah registrasi)
    const businessData = JSON.parse(localStorage.getItem('warungku_business_data')) || {};
    if (businessData.businessName) {
        namaToko.textContent = businessData.businessName;
    }
    
    // Ambil data produk (dalam implementasi nyata, ini akan dari API)
    loadProducts();
    
    // Ambil keranjang dari localStorage jika ada
    const savedCart = localStorage.getItem('warungku_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// Load produk (simulasi data dari inventory)
function loadProducts() {
    // Dalam implementasi nyata, ini akan fetch dari API
    // Berikut data contoh
    products = [
        {
            id: 1,
            name: "Beras Pandan Wangi 5kg",
            price: 65000,
            image: "https://via.placeholder.com/300x300?text=Beras+5kg",
            category: "sembako",
            stock: 20,
            createdAt: new Date('2023-10-15')
        },
        {
            id: 2,
            name: "Minyak Goreng Fortune 2L",
            price: 28000,
            image: "https://via.placeholder.com/300x300?text=Minyak+Goreng",
            category: "sembako",
            stock: 15,
            createdAt: new Date('2023-10-10')
        },
        {
            id: 3,
            name: "Gula Pasir 1kg",
            price: 12500,
            image: "https://via.placeholder.com/300x300?text=Gula+Pasir",
            category: "sembako",
            stock: 25,
            createdAt: new Date('2023-10-12')
        },
        {
            id: 4,
            name: "Teh Celup Sariwangi 25s",
            price: 10500,
            image: "https://via.placeholder.com/300x300?text=Teh+Celup",
            category: "minuman",
            stock: 18,
            createdAt: new Date('2023-10-05')
        },
        {
            id: 5,
            name: "Kopi Kapal Api 100gr",
            price: 8500,
            image: "https://via.placeholder.com/300x300?text=Kopi+Kapal+Api",
            category: "minuman",
            stock: 22,
            createdAt: new Date('2023-10-08')
        },
        {
            id: 6,
            name: "Indomie Goreng 1 dus",
            price: 35000,
            image: "https://via.placeholder.com/300x300?text=Indomie+Goreng",
            category: "makanan",
            stock: 10,
            createdAt: new Date('2023-10-20')
        },
        {
            id: 7,
            name: "Susu Kental Manis Frisian Flag",
            price: 9500,
            image: "https://via.placeholder.com/300x300?text=Susu+Kental+Manis",
            category: "minuman",
            stock: 16,
            createdAt: new Date('2023-10-18')
        },
        {
            id: 8,
            name: "Sabun Lifebuoy 100gr",
            price: 4500,
            image: "https://via.placeholder.com/300x300?text=Sabun+Lifebuoy",
            category: "sabun-pembersih",
            stock: 30,
            createdAt: new Date('2023-10-22')
        },
        {
            id: 9,
            name: "Rokok Sampoerna Mild 16 batang",
            price: 30000,
            image: "https://via.placeholder.com/300x300?text=Rokok+Sampoerna",
            category: "rokok",
            stock: 40,
            createdAt: new Date('2023-10-25')
        },
        {
            id: 10,
            name: "Kecap Bango 135ml",
            price: 9500,
            image: "https://via.placeholder.com/300x300?text=Kecap+Bango",
            category: "bumbu",
            stock: 20,
            createdAt: new Date('2023-10-14')
        },
        {
            id: 11,
            name: "Pensil 2B Faber Castell",
            price: 2500,
            image: "https://via.placeholder.com/300x300?text=Pensil+2B",
            category: "atk",
            stock: 50,
            createdAt: new Date('2023-10-16')
        },
        {
            id: 12,
            name: "Chitato 35gr",
            price: 8500,
            image: "https://via.placeholder.com/300x300?text=Chitato",
            category: "makanan",
            stock: 35,
            createdAt: new Date('2023-10-19')
        }
    ];
    
    renderProducts();
}

// Render produk dengan filter dan sorting
function renderProducts() {
    let filteredProducts = products;
    
    // Filter by category
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === currentCategory);
    }
    
    // Filter by search
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply filters
    if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(product => product.price >= filters.minPrice);
    }
    
    if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(product => product.price <= filters.maxPrice);
    }
    
    if (filters.stock.length > 0) {
        if (filters.stock.includes('available') && !filters.stock.includes('low')) {
            filteredProducts = filteredProducts.filter(product => product.stock > 5);
        } else if (filters.stock.includes('low') && !filters.stock.includes('available')) {
            filteredProducts = filteredProducts.filter(product => product.stock > 0 && product.stock <= 5);
        }
        // Jika keduanya dicentang, tidak perlu filter tambahan
    }
    
    // Sort products
    switch(sortBy) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'newest':
        default:
            filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }
    
    // Render products
    productsGrid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p class="empty-message">Tidak ada produk yang sesuai dengan filter.</p>';
        productsCount.textContent = 'Menampilkan 0 produk';
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">Rp ${product.price.toLocaleString('id-ID')}</div>
                <div class="product-stock">Stok: ${product.stock}</div>
                <div class="quantity-controls">
                    <div>
                        <button class="qty-btn minus" onclick="decreaseQuantity(${product.id})">-</button>
                        <input type="number" class="qty-input" id="qty-${product.id}" value="0" min="0" max="${product.stock}" onchange="updateQuantity(${product.id}, this.value)">
                        <button class="qty-btn plus" onclick="increaseQuantity(${product.id})">+</button>
                    </div>
                    <button class="add-to-cart" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    productsCount.textContent = `Menampilkan ${filteredProducts.length} produk`;
}

// Fungsi untuk menambah jumlah produk
function increaseQuantity(productId) {
    const input = document.getElementById(`qty-${productId}`);
    const product = products.find(p => p.id === productId);
    
    if (parseInt(input.value) < parseInt(input.max)) {
        input.value = parseInt(input.value) + 1;
    }
}

// Fungsi untuk mengurangi jumlah produk
function decreaseQuantity(productId) {
    const input = document.getElementById(`qty-${productId}`);
    if (parseInt(input.value) > parseInt(input.min)) {
        input.value = parseInt(input.value) - 1;
    }
}

// Fungsi untuk update quantity melalui input
function updateQuantity(productId, value) {
    const product = products.find(p => p.id === productId);
    const input = document.getElementById(`qty-${productId}`);
    
    if (parseInt(value) < parseInt(input.min)) {
        input.value = input.min;
    } else if (parseInt(value) > parseInt(input.max)) {
        input.value = input.max;
    }
}

// Fungsi untuk menambah ke keranjang
function addToCart(productId) {
    const input = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(input.value);
    
    if (quantity <= 0) {
        alert('Jumlah produk harus lebih dari 0');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    
    if (quantity > product.stock) {
        alert(`Stok tidak mencukupi. Stok tersedia: ${product.stock}`);
        return;
    }
    
    // Cek apakah produk sudah ada di keranjang
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    // Reset quantity input
    input.value = 0;
    
    // Update keranjang
    updateCart();
    
    // Tampilkan notifikasi
    alert(`${quantity} ${product.name} ditambahkan ke keranjang`);
}

// Update tampilan keranjang
function updateCart() {
    // Simpan keranjang ke localStorage
    localStorage.setItem('warungku_cart', JSON.stringify(cart));
    
    // Update jumlah item di ikon keranjang
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update daftar item di keranjang
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartTotal.textContent = 'Rp 0';
        return;
    }
    
    emptyCartMessage.style.display = 'none';
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')} x ${item.quantity}</div>
                <div class="cart-item-quantity">
                    <button class="cart-qty-btn minus" onclick="decreaseCartQuantity(${item.id})">-</button>
                    <input type="number" class="cart-qty-input" value="${item.quantity}" min="1" onchange="updateCartQuantity(${item.id}, this.value)">
                    <button class="cart-qty-btn plus" onclick="increaseCartQuantity(${item.id})">+</button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Fungsi untuk menambah jumlah item di keranjang
function increaseCartQuantity(productId) {
    const item = cart.find(i => i.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (item.quantity < product.stock) {
        item.quantity++;
        updateCart();
    } else {
        alert(`Stok tidak mencukupi. Stok tersedia: ${product.stock}`);
    }
}

// Fungsi untuk mengurangi jumlah item di keranjang
function decreaseCartQuantity(productId) {
    const item = cart.find(i => i.id === productId);
    
    if (item.quantity > 1) {
        item.quantity--;
        updateCart();
    } else {
        removeFromCart(productId);
    }
}

// Fungsi untuk update quantity di keranjang melalui input
function updateCartQuantity(productId, value) {
    const item = cart.find(i => i.id === productId);
    const product = products.find(p => p.id === productId);
    const quantity = parseInt(value);
    
    if (quantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    if (quantity > product.stock) {
        alert(`Stok tidak mencukupi. Stok tersedia: ${product.stock}`);
        item.quantity = product.stock;
    } else {
        item.quantity = quantity;
    }
    
    updateCart();
}

// Fungsi untuk menghapus item dari keranjang
function removeFromCart(productId) {
    if (confirm('Hapus produk dari keranjang?')) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    }
}

// Toggle tampilan keranjang
function toggleCart() {
    cartPopup.classList.toggle('show');
}

// Handle checkout
function handleCheckout() {
    if (cart.length === 0) {
        alert('Keranjang belanja kosong');
        return;
    }
    
    // Simpan data keranjang untuk halaman checkout
    localStorage.setItem('warungku_checkout_data', JSON.stringify(cart));
    
    // Redirect ke halaman checkout
    window.location.href = 'checkout.html';
}

// Handle search
function handleSearch() {
    renderProducts();
}

// Apply filters
function applyFilters() {
    filters.minPrice = document.getElementById('minPrice').value ? parseInt(document.getElementById('minPrice').value) : null;
    filters.maxPrice = document.getElementById('maxPrice').value ? parseInt(document.getElementById('maxPrice').value) : null;
    
    filters.stock = [];
    document.querySelectorAll('input[name="stock"]:checked').forEach(checkbox => {
        filters.stock.push(checkbox.value);
    });
    
    renderProducts();
    filterOptions.classList.remove('show');
}

// Handle admin login
function handleAdminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Validasi sederhana
    if (!username || !password) {
        alert('Username dan password harus diisi');
        return;
    }
    
    // Dalam implementasi nyata, ini akan panggil API untuk login
    // Simulasi login sederhana
    const businessData = JSON.parse(localStorage.getItem('warungku_business_data')) || {};
    
    if (username === businessData.username && password === businessData.password) {
        alert('Login berhasil!');
        loginModal.classList.remove('show');
        // Redirect ke halaman admin
        window.location.href = 'admin-inventory.html';
    } else {
        alert('Username atau password salah');
    }
}