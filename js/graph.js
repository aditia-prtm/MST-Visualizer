/**
 * ==========================================================================
 * GRAPH.JS
 * Struktur data graf, validasi keterhubungan, template contoh,
 * generator graf acak, dan konverter teks.
 * ==========================================================================
 */

// Objek namespace global GraphModule
window.GraphModule = {
  // Generator ID unik
  _nodeCounter: 0,
  _edgeCounter: 0,

  /**
   * Membuat ID node unik baru
   */
  generateNodeId: function() {
    this._nodeCounter += 1;
    return 'n' + this._nodeCounter;
  },

  /**
   * Membuat ID edge unik baru
   */
  generateEdgeId: function() {
    this._edgeCounter += 1;
    return 'e' + this._edgeCounter;
  },

  /**
   * Menghasilkan label alfabet berikutnya (A, B, C, ..., Z, AA, AB, dst.)
   * @param {number} index - Indeks node (0-based)
   */
  getLabelFromIndex: function(index) {
    let label = '';
    let num = index;
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    }
    return label;
  },

  /**
   * Membuat objek node
   */
  createNode: function(label, x, y, id) {
    return {
      id: id || this.generateNodeId(),
      label: label || 'A',
      x: Math.round(x),
      y: Math.round(y)
    };
  },

  /**
   * Membuat objek edge
   */
  createEdge: function(u, v, w, id) {
    return {
      id: id || this.generateEdgeId(),
      u: u,
      v: v,
      w: Number(w)
    };
  },

  /**
   * Validasi struktur dan keterhubungan graf
   * @param {Object} graph - { nodes: [], edges: [] }
   * @returns {Object} { valid: boolean, message: string }
   */
  validateGraph: function(graph) {
    if (!graph || !graph.nodes || graph.nodes.length < 2) {
      return {
        valid: false,
        message: 'Graf harus memiliki minimal 2 node untuk membentuk MST.'
      };
    }

    if (!graph.edges || graph.edges.length < graph.nodes.length - 1) {
      return {
        valid: false,
        message: `Graf dengan ${graph.nodes.length} node memerlukan minimal ${graph.nodes.length - 1} edge agar dapat terhubung.`
      };
    }

    // Validasi semua bobot edge
    for (let i = 0; i < graph.edges.length; i++) {
      const e = graph.edges[i];
      if (e.w === null || e.w === undefined || isNaN(e.w) || e.w <= 0) {
        return {
          valid: false,
          message: `Bobot edge antara node ${this.getNodeLabel(graph, e.u)} dan ${this.getNodeLabel(graph, e.v)} harus berupa angka positif (> 0).`
        };
      }
      if (e.u === e.v) {
        return {
          valid: false,
          message: 'Graf tidak boleh memiliki self-loop (edge dari suatu node ke dirinya sendiri).'
        };
      }
    }

    // Cek keterhubungan graf menggunakan BFS
    const isConnected = this.checkConnected(graph);
    if (!isConnected) {
      return {
        valid: false,
        message: 'Graf tidak terhubung! MST hanya dapat dibentuk pada graf yang terhubung (connected). Silakan tambahkan edge penghubung.'
      };
    }

    return { valid: true, message: 'Graf valid dan terhubung.' };
  },

  /**
   * Mengecek apakah graf terhubung (connected) menggunakan BFS
   * @param {Object} graph 
   * @returns {boolean}
   */
  checkConnected: function(graph) {
    if (!graph.nodes || graph.nodes.length === 0) return false;
    if (graph.nodes.length === 1) return true;

    const nodeIds = new Set(graph.nodes.map(n => n.id));
    const adj = {};
    nodeIds.forEach(id => {
      adj[id] = [];
    });

    graph.edges.forEach(e => {
      if (adj[e.u] && adj[e.v]) {
        adj[e.u].push(e.v);
        adj[e.v].push(e.u);
      }
    });

    // Mulai BFS dari node pertama
    const startNode = graph.nodes[0].id;
    const visited = new Set();
    const queue = [startNode];
    visited.add(startNode);

    while (queue.length > 0) {
      const curr = queue.shift();
      const neighbors = adj[curr] || [];
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return visited.size === graph.nodes.length;
  },

  /**
   * Mengambil label node berdasarkan ID
   */
  getNodeLabel: function(graph, nodeId) {
    const node = graph.nodes.find(n => n.id === nodeId);
    return node ? node.label : nodeId;
  },

  /**
   * Mendapatkan contoh graf standar (Buku Teks Diskrit)
   * Graf 6 node dengan bobot variatif dan beberapa siklus
   * Ukuran disesuaikan untuk kanvas 800x500
   */
  getSampleGraph: function() {
    this._nodeCounter = 0;
    this._edgeCounter = 0;

    const nodes = [
      { id: 'n1', label: 'A', x: 140, y: 150 },
      { id: 'n2', label: 'B', x: 380, y: 100 },
      { id: 'n3', label: 'C', x: 640, y: 150 },
      { id: 'n4', label: 'D', x: 180, y: 380 },
      { id: 'n5', label: 'E', x: 420, y: 400 },
      { id: 'n6', label: 'F', x: 660, y: 370 }
    ];

    const edges = [
      { id: 'e1', u: 'n1', v: 'n2', w: 4 },
      { id: 'e2', u: 'n1', v: 'n4', w: 2 },
      { id: 'e3', u: 'n2', v: 'n3', w: 6 },
      { id: 'e4', u: 'n2', v: 'n4', w: 3 },
      { id: 'e5', u: 'n2', v: 'n5', w: 5 },
      { id: 'e6', u: 'n3', v: 'n6', w: 2 },
      { id: 'e7', u: 'n4', v: 'n5', w: 7 },
      { id: 'e8', u: 'n5', v: 'n6', w: 4 },
      { id: 'e9', u: 'n3', v: 'n5', w: 1 }
    ];

    this._nodeCounter = 6;
    this._edgeCounter = 9;

    return { nodes, edges };
  },

  /**
   * Membuat graf acak yang dijamin TERHUBUNG
   * @param {number} numNodes - Jumlah node (5 - 8)
   * @param {number} width - Lebar area kanvas
   * @param {number} height - Tinggi area kanvas
   */
  getRandomGraph: function(numNodes = 6, width = 800, height = 480) {
    this._nodeCounter = 0;
    this._edgeCounter = 0;

    const count = Math.max(3, Math.min(9, numNodes));
    const nodes = [];
    const padding = 70;
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusX = (width - padding * 2) / 2.2;
    const radiusY = (height - padding * 2) / 2.2;

    // Sebar node dalam bentuk elips dengan sedikit jitter acak
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const jitterX = (Math.random() - 0.5) * 40;
      const jitterY = (Math.random() - 0.5) * 40;
      const x = Math.round(centerX + radiusX * Math.cos(angle) + jitterX);
      const y = Math.round(centerY + radiusY * Math.sin(angle) + jitterY);
      nodes.push({
        id: this.generateNodeId(),
        label: this.getLabelFromIndex(i),
        x: Math.max(padding, Math.min(width - padding, x)),
        y: Math.max(padding, Math.min(height - padding, y))
      });
    }

    const edges = [];
    const existingPairs = new Set();

    function pairKey(u, v) {
      return u < v ? `${u}_${v}` : `${v}_${u}`;
    }

    // 1. Buat Spanning Tree acak agar graf pasti terhubung
    const connectedNodes = [nodes[0].id];
    const remainingNodes = nodes.slice(1).map(n => n.id);

    // Acak sisa node
    for (let i = remainingNodes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingNodes[i], remainingNodes[j]] = [remainingNodes[j], remainingNodes[i]];
    }

    while (remainingNodes.length > 0) {
      const target = remainingNodes.pop();
      // Pilih salah satu node yang sudah terhubung
      const source = connectedNodes[Math.floor(Math.random() * connectedNodes.length)];
      const weight = Math.floor(Math.random() * 9) + 1; // Bobot 1-9
      const key = pairKey(source, target);

      edges.push({
        id: this.generateEdgeId(),
        u: source,
        v: target,
        w: weight
      });
      existingPairs.add(key);
      connectedNodes.push(target);
    }

    // 2. Tambahkan beberapa edge ekstra untuk membentuk siklus menarik
    const extraEdgesCount = Math.floor(count * 0.8) + 1;
    let attempts = 0;
    while (edges.length < (count - 1) + extraEdgesCount && attempts < 40) {
      attempts++;
      const uIdx = Math.floor(Math.random() * count);
      const vIdx = Math.floor(Math.random() * count);
      if (uIdx === vIdx) continue;

      const u = nodes[uIdx].id;
      const v = nodes[vIdx].id;
      const key = pairKey(u, v);

      if (!existingPairs.has(key)) {
        existingPairs.add(key);
        const weight = Math.floor(Math.random() * 12) + 2;
        edges.push({
          id: this.generateEdgeId(),
          u: u,
          v: v,
          w: weight
        });
      }
    }

    return { nodes, edges };
  },

  /**
   * Mengurai input teks (contoh: "A B 4\nB C 2") menjadi objek graf
   * Format per baris: <LabelU> <LabelV> <Bobot>
   */
  parseGraphFromText: function(text, canvasWidth = 800, canvasHeight = 480) {
    const lines = text.split('\n');
    const labelToNode = new Map();
    const edges = [];
    const edgeKeyMap = new Map();
    let warnings = [];

    lines.forEach((rawLine, lineIdx) => {
      const line = rawLine.trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) return;

      const parts = line.split(/\s+/);
      if (parts.length < 3) {
        warnings.push(`Baris ${lineIdx + 1}: format tidak sesuai ("${line}"). Harap gunakan: Label1 Label2 Bobot`);
        return;
      }

      const uLabel = parts[0].toUpperCase();
      const vLabel = parts[1].toUpperCase();
      const weight = parseFloat(parts[2]);

      if (isNaN(weight) || weight <= 0) {
        warnings.push(`Baris ${lineIdx + 1}: bobot "${parts[2]}" tidak valid. Harus angka positif.`);
        return;
      }

      if (uLabel === vLabel) {
        warnings.push(`Baris ${lineIdx + 1}: self-loop pada node "${uLabel}" diabaikan.`);
        return;
      }

      // Daftarkan node jika belum ada
      if (!labelToNode.has(uLabel)) {
        labelToNode.set(uLabel, {
          id: 'n_' + uLabel,
          label: uLabel
        });
      }
      if (!labelToNode.has(vLabel)) {
        labelToNode.set(vLabel, {
          id: 'n_' + vLabel,
          label: vLabel
        });
      }

      const uId = labelToNode.get(uLabel).id;
      const vId = labelToNode.get(vLabel).id;
      const edgeKey = uId < vId ? `${uId}_${vId}` : `${vId}_${uId}`;

      // Deteksi multi-edge: simpan yang bobotnya terkecil dan beri peringatan
      if (edgeKeyMap.has(edgeKey)) {
        const existingEdge = edgeKeyMap.get(edgeKey);
        if (weight < existingEdge.w) {
          warnings.push(`Baris ${lineIdx + 1}: edge ganda antara ${uLabel} dan ${vLabel}. Mengambil bobot terkecil (${weight}).`);
          existingEdge.w = weight;
        } else {
          warnings.push(`Baris ${lineIdx + 1}: edge ganda antara ${uLabel} dan ${vLabel} diabaikan (bobot ${weight} >= ${existingEdge.w}).`);
        }
      } else {
        const edgeObj = {
          id: 'e' + (edges.length + 1),
          u: uId,
          v: vId,
          w: weight
        };
        edges.push(edgeObj);
        edgeKeyMap.set(edgeKey, edgeObj);
      }
    });

    const nodesList = Array.from(labelToNode.values());
    if (nodesList.length === 0) {
      return {
        graph: null,
        error: 'Tidak ada data valid yang ditemukan pada teks input.',
        warnings
      };
    }

    // Atur posisi node dalam pola melingkar
    const count = nodesList.length;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radiusX = Math.min(centerX - 80, 280);
    const radiusY = Math.min(centerY - 80, 180);

    const nodes = nodesList.map((n, idx) => {
      const angle = (2 * Math.PI * idx) / count;
      return {
        id: n.id,
        label: n.label,
        x: Math.round(centerX + radiusX * Math.cos(angle)),
        y: Math.round(centerY + radiusY * Math.sin(angle))
      };
    });

    return {
      graph: { nodes, edges },
      error: null,
      warnings
    };
  },

  /**
   * Mengubah objek graf menjadi string teks baris
   */
  graphToText: function(graph) {
    if (!graph || !graph.edges) return '';
    return graph.edges
      .map(e => `${this.getNodeLabel(graph, e.u)} ${this.getNodeLabel(graph, e.v)} ${e.w}`)
      .join('\n');
  },

  /**
   * Mengkloning graf secara mendalam
   */
  cloneGraph: function(graph) {
    return {
      nodes: graph.nodes.map(n => ({ ...n })),
      edges: graph.edges.map(e => ({ ...e }))
    };
  }
};

