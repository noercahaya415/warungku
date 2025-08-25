// Admin Retail Management Script
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Scanner instances
    let html5QrcodeScannerMasuk = null;
    let html5QrcodeScannerKeluar = null;
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
            
            // If switching to stock masuk or keluar, stop any active scanners
            if (tabId !== 'stock-masuk') {
                stopScanner('masuk');
            }
            if (tabId !== 'stock-keluar') {
                stopScanner('keluar');
            }
        });
    });
    
    // Stock Masuk Functions
    const scanMasukBtn = document.getElementById('scanMasukBtn');
    const stopScanMasukBtn = document.getElementById('stopScanMasukBtn');
    const scannerMasukContainer = document.getElementById('scannerMasukContainer');
    
    if (scanMasukBtn) {
        scanMasukBtn.addEventListener('click', () => {
            startScanner('masuk');
        });
    }
    
    if (stopScanMasukBtn) {
        stopScanMasukBtn.addEventListener('click', () => {
            stopScanner('masuk');
        });
    }
    
    // Stock Keluar Functions
    const scanKeluarBtn = document.getElementById('scanKeluarBtn');
    const stopScanKeluarBtn = document.getElementById('stopScanKeluarBtn');
    const scannerKeluarContainer = document.getElementById('scannerKeluarContainer');
    
    if (scanKeluarBtn) {
        scanKeluarBtn.addEventListener('click', () => {
            startScanner('keluar');
        });
    }
    
    if (stopScanKeluarBtn) {
        stopScanKeluarBtn.addEventListener('click', () => {
            stopScanner('keluar');
        });
    }
    
    // Foto Upload
    const uploadFotoBtn = document.getElementById('uploadFotoBtn');
    const fotoBarangInput = document.getElementById('fotoBarang');
    const fotoPreview = document.getElementById('fotoPreview');
    
    if (uploadFotoBtn && fotoBarangInput) {
        uploadFotoBtn.addEventListener('click', () => {
            fotoBarangInput.click();
        });
        
        fotoBarangInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    fotoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview Foto Barang">`;
                }
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Simpan Barang Masuk
    const simpanBarangMasukBtn = document.getElementById('simpanBarangMasukBtn');
    if (simpanBarangMasukBtn) {
        simpanBarangMasukBtn.addEventListener('click', simpanBarangMasuk);
    }
    
    // Reset Form
    const resetFormBtn = document.getElementById('resetFormBtn');
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', resetForm);
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin logout?')) {
                window.location.href = 'warung-retail.html';
            }
        });
    }
    
    // Initialize data
    loadStockData();
    loadRiwayatMasuk();
    loadRiwayatKeluar();
    
    // Scanner Functions
    function startScanner(type) {
        const scannerId = type === 'masuk' ? 'reader-masuk' : 'reader-keluar';
        const container = type === 'masuk' ? scannerMasukContainer : scannerKeluarContainer;
        
        // Show scanner container
        container.style.display = 'block';
        
        // Initialize scanner
        if (type === 'masuk') {
            html5QrcodeScannerMasuk = new Html5QrcodeScanner(
                scannerId, 
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 } 
                },
                false
            );
            
            html5QrcodeScannerMasuk.render(onScanSuccessMasuk, onScanFailure);
        } else {
            html5QrcodeScannerKeluar = new Html5QrcodeScanner(
                scannerId, 
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 } 
                },
                false
            );
            
            html5QrcodeScannerKeluar.render(onScanSuccessKeluar, onScanFailure);
        }
    }
    
    function stopScanner(type) {
        const container = type === 'masuk' ? scannerMasukContainer : scannerKeluarContainer;
        
        // Hide scanner container
        container.style.display = 'none';
        
        // Stop scanner
        if (type === 'masuk' && html5QrcodeScannerMasuk) {
            html5QrcodeScannerMasuk.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScannerMasuk. ", error);
            });
        } else if (type === 'keluar' && html5QrcodeScannerKeluar) {
            html5QrcodeScannerKeluar.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScannerKeluar. ", error);
            });
        }
    }
    
    function onScanSuccessMasuk(decodedText, decodedResult) {
        // Handle the scanned code for stock masuk
        console.log(`Scan result: ${decodedText}`, decodedResult);
        
        // Populate barcode field
        document.getElementById('barcode').value = decodedText;
        
        // Try to find product in database
        findProductByBarcode(decodedText, 'masuk');
        
        // Stop scanner after successful scan
        stopScanner('masuk');
    }
    
    function onScanSuccessKeluar(decodedText, decodedResult) {
        // Handle the scanned code for stock keluar
        console.log(`Scan result: ${decodedText}`, decodedResult);
        
        // Try to find product in database and add to cart
        findProductByBarcode(decodedText, 'keluar');
    }
    
    function onScanFailure(error) {
        // Handle scan failure
        console.warn(`Scan error: ${error}`);
    }
    
    function findProductByBarcode(barcode, type) {
        // In a real application, this would query a database
        // For demo purposes, we'll use localStorage or mock data
        
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.barcode === barcode);
        
        if (product) {
            if (type === 'masuk') {
                // Populate form fields for stock masuk
                document.getElementById('namaBarang').value = product.nama || '';
                document.getElementById('kategori').value = product.kategori || '';
                document.getElementById('hargaBeli').value = product.hargaBeli || '';
                document.getElementById('hargaJual').value = product.hargaJual || '';
            } else {
                // Add to cart for stock keluar
                addToCart(product);
            }
        } else {
            if (type === 'masuk') {
                // Clear nama barang if product not found (new product)
                document.getElementById('namaBarang').value = '';
                alert('Produk tidak ditemukan. Silakan isi data produk baru.');
            } else {
                alert('Produk tidak ditemukan dalam database.');
            }
        }
    }
    
    function simpanBarangMasuk() {
        // Get form values
        const barcode = document.getElementById('barcode').value;
        const namaBarang = document.getElementById('namaBarang').value;
        const kategori = document.getElementById('kategori').value;
        const hargaBeli = document.getElementById('hargaBeli').value;
        const hargaJual = document.getElementById('hargaJual').value;
        const jumlahMasuk = document.getElementById('jumlahMasuk').value;
        const supplier = document.getElementById('supplier').value;
        
        // Validate form
        if (!barcode || !namaBarang || !kategori || !hargaBeli || !hargaJual || !jumlahMasuk) {
            alert('Harap isi semua field yang wajib diisi!');
            return;
        }
        
        // Create product object
        const product = {
            barcode,
            nama: namaBarang,
            kategori,
            hargaBeli: parseFloat(hargaBeli),
            hargaJual: parseFloat(hargaJual),
            stok: parseInt(jumlahMasuk),
            supplier
        };
        
        // Save to localStorage (in a real app, this would be an API call)
        saveProduct(product);
        
        // Add to riwayat masuk
        addToRiwayatMasuk(product, parseInt(jumlahMasuk));
        
        // Reset form
        resetForm();
        
        // Show success message
        alert('Data barang berhasil disimpan!');
    }
    
    function saveProduct(product) {
        // Get existing products from localStorage
        const products = JSON.parse(localStorage.getItem('products')) || [];
        
        // Check if product already exists
        const existingIndex = products.findIndex(p => p.barcode === product.barcode);
        
        if (existingIndex >= 0) {
            // Update existing product
            products[existingIndex].stok += product.stok;
            products[existingIndex].hargaBeli = product.hargaBeli;
            products[existingIndex].hargaJual = product.hargaJual;
        } else {
            // Add new product
            products.push(product);
        }
        
        // Save back to localStorage
        localStorage.setItem('products', JSON.stringify(products));
        
        // Refresh stock table
        loadStockData();
    }
    
    function addToRiwayatMasuk(product, jumlah) {
        // Get existing riwayat from localStorage
        const riwayat = JSON.parse(localStorage.getItem('riwayatMasuk')) || [];
        
        // Add new entry
        riwayat.push({
            tanggal: new Date().toISOString(),
            barcode: product.barcode,
            nama: product.nama,
            kategori: product.kategori,
            hargaBeli: product.hargaBeli,
            jumlah: jumlah,
            supplier: product.supplier || ''
        });
        
        // Save back to localStorage
        localStorage.setItem('riwayatMasuk', JSON.stringify(riwayat));
        
        // Refresh riwayat table
        loadRiwayatMasuk();
    }
    
    function resetForm() {
        // Reset form fields
        document.getElementById('barcode').value = '';
        document.getElementById('namaBarang').value = '';
        document.getElementById('kategori').value = '';
        document.getElementById('hargaBeli').value = '';
        document.getElementById('hargaJual').value = '';
        document.getElementById('jumlahMasuk').value = '1';
        document.getElementById('supplier').value = '';
        document.getElementById('fotoPreview').innerHTML = '';
    }
    
    function loadStockData() {
        const tableBody = document.getElementById('tableStockBody');
        if (!tableBody) return;
        
        // Get products from localStorage
        const products = JSON.parse(localStorage.getItem('products')) || [];
        
        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="no-data">Tidak ada data stok</td></tr>';
            return;
        }
        
        // Clear table
        tableBody.innerHTML = '';
        
        // Calculate summary values
        let totalNilaiStok = 0;
        let totalItem = products.length;
        let itemHampirHabis = 0;
        
        // Populate table
        products.forEach(product => {
            const nilaiStok = product.hargaBeli * product.stok;
            totalNilaiStok += nilaiStok;
            
            if (product.stok < 5) {
                itemHampirHabis++;
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.barcode}</td>
                <td>${product.nama}</td>
                <td>${product.kategori}</td>
                <td>Rp ${product.hargaBeli.toLocaleString('id-ID')}</td>
                <td>Rp ${product.hargaJual.toLocaleString('id-ID')}</td>
                <td>${product.stok}</td>
                <td>
                    <button class="action-btn edit" data-barcode="${product.barcode}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-barcode="${product.barcode}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Update summary
        document.getElementById('totalNilaiStok').textContent = `Rp ${totalNilaiStok.toLocaleString('id-ID')}`;
        document.getElementById('totalItem').textContent = totalItem;
        document.getElementById('itemHampirHabis').textContent = itemHampirHabis;
        
        // Add event listeners to action buttons
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const barcode = btn.getAttribute('data-barcode');
                editProduct(barcode);
            });
        });
        
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const barcode = btn.getAttribute('data-barcode');
                deleteProduct(barcode);
            });
        });
    }
    
    function loadRiwayatMasuk() {
        const tableBody = document.getElementById('tableMasukBody');
        if (!tableBody) return;
        
        // Get riwayat from localStorage
        const riwayat = JSON.parse(localStorage.getItem('riwayatMasuk')) || [];
        
        if (riwayat.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="no-data">Belum ada data barang masuk</td></tr>';
            return;
        }
        
        // Clear table
        tableBody.innerHTML = '';
        
        // Populate table
        riwayat.forEach(item => {
            const date = new Date(item.tanggal);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${item.barcode}</td>
                <td>${item.nama}</td>
                <td>${item.kategori}</td>
                <td>Rp ${item.hargaBeli.toLocaleString('id-ID')}</td>
                <td>${item.jumlah}</td>
                <td>${item.supplier || '-'}</td>
                <td>
                    <button class="action-btn">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    function loadRiwayatKeluar() {
        const tableBody = document.getElementById('tableRiwayatKeluarBody');
        if (!tableBody) return;
        
        // Get riwayat from localStorage
        const riwayat = JSON.parse(localStorage.getItem('riwayatKeluar')) || [];
        
        if (riwayat.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="no-data">Belum ada riwayat penjualan</td></tr>';
            return;
        }
        
        // Clear table
        tableBody.innerHTML = '';
        
        // Populate table
        riwayat.forEach(item => {
            const date = new Date(item.tanggal);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${item.invoice}</td>
                <td>${item.jumlahItem}</td>
                <td>Rp ${item.total.toLocaleString('id-ID')}</td>
                <td>${item.metodeBayar}</td>
                <td>
                    <button class="action-btn">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    // Cart functionality for stock keluar
    let cart = [];
    
    function addToCart(product) {
        // Check if product already in cart
        const existingItemIndex = cart.findIndex(item => item.barcode === product.barcode);
        
        if (existingItemIndex >= 0) {
            // Increase quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item to cart
            cart.push({
                barcode: product.barcode,
                nama: product.nama,
                hargaJual: product.hargaJual,
                quantity: 1
            });
        }
        
        // Update cart display
        updateCartDisplay();
    }
    
    function updateCartDisplay() {
        const tableBody = document.getElementById('tableKeluarBody');
        if (!tableBody) return;
        
        if (cart.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="no-data">Belum ada barang keluar</td></tr>';
            document.getElementById('totalPenjualan').textContent = 'Rp 0';
            return;
        }
        
        // Clear table
        tableBody.innerHTML = '';
        
        let totalPenjualan = 0;
        
        // Populate table
        cart.forEach((item, index) => {
            const subtotal = item.hargaJual * item.quantity;
            totalPenjualan += subtotal;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.barcode}</td>
                <td>${item.nama}</td>
                <td>Rp ${item.hargaJual.toLocaleString('id-ID')}</td>
                <td>
                    <input type="number" value="${item.quantity}" min="1" 
                           class="quantity-input" data-index="${index}">
                </td>
                <td>Rp ${subtotal.toLocaleString('id-ID')}</td>
                <td>
                    <button class="action-btn delete" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Update total
        document.getElementById('totalPenjualan').textContent = `Rp ${totalPenjualan.toLocaleString('id-ID')}`;
        
        // Add event listeners
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                const newQuantity = parseInt(e.target.value);
                
                if (newQuantity > 0) {
                    cart[index].quantity = newQuantity;
                    updateCartDisplay();
                }
            });
        });
        
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCartDisplay();
            });
        });
    }
    
    // Checkout process
    const prosesCheckoutBtn = document.getElementById('prosesCheckoutBtn');
    if (prosesCheckoutBtn) {
        prosesCheckoutBtn.addEventListener('click', prosesCheckout);
    }
    
    const resetCheckoutBtn = document.getElementById('resetCheckoutBtn');
    if (resetCheckoutBtn) {
        resetCheckoutBtn.addEventListener('click', () => {
            if (confirm('Batalkan transaksi saat ini?')) {
                cart = [];
                updateCartDisplay();
            }
        });
    }
    
    function prosesCheckout() {
        if (cart.length === 0) {
            alert('Tidak ada barang dalam keranjang!');
            return;
        }
        
        // Get payment method
        const metodeBayar = document.getElementById('metodePembayaran').value;
        
        // Update stock and save transaction
        const products = JSON.parse(localStorage.getItem('products')) || [];
        let allItemsAvailable = true;
        
        // Check if all items have sufficient stock
        cart.forEach(item => {
            const product = products.find(p => p.barcode === item.barcode);
            if (!product || product.stok < item.quantity) {
                allItemsAvailable = false;
                alert(`Stok ${item.nama} tidak mencukupi!`);
            }
        });
        
        if (!allItemsAvailable) return;
        
        // Update stock and create transaction record
        cart.forEach(item => {
            const productIndex = products.findIndex(p => p.barcode === item.barcode);
            if (productIndex >= 0) {
                products[productIndex].stok -= item.quantity;
            }
        });
        
        // Save updated products
        localStorage.setItem('products', JSON.stringify(products));
        
        // Create transaction record
        const transaction = {
            tanggal: new Date().toISOString(),
            invoice: 'INV-' + Date.now(),
            items: [...cart],
            jumlahItem: cart.reduce((total, item) => total + item.quantity, 0),
            total: cart.reduce((total, item) => total + (item.hargaJual * item.quantity), 0),
            metodeBayar: metodeBayar
        };
        
        // Save transaction to riwayat
        const riwayat = JSON.parse(localStorage.getItem('riwayatKeluar')) || [];
        riwayat.push(transaction);
        localStorage.setItem('riwayatKeluar', JSON.stringify(riwayat));
        
        // Show success message
        alert(`Transaksi berhasil! Invoice: ${transaction.invoice}`);
        
        // Reset cart
        cart = [];
        updateCartDisplay();
        
        // Refresh stock data
        loadStockData();
        loadRiwayatKeluar();
    }
    
    // Edit and delete product functions
    function editProduct(barcode) {
        // Get product data
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.barcode === barcode);
        
        if (!product) return;
        
        // Create edit form in modal
        const modal = document.getElementById('editModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <div class="form-group">
                <label for="editBarcode">Barcode</label>
                <input type="text" id="editBarcode" value="${product.barcode}" readonly>
            </div>
            <div class="form-group">
                <label for="editNama">Nama Barang</label>
                <input type="text" id="editNama" value="${product.nama}">
            </div>
            <div class="form-group">
                <label for="editKategori">Kategori</label>
                <select id="editKategori">
                    <option value="sembako" ${product.kategori === 'sembako' ? 'selected' : ''}>Sembako</option>
                    <option value="makanan" ${product.kategori === 'makanan' ? 'selected' : ''}>Makanan</option>
                    <option value="minuman" ${product.kategori === 'minuman' ? 'selected' : ''}>Minuman</option>
                    <option value="sabun-pembersih" ${product.kategori === 'sabun-pembersih' ? 'selected' : ''}>Sabun & Pembersih</option>
                    <option value="peralatan-rt" ${product.kategori === 'peralatan-rt' ? 'selected' : ''}>Peralatan RT</option>
                    <option value="sayur-buah" ${product.kategori === 'sayur-buah' ? 'selected' : ''}>Sayur & Buah</option>
                    <option value="bumbu" ${product.kategori === 'bumbu' ? 'selected' : ''}>Bumbu</option>
                    <option value="obat" ${product.kategori === 'obat' ? 'selected' : ''}>Obat-obatan</option>
                    <option value="atk" ${product.kategori === 'atk' ? 'selected' : ''}>ATK</option>
                    <option value="rokok" ${product.kategori === 'rokok' ? 'selected' : ''}>Rokok</option>
                </select>
            </div>
            <div class="form-group">
                <label for="editHargaBeli">Harga Beli</label>
                <input type="number" id="editHargaBeli" value="${product.hargaBeli}">
            </div>
            <div class="form-group">
                <label for="editHargaJual">Harga Jual</label>
                <input type="number" id="editHargaJual" value="${product.hargaJual}">
            </div>
            <div class="form-group">
                <label for="editStok">Stok</label>
                <input type="number" id="editStok" value="${product.stok}">
            </div>
            <div class="form-actions">
                <button class="btn-primary" id="saveEditBtn">Simpan</button>
                <button class="btn-secondary" id="cancelEditBtn">Batal</button>
            </div>
        `;
        
        // Show modal
        modal.style.display = 'block';
        
        // Add event listeners
        document.getElementById('saveEditBtn').addEventListener('click', () => {
            // Get updated values
            const updatedProduct = {
                barcode: document.getElementById('editBarcode').value,
                nama: document.getElementById('editNama').value,
                kategori: document.getElementById('editKategori').value,
                hargaBeli: parseFloat(document.getElementById('editHargaBeli').value),
                hargaJual: parseFloat(document.getElementById('editHargaJual').value),
                stok: parseInt(document.getElementById('editStok').value)
            };
            
            // Update product in array
            const productIndex = products.findIndex(p => p.barcode === barcode);
            if (productIndex >= 0) {
                products[productIndex] = updatedProduct;
                
                // Save to localStorage
                localStorage.setItem('products', JSON.stringify(products));
                
                // Refresh table
                loadStockData();
                
                // Close modal
                modal.style.display = 'none';
                
                alert('Data berhasil diperbarui!');
            }
        });
        
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking on X
        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    function deleteProduct(barcode) {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
        
        // Get products from localStorage
        const products = JSON.parse(localStorage.getItem('products')) || [];
        
        // Filter out the product to delete
        const updatedProducts = products.filter(p => p.barcode !== barcode);
        
        // Save to localStorage
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        
        // Refresh table
        loadStockData();
        
        alert('Produk berhasil dihapus!');
    }
});