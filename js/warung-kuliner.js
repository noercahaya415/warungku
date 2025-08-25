let cart = [];
// Koordinat rumah makan (sesuaikan dengan lokasi sebenarnya)
const RESTAURANT_LOCATION = {
  lat: -6.3284352,
  lng: 106.6714169,
  name: "Warungku Kuliner"
};

let map, userMarker;

// Fungsi inisialisasi peta
function initMap() {
  map = L.map('mini-map').setView([RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng], 14);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  // Marker restoran
  L.marker([RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng])
    .addTo(map)
    .bindPopup(`<b>${RESTAURANT_LOCATION.name}</b>`)
    .openPopup();

  // Marker pengguna (bisa digeser)
  userMarker = L.marker([RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng], {
    draggable: true
  }).addTo(map);

  // Cari lokasi pengguna otomatis
  locateUser();

  // Event saat marker digeser
  userMarker.on('dragend', function(e) {
    updateLocation(userMarker.getLatLng());
  });
}

// Fungsi deteksi lokasi pengguna
function locateUser() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        userMarker.setLatLng(userLoc);
        map.setView(userLoc, 15);
        updateLocation(userLoc);
      },
      (error) => {
        console.log("Pengguna menolak akses lokasi");
        updateLocation(RESTAURANT_LOCATION);
      }
    );
  }
}

// Fungsi update lokasi
function updateLocation(pos) {
  document.getElementById('lokasi-lat').value = pos.lat;
  document.getElementById('lokasi-lng').value = pos.lng;
  calculateDistance(pos);
}

// Fungsi hitung jarak
function calculateDistance(userPos) {
  const R = 6371; // Radius bumi dalam km
  const dLat = (userPos.lat - RESTAURANT_LOCATION.lat) * Math.PI / 180;
  const dLon = (userPos.lng - RESTAURANT_LOCATION.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(RESTAURANT_LOCATION.lat * Math.PI / 180) * 
    Math.cos(userPos.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Pembulatan ke atas ke 1 desimal
  const roundedDistance = Math.ceil(distance * 10) / 10;
  document.getElementById('jarak-display').textContent = `${roundedDistance} km`;
  document.getElementById('jarak').value = roundedDistance;
  
  // Perhitungan ongkir baru:
  // - 0-2 km: Gratis
  // - 2.1-3 km: Rp 5.000
  // - Setiap penambahan 1 km: +Rp 5.000
  let deliveryFee = 0;
  if (roundedDistance > 2) {
    const kmLebih = Math.ceil(roundedDistance - 2); // Pembulatan ke atas
    deliveryFee = kmLebih * 5000;
  }
  
  document.getElementById('delivery-fee').value = deliveryFee;
  updateOrderSummary();
}

function displayMenu() {
  const menuList = document.getElementById('menu-list');
  
  // Hanya buat kategori jika belum ada
  if (!document.getElementById('food-grid')) {
    const foodSection = document.createElement('div');
    foodSection.className = 'menu-category';
    foodSection.innerHTML = '<h3>Makanan</h3><div class="menu-grid" id="food-grid"></div>';
    menuList.appendChild(foodSection);
    
    menuData.makanan.forEach(item => {
      document.getElementById('food-grid').appendChild(createMenuItem(item));
    });
  }
  
  if (!document.getElementById('drink-grid')) {
    const drinkSection = document.createElement('div');
    drinkSection.className = 'menu-category';
    drinkSection.innerHTML = '<h3>Minuman</h3><div class="menu-grid" id="drink-grid"></div>';
    menuList.appendChild(drinkSection);
    
    menuData.minuman.forEach(item => {
      document.getElementById('drink-grid').appendChild(createMenuItem(item));
    });
  }
}

function createMenuItem(item) {
  const menuItem = document.createElement('div');
  menuItem.className = 'menu-item';
  
  const img = document.createElement('img');
  img.src = item.FOTO;
  img.alt = item['NAMA MENU'];
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'menu-item-content';
  
  const title = document.createElement('h4');
  title.textContent = item['NAMA MENU'];
  
  const descContainer = document.createElement('div');
  descContainer.className = 'menu-description';
  descContainer.textContent = item.DESKRIPSI;
  
  const readMoreBtn = document.createElement('button');
  readMoreBtn.className = 'read-more-btn';
  readMoreBtn.textContent = 'More';
  
  const priceControls = document.createElement('div');
  priceControls.className = 'price-controls';
  
  const priceSpan = document.createElement('span');
  priceSpan.className = 'price';
  priceSpan.textContent = `Rp ${item.HARGA.toLocaleString('id-ID')}`;
  
  const quantityDiv = document.createElement('div');
  quantityDiv.className = 'quantity-controls';
  quantityDiv.innerHTML = `
    <button class="decrease">-</button>
    <span class="quantity">0</span>
    <button class="increase">+</button>
  `;
  
  priceControls.appendChild(priceSpan);
  priceControls.appendChild(quantityDiv);
  
  contentDiv.appendChild(title);
  contentDiv.appendChild(descContainer);
  contentDiv.appendChild(readMoreBtn);
  contentDiv.appendChild(priceControls);
  
  menuItem.appendChild(img);
  menuItem.appendChild(contentDiv);
  
  readMoreBtn.addEventListener('click', (e) => {
    e.preventDefault();
    descContainer.classList.toggle('expanded');
    readMoreBtn.textContent = 
      descContainer.classList.contains('expanded') ? 'Less' : 'More';
  });
  
  const increaseBtn = quantityDiv.querySelector('.increase');
  const decreaseBtn = quantityDiv.querySelector('.decrease');
  const quantitySpan = quantityDiv.querySelector('.quantity');
  
  increaseBtn.addEventListener('click', () => {
    const currentQty = parseInt(quantitySpan.textContent);
    quantitySpan.textContent = currentQty + 1;
    updateCart(item, currentQty + 1);
  });
  
  decreaseBtn.addEventListener('click', () => {
    const currentQty = parseInt(quantitySpan.textContent);
    if (currentQty > 0) {
      quantitySpan.textContent = currentQty - 1;
      updateCart(item, currentQty - 1);
    }
  });
  
  return menuItem;
}

function updateCart(item, quantity) {
  const existingItemIndex = cart.findIndex(cartItem => cartItem.name === item['NAMA MENU']);
  
  if (existingItemIndex !== -1) {
    if (quantity === 0) {
      cart.splice(existingItemIndex, 1);
    } else {
      cart[existingItemIndex].quantity = quantity;
    }
  } else if (quantity > 0) {
    cart.push({
      name: item['NAMA MENU'],
      price: item.HARGA,
      quantity: quantity
    });
  }
  
  updateOrderSummary();
}

function updateOrderSummary() {
  const orderItems = document.getElementById('order-items');
  const subtotalElement = document.getElementById('subtotal');
  const totalElement = document.getElementById('total');
  const waLink = document.getElementById('wa-link');
  
  orderItems.innerHTML = '';
  
  let subtotal = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    orderItem.innerHTML = `
      <div class="order-item-name">${item.name}</div>
      <div class="order-item-quantity">${item.quantity}</div>
      <div class="order-item-price">Rp ${itemTotal.toLocaleString('id-ID')}</div>
    `;
    orderItems.appendChild(orderItem);
  });
  
  const deliveryFee = parseInt(document.getElementById('delivery-fee').value) || 0;
  const serviceFee = parseInt(document.getElementById('service-fee').value) || 0;
  const applyTax = document.getElementById('tax-toggle').checked;
  const tax = applyTax ? subtotal * 0.1 : 0;

  const total = subtotal + deliveryFee + serviceFee + tax;

  subtotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
  
  orderItems.innerHTML += `
    <div class="order-item">
      <div class="order-item-name">Ongkos Kirim</div>
      <div class="order-item-price">Rp ${deliveryFee.toLocaleString('id-ID')}</div>
    </div>
    <div class="order-item">
      <div class="order-item-name">Biaya Servis</div>
      <div class="order-item-price">Rp ${serviceFee.toLocaleString('id-ID')}</div>
    </div>
    ${applyTax ? `
    <div class="order-item">
      <div class="order-item-name">Pajak (10%)</div>
      <div class="order-item-price">Rp ${tax.toLocaleString('id-ID')}</div>
    </div>
    ` : ''}
  `;

  totalElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;

  if (cart.length > 0) {
    const customerForm = document.getElementById('customer-form');
    const nama = customerForm.nama.value;
    const telepon = customerForm.telepon.value;
    const alamat = customerForm.alamat.value;
    const catatan = customerForm.catatan.value;
    const jarak = document.getElementById('jarak').value;
    const lokasiLat = document.getElementById('lokasi-lat').value;
    const lokasiLng = document.getElementById('lokasi-lng').value;
    
    const now = new Date();
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    const orderTime = now.toLocaleDateString('id-ID', options);
    
    let message = `⏰ *Waktu Pemesanan:* ${orderTime}\n\n`;
    message += `──────────────────────\n\n`;
    message += `Halo, saya ingin memesan:\n\n`;
    message += `*Nama:* ${nama || '-'}\n`;
    message += `*No. Telepon:* ${telepon || '-'}\n`;
    message += `*Alamat:* ${alamat}\n`;
    message += `*Lokasi:* https://maps.google.com/?q=${lokasiLat},${lokasiLng}\n`;
    message += `*Jarak dari restoran:* ${jarak} km\n\n`;
    
    message += `*Detail Pesanan:*\n`;
    cart.forEach(item => {
      message += `- ${item.name} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
    });
    
    message += `\n*Subtotal:* Rp ${subtotal.toLocaleString('id-ID')}\n`;
    if (deliveryFee > 0) message += `*Ongkos Kirim:* Rp ${deliveryFee.toLocaleString('id-ID')}\n`;
    if (serviceFee > 0) message += `*Biaya Servis:* Rp ${serviceFee.toLocaleString('id-ID')}\n`;
    if (applyTax) message += `*Pajak (10%):* Rp ${tax.toLocaleString('id-ID')}\n`;
    message += `*Total:* Rp ${total.toLocaleString('id-ID')}\n`;
    
    if (catatan) message += `\n*Catatan:* ${catatan}\n`;
    message += `\nTerima kasih!`;
    
    waLink.href = `https://wa.me/6285880428160?text=${encodeURIComponent(message)}`;
    waLink.style.display = 'block';
  } else {
    waLink.style.display = 'none';
  }
}

// Data menu
const menuData = {
  "makanan": [
    {
      "NAMA MENU": "Nasi Putih",
      "FOTO": "images/nasiputih.png",
      "DESKRIPSI": "Butiran putih berkilau seperti embun pagi, nasi dari beras Solok memancarkan kesederhanaan yang memikat. Di setiap suapannya, tersimpan kelembutan tekstur pulen dan aroma harum alami—seperti napas sawah Minang yang masih segar. Bukan sekadar pendamping, ia adalah dasar sempurna yang merangkul setiap rempah dan bumbu, menghadirkan harmoni dalam kesederhanaan.",
      "HARGA": 3000
    },
    {
      "NAMA MENU": "Rendang",
      "FOTO": "images/rendang.png",
      "DESKRIPSI": "Rendang adalah mahakarya kuliner Minangkabau yang dimasak dengan penuh kesabaran hingga bumbu meresap sempurna ke dalam daging. Terbuat dari daging sapi pilihan yang lembut dan padat, rendang dimasak perlahan bersama santan dan rempah-rempah khas hingga menghasilkan warna cokelat gelap yang menggoda. Setiap suapan menghadirkan harmoni rasa gurih, pedas, dan manis yang mendalam—bukan sekadar hidangan, tapi pengalaman rasa yang menghangatkan jiwa.",
      "HARGA": 20000
    },
    {
      "NAMA MENU": "Udang Balado",
      "FOTO": "images/udang.png",
      "DESKRIPSI": "Udang balado khas Padang adalah perpaduan sempurna antara kelezatan laut dan ledakan rasa dari sambal merah Minang yang khas. Udang segar dimasak dengan bumbu balado yang kaya akan cabai, bawang merah, dan tomat, menciptakan warna merah menyala yang memikat mata. Setiap udang terbalut sempurna oleh sambal pedas-gurih yang meresap hingga ke dalam, menghasilkan cita rasa yang kuat namun seimbang. Disajikan hangat dengan nasi putih pulen, udang balado menghadirkan keindahan dan kekayaan rasa dalam satu sajian estetik yang menggugah selera.",
      "HARGA": 20000
    },
    {
      "NAMA MENU": "Cumi",
      "FOTO": "images/cumi.png",
      "DESKRIPSI": "Gulai Cumi khas Padang adalah sajian laut yang kaya rasa dan tampil memikat dalam balutan kuah santan kental berwarna kuning keemasan. Cumi segar, yang kadang diisi dengan telur atau tahu, dimasak bersama rempah khas Minang seperti kunyit, jahe, dan serai, menghasilkan aroma harum yang menggoda. Teksturnya yang kenyal berpadu dengan gurih pedasnya kuah gulai menciptakan sensasi rasa yang kompleks namun harmonis. Disajikan dengan tampilan sederhana namun elegan, gulai cumi ini mencerminkan keindahan dan kekayaan kuliner Minang dalam satu piring yang estetik.",
      "HARGA": 20000
    },
    {
      "NAMA MENU": "Dendeng Batokok",
      "FOTO": "images/dendengbatokok.png",
      "DESKRIPSI": "Dendeng Batokok khas Padang adalah sajian daging sapi yang tipis, dipukul-pukul hingga pipih, lalu digoreng kering dan disiram sambal cabai hijau segar yang menggoda. Perpaduan warna daging kecokelatan dengan sambal lado mudo yang terang menciptakan tampilan yang estetik dan menggugah selera. Tekstur dendeng yang renyah di luar namun tetap empuk di dalam berpadu sempurna dengan rasa pedas, gurih, dan sedikit asam dari sambal khas Minang. Sajian ini bukan hanya kaya rasa, tapi juga mencerminkan keunikan teknik memasak dan kekayaan kuliner Ranah Minang.",
      "HARGA": 20000
    },
    {
      "NAMA MENU": "Kalio",
      "FOTO": "images/kalio.png",
      "DESKRIPSI": "Kalio adalah sajian khas Minang yang menggoda, terbuat dari potongan daging yang dimasak perlahan dalam kuah santan kental berwarna cokelat keemasan. Kaya akan rempah-rempah seperti lengkuas, kunyit, dan daun jeruk, kalio menghadirkan aroma harum dan rasa gurih manis yang menyatu sempurna. Teksturnya lembut meresap hingga ke serat daging, menciptakan pengalaman makan yang dalam dan autentik khas ranah Minang.",
      "HARGA": 20000
    },
    {
      "NAMA MENU": "Ayam Bakar",
      "FOTO": "images/ayambakar.png",
      "DESKRIPSI": "Ayam bakar khas Padang adalah sajian penuh pesona yang memadukan keharuman bumbu rempah dengan aroma asap pembakaran yang menggoda. Terbuat dari potongan ayam pilihan yang telah dimarinasi dengan bumbu kunyit, bawang putih, dan ketumbar, lalu dibakar hingga kecokelatan sempurna. Setiap suapan menghadirkan perpaduan rasa gurih, manis, dan sedikit pedas yang meresap hingga ke tulang. Disajikan dengan sambal lado merah yang segar dan nasi hangat, ayam bakar ini adalah perpaduan estetik antara kelezatan dan tradisi kuliner Minang yang otentik.",
      "HARGA": 20000
    },
    {
      "NAMA MENU": "Telur Dadar",
      "FOTO": "images/telurdadar.png",
      "DESKRIPSI": "Telur dadar Padang adalah sajian ikonik yang tebal, gurih, dan penuh dengan isian bumbu serta rempah. Berbeda dari telur dadar biasa, versi Minang ini menggunakan campuran kelapa parut, daun bawang, dan bumbu halus yang kaya rasa, lalu digoreng hingga kecokelatan sempurna. Teksturnya padat di luar namun lembut di dalam, dengan aroma harum dari rempah-rempah yang meresap. Setiap gigitan menghadirkan ledakan rasa gurih, pedas, dan sedikit manis yang khas, menjadikannya hidangan sederhana namun estetik dan memikat selera.",
      "HARGA": 10000
    },
    {
      "NAMA MENU": "Sayur Nangka",
      "FOTO": "images/sayurnangka.png",
      "DESKRIPSI": "Gulai nangka khas Padang adalah sajian sayur yang memikat dengan kuah santan kental berwarna kuning keemasan. Potongan nangka muda yang lembut dimasak bersama bumbu rempah seperti lengkuas, kunyit, dan cabai, menghasilkan aroma harum yang khas. Rasanya gurih, sedikit pedas, dan manis alami dari nangka, menciptakan harmoni rasa yang autentik khas Minang. Disajikan hangat, gulai nangka ini bukan hanya lezat, tapi juga memperkaya pengalaman kuliner dengan keindahan rasa dan warisan budaya yang estetik.",
      "HARGA": 10000
    },
    {
      "NAMA MENU": "Sayur Daun Singkong",
      "FOTO": "images/sayursingkong.png",
      "DESKRIPSI": "Gulai daun singkong khas Padang adalah sajian sederhana yang kaya rasa, dengan daun singkong muda yang dimasak hingga lembut dalam kuah santan kental berwarna hijau kecokelatan. Dibumbui dengan cabai, bawang, dan rempah-rempah khas Minang, gulai ini menghadirkan perpaduan rasa gurih, pedas, dan sedikit pahit yang khas. Tekstur daunnya yang lunak berpadu sempurna dengan kuah santan yang kaya, menciptakan cita rasa autentik yang menggugah selera. Sajian ini mencerminkan keindahan kuliner Minang yang sederhana namun penuh makna dan estetika rasa.",
      "HARGA": 10000
    }
  ],
  "minuman": [
    {
      "NAMA MENU": "Es Teh Manis",
      "FOTO": "images/estehmanis.png",
      "DESKRIPSI": "Es teh manis adalah minuman klasik yang menyegarkan, disajikan dengan tampilan sederhana namun memikat. Teh hitam pekat yang diseduh sempurna dicampur dengan gula pasir, lalu dituang ke atas es batu yang berkilau. Rasanya manis seimbang dengan sentuhan pahit alami teh, menghadirkan kesegaran instan yang melegakan dahaga. Dalam kesederhanaannya, es teh manis adalah teman setia untuk setiap hidangan, memberikan kenikmatan yang timeless dan estetik dalam gelas.",
      "HARGA": 5000
    },
    {
      "NAMA MENU": "Es Jeruk",
      "FOTO": "images/esjeruk.png",
      "DESKRIPSI": "Es jeruk adalah minuman segar yang memancarkan keceriaan dengan warna oranye cerah dan irisan jeruk yang mengambang. Perpaduan manis dan asam dari jeruk segar, ditambah dinginnya es batu, menciptakan sensasi menyegarkan yang langsung membangkitkan semangat. Setiap tegukan menghadirkan ledakan rasa jeruk alami yang cerah, cocok untuk menemani hidangan pedas atau sekadar melepas dahaga di hari yang panas. Sajian ini sederhana, namun estetik dan penuh vitalitas.",
      "HARGA": 7000
    },
    {
      "NAMA MENU": "Jus Alpukat",
      "FOTO": "images/jusalpukat.png",
      "DESKRIPSI": "Jus alpukat adalah minuman creamy dan mewah yang disajikan dengan tampilan hijau lembut yang menenangkan. Alpukat matang dihaluskan dengan susu dan gula, menciptakan tekstur kental yang lembut di lidah. Rasanya manis alami dengan sentuhan gurih khas alpukat, seringkali dilengkapi dengan es serut atau sirup cokelat untuk tambahan kenikmatan. Minuman ini bukan hanya menyegarkan, tapi juga memancarkan keindahan sederhana dan estetika kuliner yang memuaskan.",
      "HARGA": 10000
    },
    {
      "NAMA MENU": "Teh Tawar",
      "FOTO": "images/tehtawar.png",
      "DESKRIPSI": "Teh tawar panas adalah minuman sederhana yang menghadirkan ketenangan dalam cangkir. Disajikan tanpa gula, teh ini memungkinkan penikmatnya merasakan sepenuhnya aroma dan rasa alami daun teh—mulai dari sedikit pahit yang khas hingga aftertaste yang menyegarkan. Warnanya keemasan jernih, memancarkan kehangatan dan kesederhanaan. Dalam setiap tegukan, teh tawar panas menawarkan momen refleksi dan ketenangan, cocok untuk menemani santai sore hari atau memulai pagi dengan penuh kesadaran.",
      "HARGA": 3000
    },
    {
      "NAMA MENU": "Kopi Hitam",
      "FOTO": "images/kopihitam.png",
      "DESKRIPSI": "Kopi hitam adalah minuman klasik yang penuh karakter, disajikan panas dengan aroma menggoda dan rasa pahit yang kompleks. Setiap tegukan menghadirkan kekayaan rasa biji kopi pilihan—dari sedikit asam hingga aftertaste yang dalam—tanpa tambahan gula atau krim yang mengganggu. Warna hitam pekatnya memancarkan elegan dan kesederhanaan, cocok untuk menemani momen refleksi atau memulai hari dengan penuh energi. Kopi hitam adalah pengalaman minum kopi yang autentik dan estetik bagi para penikmat sejati.",
      "HARGA": 5000
    }
  ]
};

// Event listeners untuk form
document.addEventListener('DOMContentLoaded', function() {
  initMap();
  displayMenu();
  
  document.getElementById('service-fee').addEventListener('input', updateOrderSummary);
  document.getElementById('tax-toggle').addEventListener('change', updateOrderSummary);
  
  const formInputs = document.querySelectorAll('#customer-form input, #customer-form textarea');
  formInputs.forEach(input => {
    input.addEventListener('input', updateOrderSummary);
  });
});