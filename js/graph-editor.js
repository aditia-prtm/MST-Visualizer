/**
 * ==========================================================================
 * GRAPH-EDITOR.JS
 * Logika interaksi pengeditan graf pada Tahap 1 (Input Graf).
 * Mendukung penambahan node, pembuatan edge, dragging, penghapusan,
 * serta sinkronisasi dengan textarea.
 * ==========================================================================
 */

window.GraphEditorModule = {
  graph: { nodes: [], edges: [] },
  svgElement: null,
  textareaElement: null,
  
  // State interaksi
  selectedNodeForEdge: null,
  draggedNode: null,
  isDragging: false,
  hasDragged: false,
  dragStartPos: { x: 0, y: 0 },
  currentMode: 'add', // 'add' (tambah/hubungkan) atau 'delete' (hapus)

  // Callback notifikasi jika terjadi perubahan
  onChangeCallback: null,

  /**
   * Inisialisasi editor graf
   */
  init: function(svgElement, textareaElement, onChange) {
    this.svgElement = svgElement;
    this.textareaElement = textareaElement;
    this.onChangeCallback = onChange || function() {};

    // Load graf default (contoh graf)
    this.loadSampleGraph();

    // Pasang event listener kanvas SVG
    this.bindSvgEvents();
  },

  /**
   * Memasang event listener ke kanvas SVG
   */
  bindSvgEvents: function() {
    if (!this.svgElement) return;

    // Klik kanvas untuk menambah node (hanya jika mode 'add' dan bukan klik pada node/edge)
    this.svgElement.addEventListener('click', (e) => {
      if (this.isDragging) return;
      if (this.currentMode !== 'add') return;

      // Pastikan yang diklik adalah background SVG, bukan elemen g/circle/line
      if (e.target === this.svgElement) {
        const pt = this.getSvgCoordinates(e);
        this.addNodeAt(pt.x, pt.y);
      }
    });

    // Event mousemove & touchmove untuk drag node
    const handleMove = (e) => {
      if (!this.isDragging || !this.draggedNode) return;
      
      const pt = this.getSvgCoordinates(e);
      const dx = Math.abs(pt.x - this.dragStartPos.x);
      const dy = Math.abs(pt.y - this.dragStartPos.y);

      // Jika berpindah lebih dari 4px, tandai sebagai aksi drag
      if (dx > 4 || dy > 4) {
        this.hasDragged = true;
      }

      const padding = 25;
      const viewBoxWidth = 800;
      const viewBoxHeight = 480;

      // Batasi koordinat agar node tetap di dalam area kanvas
      this.draggedNode.x = Math.max(padding, Math.min(viewBoxWidth - padding, Math.round(pt.x)));
      this.draggedNode.y = Math.max(padding, Math.min(viewBoxHeight - padding, Math.round(pt.y)));

      this.render();
    };

    // Event mouseup & touchend untuk mengakhiri drag
    const handleEnd = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.draggedNode = null;
        this.notifyChange();
        // Beri sedikit jeda agar event click setelah mouseup/touchend tidak terpancing
        setTimeout(() => {
          this.hasDragged = false;
        }, 80);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });

    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
  },

  /**
   * Mengubah event mouse/touch ke koordinat viewBox SVG (800x480)
   */
  getSvgCoordinates: function(e) {
    const pt = this.svgElement.createSVGPoint();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }

    pt.x = clientX || 0;
    pt.y = clientY || 0;
    const svgP = pt.matrixTransform(this.svgElement.getScreenCTM().inverse());
    return { x: svgP.x, y: svgP.y };
  },

  /**
   * Mengatur mode editor: 'add' atau 'delete'
   */
  setMode: function(mode) {
    this.currentMode = mode;
    this.selectedNodeForEdge = null;
    this.render();
  },

  /**
   * Menambah node baru pada posisi koordinat (x, y)
   */
  addNodeAt: function(x, y) {
    const nextIndex = this.graph.nodes.length;
    const label = window.GraphModule.getLabelFromIndex(nextIndex);
    const newNode = window.GraphModule.createNode(label, x, y);

    this.graph.nodes.push(newNode);
    this.selectedNodeForEdge = null;
    this.render();
    this.notifyChange();
  },

  /**
   * Menangani klik pada sebuah node
   */
  handleNodeClick: function(node) {
    if (this.isDragging || this.hasDragged) {
      this.hasDragged = false;
      return;
    }

    if (this.currentMode === 'delete') {
      this.deleteNode(node.id);
      return;
    }

    // Mode 'add': pembuatan edge antar dua node
    if (!this.selectedNodeForEdge) {
      // Pilih node pertama
      this.selectedNodeForEdge = node;
      this.render();
    } else if (this.selectedNodeForEdge.id === node.id) {
      // Klik node yang sama -> Batalkan seleksi
      this.selectedNodeForEdge = null;
      this.render();
    } else {
      // Klik node kedua -> Buat edge antara selectedNodeForEdge dan node
      const u = this.selectedNodeForEdge;
      const v = node;
      this.selectedNodeForEdge = null;
      this.render();

      this.promptForEdgeWeight(u, v);
    }
  },

  /**
   * Meminta input bobot untuk edge baru
   */
  promptForEdgeWeight: function(nodeU, nodeV) {
    // Cek apakah edge sudah ada
    const existing = this.graph.edges.find(
      e => (e.u === nodeU.id && e.v === nodeV.id) || (e.u === nodeV.id && e.v === nodeU.id)
    );

    if (existing) {
      this.showToast(`Edge antara ${nodeU.label} dan ${nodeV.label} sudah ada dengan bobot ${existing.w}. Silakan hapus terlebih dahulu jika ingin mengganti.`, 'warning');
      return;
    }

    // Munculkan dialog input modal atau prompt
    this.openWeightModal(nodeU, nodeV, (weight) => {
      if (weight !== null && !isNaN(weight) && weight > 0) {
        const newEdge = window.GraphModule.createEdge(nodeU.id, nodeV.id, weight);
        this.graph.edges.push(newEdge);
        this.render();
        this.notifyChange();
        this.showToast(`Edge (${nodeU.label} - ${nodeV.label}, bobot: ${weight}) berhasil ditambahkan.`, 'success');
      } else if (weight !== null) {
        this.showToast('Bobot harus berupa angka positif!', 'error');
      }
    });
  },

  /**
   * Dialog modal kustom untuk input bobot edge
   */
  openWeightModal: function(nodeU, nodeV, callback) {
    const modal = document.getElementById('weight-modal');
    const input = document.getElementById('edge-weight-input');
    const title = document.getElementById('weight-modal-title');
    const btnConfirm = document.getElementById('btn-confirm-weight');
    const btnCancel = document.getElementById('btn-cancel-weight');

    if (!modal || !input) {
      // Fallback ke browser prompt jika modal elemen tidak ditemukan
      const val = prompt(`Masukkan bobot untuk edge (${nodeU.label} - ${nodeV.label}):`, '4');
      if (val === null) return callback(null);
      const parsed = parseFloat(val);
      return callback(parsed);
    }

    title.textContent = `Hubungkan Node ${nodeU.label} ↔ ${nodeV.label}`;
    input.value = '4';
    modal.classList.add('active');
    input.focus();
    input.select();

    const cleanup = () => {
      modal.classList.remove('active');
      btnConfirm.onclick = null;
      btnCancel.onclick = null;
      input.onkeydown = null;
    };

    btnConfirm.onclick = () => {
      const val = parseFloat(input.value);
      cleanup();
      callback(val);
    };

    btnCancel.onclick = () => {
      cleanup();
      callback(null);
    };

    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const val = parseFloat(input.value);
        cleanup();
        callback(val);
      } else if (e.key === 'Escape') {
        cleanup();
        callback(null);
      }
    };
  },

  /**
   * Menangani klik pada sebuah edge
   */
  handleEdgeClick: function(edge) {
    if (this.currentMode === 'delete') {
      this.deleteEdge(edge.id);
    } else {
      // Jika diklik di mode biasa, konfirmasi apakah ingin menghapus edge
      const uLabel = window.GraphModule.getNodeLabel(this.graph, edge.u);
      const vLabel = window.GraphModule.getNodeLabel(this.graph, edge.v);
      if (confirm(`Hapus edge (${uLabel} - ${vLabel}, bobot: ${edge.w})?`)) {
        this.deleteEdge(edge.id);
      }
    }
  },

  /**
   * Menghapus sebuah node dan seluruh edge yang terhubung dengannya
   */
  deleteNode: function(nodeId) {
    this.graph.nodes = this.graph.nodes.filter(n => n.id !== nodeId);
    this.graph.edges = this.graph.edges.filter(e => e.u !== nodeId && e.v !== nodeId);

    // Re-index label jika diinginkan agar berurutan
    this.graph.nodes.forEach((n, idx) => {
      n.label = window.GraphModule.getLabelFromIndex(idx);
    });

    if (this.selectedNodeForEdge && this.selectedNodeForEdge.id === nodeId) {
      this.selectedNodeForEdge = null;
    }

    this.render();
    this.notifyChange();
  },

  /**
   * Menghapus edge berdasarkan ID
   */
  deleteEdge: function(edgeId) {
    this.graph.edges = this.graph.edges.filter(e => e.id !== edgeId);
    this.render();
    this.notifyChange();
  },

  /**
   * Memulai proses drag pada node
   */
  handleNodeDragStart: function(node, e) {
    if (this.currentMode === 'delete') return;
    this.isDragging = true;
    this.draggedNode = node;
  },

  /**
   * Memuat contoh graf standar
   */
  loadSampleGraph: function() {
    this.graph = window.GraphModule.getSampleGraph();
    this.selectedNodeForEdge = null;
    this.render();
    this.notifyChange();
    this.showToast('Contoh graf berhasil dimuat.', 'success');
  },

  /**
   * Menghasilkan graf acak yang terhubung
   */
  loadRandomGraph: function() {
    this.graph = window.GraphModule.getRandomGraph(6, 800, 480);
    this.selectedNodeForEdge = null;
    this.render();
    this.notifyChange();
    this.showToast('Graf acak berhasil dibuat.', 'success');
  },

  /**
   * Mengosongkan kanvas graf
   */
  clearGraph: function() {
    this.graph = { nodes: [], edges: [] };
    this.selectedNodeForEdge = null;
    this.render();
    this.notifyChange();
    this.showToast('Kanvas telah dikosongkan.', 'warning');
  },

  /**
   * Menerapkan struktur graf dari textarea
   */
  applyFromTextarea: function() {
    if (!this.textareaElement) return;
    const text = this.textareaElement.value;
    const result = window.GraphModule.parseGraphFromText(text, 800, 480);

    if (result.error) {
      this.showToast(result.error, 'error');
      return;
    }

    this.graph = result.graph;
    this.selectedNodeForEdge = null;
    this.render();
    this.notifyChange(false); // jangan timpa balik textarea saat menerapkan dari textarea

    if (result.warnings && result.warnings.length > 0) {
      this.showToast(`Graf dimuat dengan ${result.warnings.length} penyesuaian.`, 'warning');
    } else {
      this.showToast('Graf berhasil diperbarui dari teks input.', 'success');
    }
  },

  /**
   * Memberitahu perubahan dan sinkronisasi textarea
   */
  notifyChange: function(updateText = true) {
    if (updateText && this.textareaElement) {
      this.textareaElement.value = window.GraphModule.graphToText(this.graph);
    }
    if (this.onChangeCallback) {
      this.onChangeCallback(this.graph);
    }
  },

  /**
   * Merender graf ke kanvas SVG menggunakan RendererModule
   */
  render: function() {
    if (!this.svgElement) return;

    window.RendererModule.render(
      this.svgElement,
      this.graph,
      [],
      -1,
      {
        selectedNodeId: this.selectedNodeForEdge ? this.selectedNodeForEdge.id : null,
        isEditable: true,
        onNodeClick: (node) => this.handleNodeClick(node),
        onEdgeClick: (edge) => this.handleEdgeClick(edge),
        onNodeDragStart: (node, e) => this.handleNodeDragStart(node, e)
      }
    );
  },

  /**
   * Menampilkan pesan notifikasi toast
   */
  showToast: function(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

