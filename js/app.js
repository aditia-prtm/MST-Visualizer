/**
 * ==========================================================================
 * APP.JS
 * Pusat orkestrasi aplikasi visualisasi MST.
 * Mengatur alur 3 tahap (input -> pick -> visualize), sinkronisasi modul,
 * serta tampilan visualizer dan ringkasan.
 * ==========================================================================
 */

window.App = {
  // State aplikasi
  stage: 'input', // 'input' | 'pick' | 'visualize'
  selectedAlgorithm: 'kruskal', // 'kruskal' | 'prim'
  primStartNodeId: null,
  
  // Data eksekusi algoritma
  currentAlgorithmResult: null,

  /**
   * Inisialisasi aplikasi saat DOM siap
   */
  init: function() {
    this.initEditorStage();
    this.initPickStage();
    this.initVisualizeStage();

    // Default ke stage input
    this.goTo('input');
  },

  /**
   * Berpindah antar tahap (stage transition)
   * @param {string} targetStage - 'input' | 'pick' | 'visualize'
   */
  goTo: function(targetStage) {
    this.stage = targetStage;

    // Sembunyikan semua section stage
    const sections = ['stage-input', 'stage-pick', 'stage-visualize'];
    sections.forEach(secId => {
      const el = document.getElementById(secId);
      if (el) el.style.display = 'none';
    });

    // Tampilkan section yang dituju
    const activeSection = document.getElementById(`stage-${targetStage}`);
    if (activeSection) {
      activeSection.style.display = 'block';
    }

    // Update indikator stepper di header
    this.updateStepperUI(targetStage);

    // Tindakan khusus saat memasuki stage tertentu
    if (targetStage === 'input') {
      window.ControlsModule.pause();
      window.GraphEditorModule.render();
    } else if (targetStage === 'pick') {
      window.ControlsModule.pause();
      this.populatePrimStartNodeDropdown();
    } else if (targetStage === 'visualize') {
      this.setupVisualization();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Memperbarui UI stepper progress di atas
   */
  updateStepperUI: function(currentStage) {
    const steps = ['input', 'pick', 'visualize'];
    const currentIndex = steps.indexOf(currentStage);

    steps.forEach((s, idx) => {
      const stepEl = document.getElementById(`step-pill-${s}`);
      if (!stepEl) return;

      stepEl.classList.remove('active', 'completed');
      if (idx === currentIndex) {
        stepEl.classList.add('active');
      } else if (idx < currentIndex) {
        stepEl.classList.add('completed');
      }
    });
  },

  /**
   * Setup Tahap 1: Input Graf
   */
  initEditorStage: function() {
    const svgEl = document.getElementById('editor-svg');
    const textareaEl = document.getElementById('graph-textarea');

    // Inisialisasi modul editor
    window.GraphEditorModule.init(svgEl, textareaEl, (graph) => {
      this.updateNodeCountBadge(graph);
    });

    this.updateNodeCountBadge(window.GraphEditorModule.graph);

    // Tombol toolbar editor
    const btnModeAdd = document.getElementById('btn-mode-add');
    const btnModeDelete = document.getElementById('btn-mode-delete');
    const btnSample = document.getElementById('btn-sample-graph');
    const btnRandom = document.getElementById('btn-random-graph');
    const btnClear = document.getElementById('btn-clear-graph');
    const btnApplyText = document.getElementById('btn-apply-text');
    const btnGoToPick = document.getElementById('btn-goto-pick');

    if (btnModeAdd && btnModeDelete) {
      btnModeAdd.addEventListener('click', () => {
        btnModeAdd.classList.add('active');
        btnModeDelete.classList.remove('active');
        window.GraphEditorModule.setMode('add');
      });

      btnModeDelete.addEventListener('click', () => {
        btnModeDelete.classList.add('active');
        btnModeAdd.classList.remove('active');
        window.GraphEditorModule.setMode('delete');
      });
    }

    if (btnSample) {
      btnSample.addEventListener('click', () => window.GraphEditorModule.loadSampleGraph());
    }

    if (btnRandom) {
      btnRandom.addEventListener('click', () => window.GraphEditorModule.loadRandomGraph());
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus seluruh node dan edge?')) {
          window.GraphEditorModule.clearGraph();
        }
      });
    }

    if (btnApplyText) {
      btnApplyText.addEventListener('click', () => window.GraphEditorModule.applyFromTextarea());
    }

    // Tombol Lanjut ke Tahap 2: Validasi Graf
    if (btnGoToPick) {
      btnGoToPick.addEventListener('click', () => {
        const currentGraph = window.GraphEditorModule.graph;
        const validation = window.GraphModule.validateGraph(currentGraph);

        if (!validation.valid) {
          window.GraphEditorModule.showToast(validation.message, 'error');
          // Highlight panel peringatan
          this.showValidationError(validation.message);
          return;
        }

        this.goTo('pick');
      });
    }
  },

  /**
   * Menampilkan badge jumlah node & edge
   */
  updateNodeCountBadge: function(graph) {
    const badge = document.getElementById('graph-stats-badge');
    if (badge && graph) {
      badge.textContent = `${graph.nodes.length} Node, ${graph.edges.length} Edge`;
    }
  },

  /**
   * Menampilkan pesan kesalahan validasi
   */
  showValidationError: function(msg) {
    const alertBox = document.getElementById('editor-validation-alert');
    if (alertBox) {
      alertBox.textContent = msg;
      alertBox.style.display = 'block';
      setTimeout(() => {
        alertBox.style.display = 'none';
      }, 5000);
    }
  },

  /**
   * Setup Tahap 2: Pilih Algoritma
   */
  initPickStage: function() {
    const cardKruskal = document.getElementById('card-algo-kruskal');
    const cardPrim = document.getElementById('card-algo-prim');
    const primOptionsContainer = document.getElementById('prim-options-container');
    const btnBackToInput = document.getElementById('btn-back-to-input');
    const btnStartVisualize = document.getElementById('btn-start-visualize');
    const primStartSelect = document.getElementById('prim-start-node-select');

    const selectAlgo = (algo) => {
      this.selectedAlgorithm = algo;
      if (algo === 'kruskal') {
        cardKruskal.classList.add('selected');
        cardPrim.classList.remove('selected');
        if (primOptionsContainer) primOptionsContainer.style.display = 'none';
      } else {
        cardPrim.classList.add('selected');
        cardKruskal.classList.remove('selected');
        if (primOptionsContainer) primOptionsContainer.style.display = 'block';
      }
    };

    if (cardKruskal) {
      cardKruskal.addEventListener('click', () => selectAlgo('kruskal'));
    }

    if (cardPrim) {
      cardPrim.addEventListener('click', () => selectAlgo('prim'));
    }

    if (btnBackToInput) {
      btnBackToInput.addEventListener('click', () => this.goTo('input'));
    }

    if (primStartSelect) {
      primStartSelect.addEventListener('change', (e) => {
        this.primStartNodeId = e.target.value;
      });
    }

    if (btnStartVisualize) {
      btnStartVisualize.addEventListener('click', () => {
        const graph = window.GraphEditorModule.graph;

        if (this.selectedAlgorithm === 'kruskal') {
          this.currentAlgorithmResult = window.AlgorithmsModule.kruskal(graph);
        } else {
          const startId = this.primStartNodeId || (graph.nodes[0] ? graph.nodes[0].id : null);
          this.currentAlgorithmResult = window.AlgorithmsModule.prim(graph, startId);
        }

        this.goTo('visualize');
      });
    }
  },

  /**
   * Mengisi dropdown node awal untuk Prim
   */
  populatePrimStartNodeDropdown: function() {
    const select = document.getElementById('prim-start-node-select');
    if (!select) return;

    const graph = window.GraphEditorModule.graph;
    select.innerHTML = '';

    graph.nodes.forEach((node, idx) => {
      const opt = document.createElement('option');
      opt.value = node.id;
      opt.textContent = `Node ${node.label}`;
      if (idx === 0) {
        opt.selected = true;
        this.primStartNodeId = node.id;
      }
      select.appendChild(opt);
    });
  },

  /**
   * Setup Tahap 3: Visualisasi
   */
  initVisualizeStage: function() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnPlay = document.getElementById('btn-play');
    const btnReset = document.getElementById('btn-reset');
    const speedSlider = document.getElementById('speed-slider');
    const speedLabel = document.getElementById('speed-label');

    if (btnPrev) btnPrev.addEventListener('click', () => window.ControlsModule.prev());
    if (btnNext) btnNext.addEventListener('click', () => window.ControlsModule.next());
    if (btnPlay) btnPlay.addEventListener('click', () => window.ControlsModule.togglePlay());
    if (btnReset) btnReset.addEventListener('click', () => window.ControlsModule.reset());

    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        const speedVal = Number(e.target.value);
        window.ControlsModule.setSpeed(speedVal);
        if (speedLabel) speedLabel.textContent = `${(speedVal / 1000).toFixed(1)}s`;
      });
    }

    // Tombol di ringkasan / header visualizer
    const btnReplayNew = document.getElementById('btn-replay-new');
    const btnReplayOther = document.getElementById('btn-replay-other');
    const btnCopySummary = document.getElementById('btn-copy-summary');

    if (btnCopySummary) {
      btnCopySummary.addEventListener('click', () => {
        const result = this.currentAlgorithmResult;
        const graph = window.GraphEditorModule.graph;
        if (!result || !result.mstEdges) return;

        const algoName = this.selectedAlgorithm === 'kruskal' ? 'Kruskal' : 'Prim';
        const edgesStr = result.mstEdges.map(e => {
          const uLabel = window.GraphModule.getNodeLabel(graph, e.u);
          const vLabel = window.GraphModule.getNodeLabel(graph, e.v);
          return `(${uLabel} - ${vLabel}, bobot: ${e.w})`;
        }).join(', ');

        const textToCopy = `Hasil MST (${algoName}):\nTotal Bobot: ${result.totalWeight}\nSisi MST (${result.mstEdges.length} sisi): ${edgesStr}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
          window.GraphEditorModule.showToast('Hasil MST berhasil disalin ke clipboard!', 'success');
        }).catch(() => {
          window.GraphEditorModule.showToast('Gagal menyalin ke clipboard.', 'warning');
        });
      });
    }

    if (btnReplayNew) {
      btnReplayNew.addEventListener('click', () => this.goTo('input'));
    }

    if (btnReplayOther) {
      btnReplayOther.addEventListener('click', () => this.goTo('pick'));
    }

    // Keyboard shortcuts untuk mempermudah saat presentasi di proyektor/laptop
    window.addEventListener('keydown', (e) => {
      if (this.stage !== 'visualize') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        window.ControlsModule.togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        window.ControlsModule.next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        window.ControlsModule.prev();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        window.ControlsModule.reset();
      }
    });
  },

  /**
   * Mempersiapkan kanvas dan kontrol visualisasi saat memasuki stage 'visualize'
   */
  setupVisualization: function() {
    const visualizerSvg = document.getElementById('visualizer-svg');
    const graph = window.GraphEditorModule.graph;
    const result = this.currentAlgorithmResult;

    if (!result || !result.steps) return;

    // Atur badge nama algoritma
    const algoTitleEl = document.getElementById('viz-algo-title');
    if (algoTitleEl) {
      algoTitleEl.textContent = this.selectedAlgorithm === 'kruskal' 
        ? 'Algoritma Kruskal' 
        : `Algoritma Prim (Node Awal: ${window.AlgorithmsModule.getLabel(graph, this.primStartNodeId)})`;
    }

    // Konfigurasi panel algoritma spesifik (Kruskal Table vs Prim Visited Chips)
    const kruskalPanel = document.getElementById('kruskal-edge-list-panel');
    const primPanel = document.getElementById('prim-visited-panel');

    if (this.selectedAlgorithm === 'kruskal') {
      if (kruskalPanel) kruskalPanel.style.display = 'block';
      if (primPanel) primPanel.style.display = 'none';
      this.buildKruskalTable(graph, result.sortedEdges);
    } else {
      if (kruskalPanel) kruskalPanel.style.display = 'none';
      if (primPanel) primPanel.style.display = 'block';
    }

    // Inisialisasi kontrol dengan callback langkah
    window.ControlsModule.init(result.steps, (stepIndex) => {
      // 1. Gambar ulang graf secara stateless
      window.RendererModule.render(visualizerSvg, graph, result.steps, stepIndex, {
        isEditable: false
      });

      // 2. Perbarui panel keterangan teks & bobot
      this.updateStepInfoUI(graph, result.steps, stepIndex);

      // 3. Perbarui panel spesifik algoritma
      if (this.selectedAlgorithm === 'kruskal') {
        this.updateKruskalTableUI(result.steps, stepIndex);
      } else {
        this.updatePrimVisitedUI(graph, result.steps, stepIndex);
      }

      // 4. Periksa ringkasan akhir jika sudah di langkah terakhir
      this.checkCompletionSummary(graph, result, stepIndex);
    });
  },

  /**
   * Memperbarui teks keterangan langkah dan total bobot
   */
  updateStepInfoUI: function(graph, steps, stepIndex) {
    const noteEl = document.getElementById('step-note-text');
    const totalWeightEl = document.getElementById('step-total-weight');
    const statusBadgeEl = document.getElementById('step-status-badge');

    if (stepIndex === -1) {
      if (noteEl) noteEl.textContent = 'Klik tombol Play atau Next untuk memulai langkah visualisasi.';
      if (totalWeightEl) totalWeightEl.textContent = '0';
      if (statusBadgeEl) {
        statusBadgeEl.textContent = 'Belum Mulai';
        statusBadgeEl.className = 'badge badge-idle';
      }
      return;
    }

    const step = steps[stepIndex];
    if (!step) return;

    if (noteEl) {
      noteEl.textContent = step.note;
    }

    if (totalWeightEl) {
      totalWeightEl.textContent = step.totalWeight;
    }

    if (statusBadgeEl) {
      if (step.status === 'check') {
        statusBadgeEl.textContent = 'Memeriksa';
        statusBadgeEl.className = 'badge badge-check';
      } else if (step.status === 'accept') {
        statusBadgeEl.textContent = 'Diterima';
        statusBadgeEl.className = 'badge badge-accept';
      } else if (step.status === 'reject') {
        statusBadgeEl.textContent = 'Ditolak';
        statusBadgeEl.className = 'badge badge-reject';
      }
    }
  },

  /**
   * Membuat tabel edge terurut untuk Kruskal
   */
  buildKruskalTable: function(graph, sortedEdges) {
    const tableBody = document.getElementById('kruskal-table-body');
    if (!tableBody || !sortedEdges) return;

    tableBody.innerHTML = '';
    sortedEdges.forEach((edge, idx) => {
      const uLabel = window.GraphModule.getNodeLabel(graph, edge.u);
      const vLabel = window.GraphModule.getNodeLabel(graph, edge.v);

      const tr = document.createElement('tr');
      tr.id = `kruskal-row-${edge.id}`;
      tr.innerHTML = `
        <td class="font-mono">${idx + 1}</td>
        <td><strong>${uLabel} - ${vLabel}</strong></td>
        <td class="font-mono text-center font-bold">${edge.w}</td>
        <td class="status-cell text-center"><span class="badge badge-idle">Antre</span></td>
      `;
      tableBody.appendChild(tr);
    });
  },

  /**
   * Memperbarui status baris tabel Kruskal
   */
  updateKruskalTableUI: function(steps, stepIndex) {
    const graph = window.GraphEditorModule.graph;
    const { edgeStates, currentStep } = window.RendererModule.computeGraphState(graph, steps, stepIndex);

    // Reset dan update setiap baris
    edgeStates.forEach((status, edgeId) => {
      const row = document.getElementById(`kruskal-row-${edgeId}`);
      if (!row) return;

      const cell = row.querySelector('.status-cell');
      row.classList.remove('row-active', 'row-accept', 'row-reject');

      if (currentStep && currentStep.edge === edgeId) {
        row.classList.add('row-active');
      }

      if (status === 'accept') {
        row.classList.add('row-accept');
        if (cell) cell.innerHTML = '<span class="badge badge-accept">Diterima</span>';
      } else if (status === 'reject') {
        row.classList.add('row-reject');
        if (cell) cell.innerHTML = '<span class="badge badge-reject">Ditolak</span>';
      } else if (status === 'check') {
        if (cell) cell.innerHTML = '<span class="badge badge-check">Memeriksa</span>';
      } else {
        if (cell) cell.innerHTML = '<span class="badge badge-idle">Antre</span>';
      }
    });
  },

  /**
   * Memperbarui tampilan himpunan node visited untuk Prim
   */
  updatePrimVisitedUI: function(graph, steps, stepIndex) {
    const container = document.getElementById('prim-visited-chips');
    if (!container) return;

    container.innerHTML = '';

    if (stepIndex === -1) {
      container.innerHTML = '<span class="text-dim italic">Belum ada node dalam MST</span>';
      return;
    }

    const currentStep = steps[stepIndex];
    const visited = (currentStep && currentStep.visited) ? currentStep.visited : [];

    if (visited.length === 0) {
      container.innerHTML = '<span class="text-dim italic">Himpunan kosong</span>';
      return;
    }

    visited.forEach(nodeId => {
      const label = window.GraphModule.getNodeLabel(graph, nodeId);
      const chip = document.createElement('span');
      chip.className = 'visited-chip';
      chip.textContent = label;
      container.appendChild(chip);
    });
  },

  /**
   * Menampilkan panel ringkasan akhir ketika visualisasi mencapai langkah terakhir
   */
  checkCompletionSummary: function(graph, result, stepIndex) {
    const summaryCard = document.getElementById('completion-summary-card');
    if (!summaryCard) return;

    if (stepIndex >= result.steps.length - 1 && result.steps.length > 0) {
      summaryCard.style.display = 'block';

      const mstListEl = document.getElementById('summary-mst-edges');
      const totalEl = document.getElementById('summary-total-weight');

      if (totalEl) totalEl.textContent = result.totalWeight;

      if (mstListEl && result.mstEdges) {
        mstListEl.innerHTML = result.mstEdges.map(e => {
          const uLabel = window.GraphModule.getNodeLabel(graph, e.u);
          const vLabel = window.GraphModule.getNodeLabel(graph, e.v);
          return `<span class="summary-edge-item">(${uLabel} - ${vLabel} : ${e.w})</span>`;
        }).join('');
      }
    } else {
      summaryCard.style.display = 'none';
    }
  }
};

// Pasang inisialisasi aplikasi saat window siap
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});

