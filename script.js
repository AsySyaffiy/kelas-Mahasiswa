// 1. DATABASE RUANGAN
let dataRuangan = {};
let currentRoomBooking = ""; // Menyimpan ID ruangan yang sedang diproses (booking/lapor)

// membuat 28 Ruangan (Lantai 3-6/kelas 7 ruangan)
function initData() {
    for (let l = 3; l <= 6; l++) {
        for (let n = 1; n <= 7; n++) {
            let id = `${l}0${n}`; // Menghasilkan: 301, 302, ... 607
            dataRuangan[id] = { 
                status: 'kosong', 
                fasilitas: 'AC, Proyektor, Papan Tulis', 
                bookings: [] // Array kosong untuk menampung jadwal booking
            };
        }
    }
}
// Jalankan fungsi saat web dimuat
initData();

// 2. RENDER TAMPILAN SESUAI LANTAI

function gantiLantai(lantai) {
    // Ubah warna tombol filter agar aktif
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-lantai-${lantai}`).classList.add('active');

    // Kosongkan container
    const container = document.getElementById('ruanganContainer');
    container.innerHTML = '';

    // Cetak 7 kartu ruangan untuk lantai terpilih
    for (let n = 1; n <= 7; n++) {
        let id = `${lantai}0${n}`;
        let r = dataRuangan[id];
        let isKosong = r.status === 'kosong';

        // Buat HTML untuk kotak info booking JIKA ada data booking
        let htmlBooking = '';
        if (r.bookings.length > 0) {
            htmlBooking = `
            <div class="booking-info">
                <strong>📝 Jadwal Booking Hari Ini:</strong>
                <button class="btn-delete-booking" onclick="hapusBooking('${id}')" title="Batalkan Booking">✖</button>
                `;
            
            // Masukkan list data booking
            r.bookings.forEach(b => {
                htmlBooking += `<li>${b.waktu} - <b>${b.nama}</b> (${b.kegiatan})</li>`;
            });
            
            htmlBooking += `</div>`;
        }

        // Susun struktur HTML per kartu
        container.innerHTML += `
            <div class="card glass" id="card-${id}">
                <div class="room-header">
                    <h2>Djuanda ${id}</h2>
                    <span class="status ${isKosong ? 'badge-kosong' : 'badge-dipakai'}">
                        ${r.status}
                    </span>
                </div>
                
                <p class="info">Fasilitas: ${r.fasilitas}</p>
                
                ${htmlBooking}
                
                <div class="action-buttons">
                    <button class="btn ${isKosong ? 'btn-primary' : 'btn-danger'}" onclick="toggleStatus('${id}')">
                        ${isKosong ? 'Kunci Ruangan' : 'Kosongkan Ruangan'}
                    </button>
                    <button class="btn btn-outline" onclick="bukaJadwal('${id}')">Lihat Jadwal</button>
                    <button class="btn btn-purple" onclick="bukaBooking('${id}')">Booking</button>
                    <button class="btn btn-outline-warning" onclick="bukaLapor('${id}')">Lapor</button>
                </div>
            </div>`;
    }
}

// Render awal (Tampilkan lantai 3)
gantiLantai(3);



// 3. FUNGSI MENGUBAH STATUS (KUNCI/BUKA)

function toggleStatus(id) {
    // Toggle status di database
    dataRuangan[id].status = dataRuangan[id].status === 'kosong' ? 'dipakai' : 'kosong';
    // Render ulang layar (ambil karakter pertama dari id untuk tahu lantainya)
    gantiLantai(id.charAt(0));
}

// 4. FUNGSI UMUM MODAL

function tutupModal(id) { 
    document.getElementById(id).style.display = 'none'; 
}

// 5. FITUR LAPOR KERUSAKAN VIA WA

function bukaLapor(id) {
    currentRoomBooking = id;
    document.getElementById('modalTitle').innerText = `Lapor: Djuanda ${id}`;
    document.getElementById('laporModal').style.display = 'flex';
}

document.getElementById('laporForm').onsubmit = function(e) {
    e.preventDefault(); // Cegah reload web
    
    let fasilitas = document.getElementById('itemRusak').value;
    let catatan = document.getElementById('catatanRusak').value;
    const msg = `Halo Pengurus,\n\nAda laporan kerusakan di *Djuanda ${currentRoomBooking}*.\n\nFasilitas: ${fasilitas}\nInfo Tambahan: ${catatan}\n\nMohon dicek.`;
    
    // Buka tab WA
    window.open(`https://wa.me/628345678910?text=${encodeURIComponent(msg)}`);
    
    this.reset();
    tutupModal('laporModal');
};

// 6. FITUR LIHAT JADWAL KELAS

function bukaJadwal(id) {
    document.getElementById('jadwalTitle').innerText = `Jadwal Djuanda ${id}`;
    
    // Simulasi jadwal bawaan
    let htmlJadwal = `
        <li><strong style="color: var(--kosong-color);">08:00 - 10:00: Kosong</strong></li>
        <li><span style="color: gray;">10:00 - 12:00: Rekayasa Perangkat Lunak TI24B</span></li>
        <li><strong style="color: var(--kosong-color);">13:00 - 15:00: Kosong</strong></li>
    `;
    
    document.getElementById('daftarJadwal').innerHTML = htmlJadwal;
    document.getElementById('jadwalModal').style.display = 'flex';
}

// 7. FITUR BOOKING & BATALKAN BOOKING

function bukaBooking(id) {
    currentRoomBooking = id;
    document.getElementById('bookingTitle').innerText = `Booking Djuanda ${id}`;
    document.getElementById('bookingModal').style.display = 'flex';
}

// Proses Menyimpan Booking
document.getElementById('bookingForm').onsubmit = function(e) {
    e.preventDefault();
    
    // Memasukkan data ke array bookings milik ruangan tersebut
    dataRuangan[currentRoomBooking].bookings.push({
        nama: document.getElementById('namaKelompok').value,
        waktu: document.getElementById('waktuPinjam').value,
        kegiatan: document.getElementById('kegiatanKelompok').value
    });
    
    this.reset();
    tutupModal('bookingModal');
    // Render ulang layar agar kotak booking langsung muncul
    gantiLantai(currentRoomBooking.charAt(0));
};

// Menghapus Booking (X)
function hapusBooking(id) {
    let konfirmasi = confirm(`Apakah Anda yakin ingin membatalkan jadwal booking untuk ruangan Djuanda ${id}?`);
    if (konfirmasi) {
        dataRuangan[id].bookings = []; // Kosongkan database simulasi
        gantiLantai(id.charAt(0));     // Render ulang layar agar kotak hilang
    }
}
