# Visualisasi Algoritma Minimum Spanning Tree (MST)
> **Proyek Kelompok Mata Kuliah Struktur Diskrit / Matematika Diskrit**  
> Aplikasi web interaktif untuk memvisualisasikan cara kerja **Algoritma Kruskal** dan **Algoritma Prim** dalam menemukan Pohon Merentang Minimum (*Minimum Spanning Tree*) langkah demi langkah.

---

## 👥 Informasi Kelompok

- **Mata Kuliah:** Struktur Diskrit 2
- **Program Studi / Kelas:** Teknik Informatika Reguler B 2025
- **Dosen Pengampu:** Novi Yusliani, S.Kom., M.T
- **Anggota Kelompok:**
  1. Sabil Alaudin - 09021282530121
  2. Muhammad Syehan Fahrezi Prashya - 09021282530051
  3. Rafa Rasyad Anfero - 09021282530057
  4. M. Aditia Putra Pratama - 09021282530045

---

## 💡 Tentang Proyek

Aplikasi ini dibangun untuk memberikan pemahaman visual intuitif tentang konsep *Pohon Merentang Minimum* (*Minimum Spanning Tree* / MST) pada graf terhubung berbobot. Pengguna dapat merancang graf sendiri atau menggunakan contoh bawaan, lalu mengamati secara langsung bagaimana kedua algoritma greedy (Kruskal dan Prim) memutuskan apakah suatu sisi diterima atau ditolak.

### Batasan Teknologi (Zero-Dependency)
- **HTML5, CSS3, dan Vanilla JavaScript murni.**
- **Tanpa Framework:** Tidak menggunakan React, Next.js, Vue, atau build tool apa pun.
- **Tanpa Library Eksternal:** Graf digambar menggunakan **SVG murni** dan dianimasikan dengan **CSS transitions**.
- **Portable & Offline:** Dapat langsung dijalankan hanya dengan **klik ganda file HTML di browser** (`file://`), tanpa memerlukan server lokal (bebas dari isu CORS ES module).

---

## ✨ Fitur-Fitur Utama

### 1. Landing Page (`index.html`)
- Penjelasan konsep dasar graf, pohon, dan sifat-sifat MST ($V - 1$ sisi, bebas siklus, bobot total minimum).
- Komparasi komprehensif antara Algoritma Kruskal (*edge-based*) dan Algoritma Prim (*vertex-based*).
- Desain modern, bersih, dan kontras tinggi untuk kenyamanan membaca di layar laptop maupun proyektor kelas.

### 2. Main Application (`app.html`) dengan 3 Tahap Berurutan
- **Tahap 1: Editor Graf Interaktif**
  - **Tambah Node:** Cukup klik area kosong pada kanvas SVG (diberi label alfabet otomatis: A, B, C, ...).
  - **Hubungkan Edge:** Klik node pertama lalu klik node kedua, lalu masukkan bobot sisi melalui dialog modal responsif.
  - **Geser (Drag) Node:** Seret node secara bebas di kanvas; garis sisi yang terhubung akan berpindah secara mulus.
  - **Hapus Elemen:** Tersedia mode hapus untuk menghapus node atau edge yang salah.
  - **Input Alternatif Textarea:** Mendukung sintaks teks `A B 4` (satu edge per baris) dengan tombol sinkronisasi.
  - **Generator & Template:** Tombol *"Contoh Graf"* (graf standar 6 simpul 9 sisi) dan *"Acak Graf"* (dijamin terhubung).
  - **Validasi Keterhubungan Graf:** Mengecek apakah graf memiliki minimal 2 node, semua bobot valid $> 0$, dan memastikan graf terhubung menggunakan algoritma **Breadth-First Search (BFS)** sebelum diizinkan lanjut.

- **Tahap 2: Pemilihan Algoritma**
  - Pilihan kartu interaktif antara **Kruskal** dan **Prim**.
  - Untuk Prim, tersedia *dropdown* dinamis untuk menentukan simpul awal (*start node*).
  - Tombol kembali ke Tahap 1 untuk menyunting graf jika diperlukan.

- **Tahap 3: Visualisasi Langkah Demi Langkah**
  - **Stateless Rendering:** Setiap perubahan langkah dihitung dari state awal sampai langkah `index`, sehingga tombol *Prev*, *Next*, dan *Reset* langsung bereaksi instan tanpa galat status.
  - **Player Otomatis:** Tombol *Play/Pause*, *Reset*, counter langkah, dan *slider* pengatur kecepatan jeda (0.3s – 2.5s).
  - **Panel Penjelasan Bahasa Indonesia:** Menjelaskan secara rinci alasan setiap keputusan (misal: mengapa suatu sisi diperiksa, diterima, atau ditolak karena siklus).
  - **Indikator Status Berjalan:**
    - Total bobot MST yang terakumulasi secara real-time.
    - *Kruskal:* Menampilkan tabel daftar sisi terurut secara *ascending* beserta status masing-masing (Antre, Memeriksa, Diterima, Ditolak).
    - *Prim:* Menampilkan himpunan node yang sudah masuk pohon MST (*visited set chips*).
  - **Ringkasan Akhir & Salin Hasil:** Menampilkan daftar sisi final pembentuk MST, total bobot minimum, tombol *Salin Hasil ke Clipboard*, serta opsi *Coba Algoritma Lain* pada graf yang sama.

### 3. Responsivitas Semua Perangkat & Layar Sentuh (*Touch Support*)
- **Rasio Kanvas Fleksibel:** Kanvas SVG memiliki rasio aspek otomatis `800 / 480` yang menyesuaikan proporsi layar tanpa distorsi atau ruang kosong vertikal.
- **Mendukung Smartphone & Tablet:** Aksi sentuhan jari (*touch events*) telah disesuaikan dengan `touch-action: none` agar tidak bentrok dengan scroll layar.
- **Pintasan Keyboard untuk Presentasi:**
  - <kbd>Space</kbd> : Putar / Jeda (*Play / Pause*)
  - <kbd>&rarr;</kbd> : Langkah Berikutnya (*Next*)
  - <kbd>&larr;</kbd> : Langkah Sebelumnya (*Prev*)
  - <kbd>R</kbd> : Reset ke kondisi awal

---

## 🎨 Kode Warna Visualisasi

| Warna | Status Sisi / Node | Keterangan |
|---|---|---|
| ⚪ **Abu-abu** (`#64748b`) | Belum Diproses | Sisi masih berada dalam antrean pemrosesan |
| 🟡 **Kuning** (`#f59e0b`) | Sedang Diperiksa | Sisi sedang diuji apakah membentuk siklus atau merupakan sisi potong terpendek |
| 🟢 **Hijau** (`#10b981`) | Diterima Masuk MST | Sisi resmi menjadi bagian dari pohon merentang minimum |
| 🔴 **Merah Putus-putus** (`#ef4444`) | Ditolak | Sisi ditolak karena menghubungkan dua node yang sudah terhubung (membentuk siklus) |

---

## 📂 Struktur File dan Folder

```text
mst-visualizer/
├── index.html          # Halaman depan (Landing page materi & pengantar)
├── app.html            # Halaman utama aplikasi visualisasi
├── README.md           # Dokumentasi umum proyek kelompok
├── ARCHITECTURE.md     # Panduan arsitektur teknis dan kontrak modul
├── css/
│   ├── base.css        # Variabel warna tema, tipografi, tombol, toast & badge
│   ├── landing.css     # Tata letak khusus landing page
│   └── app.css         # Tata letak 3 tahap, canvas SVG, player kontrol & responsivitas
└── js/
    ├── graph.js        # Struktur data graf, validasi BFS, generator acak, parser teks
    ├── algorithms.js   # Logika murni Kruskal, Prim, Union-Find (stateless, zero-DOM)
    ├── renderer.js     # Penggambar elemen graf SVG dan pewarnaan status
    ├── graph-editor.js # Logika penambahan node, pembuatan edge, dragging, dan dialog bobot
    ├── controls.js     # Logika autoplay player, navigasi langkah & pengaturan kecepatan
    └── app.js          # Controller utama penghubung antar modul & event listener
```

---

## 🚀 Cara Menjalankan

1. Salin atau unduh seluruh folder proyek `mst-visualizer/`.
2. Klik ganda file [**`index.html`**](index.html) atau [**`app.html`**](app.html) menggunakan peramban web modern apa pun:
   - Google Chrome
   - Microsoft Edge
   - Mozilla Firefox
   - Safari
3. Aplikasi langsung dapat digunakan tanpa perlu instalasi Node.js, Python server, atau koneksi internet.

---

## 🛠️ Panduan Modifikasi bagi Anggota Kelompok

Jika anggota kelompok ingin melakukan penyesuaian atau demonstrasi khusus:

1. **Mengubah / Menambah Contoh Graf:**
   Buka file `js/graph.js`, cari fungsi `getSampleGraph()`, dan sesuaikan daftar `nodes` serta `edges`.
2. **Mengubah Teks Penjelasan Langkah:**
   Buka file `js/algorithms.js`, cari kata kunci `note:` di dalam fungsi `kruskal()` dan `prim()`.
3. **Mengubah Tema Warna:**
   Buka file `css/base.css`, sunting palet warna pada blok `:root` di bagian paling atas.
4. **Mengubah Kecepatan Putar Default:**
   Buka file `js/controls.js`, ubah nilai `speedMs: 1000` (satuan milidetik).

---

## 📚 Landasan Teori Singkat

- **Minimum Spanning Tree (MST):** Subgraf dari graf tak berarah, berbobot, dan terhubung yang mencakup semua simpul dengan total bobot sisi seminimum mungkin tanpa memuat siklus.
- **Teorema Jumlah Sisi:** Untuk sembarang graf pohon dengan $V$ buah simpul, jumlah sisi pada MST tepat sama dengan $V - 1$.
- **Algoritma Kruskal:**
  1. Urutkan seluruh sisi secara menaik (*ascending*) berdasarkan bobot.
  2. Gunakan struktur data *Disjoint-Set* / *Union-Find* dengan optimasi *Path Compression* dan *Union by Rank*.
  3. Iterasi setiap sisi; jika ujung-ujungnya berada pada himpunan berbeda, gabungkan dan masukkan ke MST. Jika sudah satu himpunan, tolak.
  4. Kompleksitas Waktu: $\mathcal{O}(E \log E)$ atau $\mathcal{O}(E \log V)$.
- **Algoritma Prim:**
  1. Mulai dari satu simpul awal $s$ dan masukkan ke dalam himpunan pohon $S = \{s\}$.
  2. Pada setiap iterasi, periksa sisi pemotong (*cut edge*) yang menghubungkan himpunan $S$ ke simpul luar $V \setminus S$.
  3. Pilih sisi pemotong dengan bobot terkecil, lalu tambahkan simpul luar tersebut ke himpunan $S$.
  4. Ulangi sampai seluruh simpul masuk ke dalam himpunan pohon ($|S| = V$).
  5. Kompleksitas Waktu: $\mathcal{O}(V^2)$ atau $\mathcal{O}(E \log V)$ menggunakan *Priority Queue*.

---

*Dibuat dengan dedikasi untuk penyelesaian Tugas Besar Mata Kuliah Struktur Diskrit 2026.*

