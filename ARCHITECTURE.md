# Dokumentasi Arsitektur Proyek MST Visualizer
Aplikasi Visualisasi Minimum Spanning Tree (MST) untuk Proyek Kelompok Mata Kuliah Struktur Diskrit.

---

## 1. Struktur Direktori & File
```text
mst-visualizer/
├── index.html          # Landing page (definisi MST, komparasi Kruskal vs Prim, CTA)
├── app.html            # Main page interaktif (3 tahap: Input -> Pilih Algoritma -> Visualisasi)
├── ARCHITECTURE.md     # Dokumentasi arsitektur dan panduan pengembangan
├── css/
│   ├── base.css        # Variabel warna tema, tipografi, tombol, toast, badge, layout dasar
│   ├── landing.css     # Styling khusus landing page (hero banner, cards konsep, komparasi)
│   └── app.css         # Styling main page (stepper, kanvas SVG, toolbar, player, tabel, chip)
└── js/
    ├── graph.js        # Struktur data graf, validasi keterhubungan (BFS), generator acak, parser teks
    ├── algorithms.js   # Logika murni Kruskal, Prim, Union-Find (TANPA manipulasi DOM)
    ├── renderer.js     # Penggambaran graf SVG secara stateless (menghitung state langkah 0..index)
    ├── graph-editor.js # Logika interaksi pengeditan graf tahap 1 (klik canvas, drag, modal bobot)
    ├── controls.js     # Pengendali pemutaran visualisasi (Play, Pause, Prev, Next, Reset, Slider)
    └── app.js          # Orkestrasi alur 3 tahap (goTo stage, sinkronisasi antar modul)
```

---

## 2. Kontrak Data

### Struktur Graf
```javascript
{
  nodes: [
    { id: "n1", label: "A", x: 140, y: 150 },
    { id: "n2", label: "B", x: 380, y: 100 }
  ],
  edges: [
    { id: "e1", u: "n1", v: "n2", w: 4 }
  ]
}
```

### Format Langkah Visualisasi (`steps`)
Fungsi `kruskal(graph)` dan `prim(graph, startNodeId)` mengembalikan array `steps`:
```javascript
{
  edge: "e1",                   // ID edge yang sedang diproses (atau null pada inisialisasi)
  status: "check" | "accept" | "reject",
  note: "Edge (A - B) diterima masuk MST...",
  totalWeight: 4,               // Akumulasi bobot MST berjalan
  visited: ["n1", "n2"]         // (Khusus Prim) himpunan node yang sudah masuk MST
}
```

### Stateless Rendering
Fungsi `RendererModule.render(svgElement, graph, steps, index, options)` menghitung ulang status seluruh edge dan node dari langkah awal `0` sampai `index`. Jika `index = -1`, graf berada di kondisi awal sebelum pemrosesan.

---

## 3. Warna Status Graf
- **Abu-abu (`#64748b`)**: Belum diproses / antre.
- **Kuning (`#f59e0b`)**: Sedang diperiksa (`check`).
- **Hijau (`#10b981`)**: Diterima masuk MST (`accept`).
- **Merah Putus-putus (`#ef4444`)**: Ditolak karena membentuk siklus (`reject`).

---

## 4. Panduan Modifikasi untuk Anggota Kelompok

| Bagian yang Ingin Diubah | Lokasi File | Fungsi / Baris Terkait |
|---|---|---|
| **Menambah contoh graf baru** | `js/graph.js` | Fungsi `getSampleGraph()` |
| **Mengubah rentang acak graf** | `js/graph.js` | Fungsi `getRandomGraph(numNodes, width, height)` |
| **Menyesuaikan penjelasan langkah** | `js/algorithms.js` | Properti `note:` di dalam `kruskal()` dan `prim()` |
| **Mengubah warna node / edge** | `js/renderer.js` & `css/base.css` | Objek `config.colors` di `renderer.js` & `:root` di `base.css` |
| **Mengatur kecepatan autoplay default** | `js/controls.js` | Properti `speedMs: 1000` |
| **Menambah teks materi teori** | `index.html` | Bagian `<section id="penjelasan">` |
