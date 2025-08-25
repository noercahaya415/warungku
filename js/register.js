// Inisialisasi peta
let map, marker;

function initMap() {
    map = L.map('address-map').setView([-6.2088, 106.8456], 13);
    marker = L.marker([-6.2088, 106.8456], {draggable: true}).addTo(map);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Update marker position when dragged
    marker.on('dragend', function(event) {
        let position = marker.getLatLng();
        console.log("Lokasi dipilih: " + position.lat + ", " + position.lng);
    });
}

// Pilih jenis usaha
function selectBusinessType(type) {
    document.querySelectorAll('.business-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    let selectedOption = document.querySelector(`.business-option:nth-child(${type === 'retail' ? 1 : 2})`);
    selectedOption.classList.add('selected');
    
    document.getElementById('business-type').value = type;
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentNode.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Form validation
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi peta setelah dokumen dimuat
    initMap();
    
    // Set default business type to retail
    selectBusinessType('retail');
    
    // Form submission
    document.getElementById('registration-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validasi password
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('Kata sandi tidak cocok!');
            return;
        }
        
        // Validasi jenis usaha
        const businessType = document.getElementById('business-type').value;
        if (!businessType) {
            alert('Pilih jenis usaha terlebih dahulu!');
            return;
        }
        
        // Jika semua validasi berhasil
        alert('Pendaftaran berhasil! Anda akan diarahkan ke halaman sesuai jenis usaha.');
        
        // Redirect berdasarkan jenis usaha
        if (businessType === 'retail') {
            window.location.href = 'pages/dashboard.html';
        } else {
            window.location.href = 'pages/dashboard.html';
        }
    });
});