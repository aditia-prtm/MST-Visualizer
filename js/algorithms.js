/**
 * ==========================================================================
 * ALGORITHMS.JS
 * Logika murni algoritma Kruskal dan Prim.
 * TIDAK MENYENTUH DOM. Menghasilkan array langkah (steps) untuk divisualisasikan.
 * ==========================================================================
 */

/**
 * Struktur Data Disjoint-Set / Union-Find untuk Algoritma Kruskal
 * Dilengkapi dengan Path Compression dan Union by Rank.
 */
class UnionFind {
  constructor(nodeIds) {
    this.parent = {};
    this.rank = {};

    nodeIds.forEach(id => {
      this.parent[id] = id;
      this.rank[id] = 0;
    });
  }

  /**
   * Menemukan representatif himpunan dengan path compression
   */
  find(id) {
    if (this.parent[id] === undefined) {
      this.parent[id] = id;
      this.rank[id] = 0;
      return id;
    }
    if (this.parent[id] !== id) {
      this.parent[id] = this.find(this.parent[id]);
    }
    return this.parent[id];
  }

  /**
   * Menggabungkan dua himpunan dengan rank
   * @returns {boolean} true jika berhasil digabung (berbeda himpunan), false jika sudah satu himpunan
   */
  union(u, v) {
    const rootU = this.find(u);
    const rootV = this.find(v);

    if (rootU === rootV) {
      return false; // Membentuk siklus
    }

    if (this.rank[rootU] < this.rank[rootV]) {
      this.parent[rootU] = rootV;
    } else if (this.rank[rootU] > this.rank[rootV]) {
      this.parent[rootV] = rootU;
    } else {
      this.parent[rootV] = rootU;
      this.rank[rootU] += 1;
    }

    return true;
  }

  /**
   * Cek apakah dua node berada dalam himpunan yang sama
   */
  connected(u, v) {
    return this.find(u) === this.find(v);
  }
}

// Objek namespace global AlgorithmsModule
window.AlgorithmsModule = {
  UnionFind: UnionFind,

  /**
   * Pembantu untuk membulatkan angka float agar terhindar dari 0.30000000000000004
   */
  roundWeight: function(num) {
    return Math.round(num * 1000) / 1000;
  },

  /**
   * Pembantu mendapatkan label node dari graf
   */
  getLabel: function(graph, nodeId) {
    const n = graph.nodes.find(node => node.id === nodeId);
    return n ? n.label : nodeId;
  },

  /**
   * Algoritma Kruskal
   * 
   * Prinsip:
   * 1. Urutkan semua edge naik berdasarkan bobot (ascending).
   * 2. Periksa setiap edge satu per satu.
   * 3. Jika edge menghubungkan dua komponen berbeda (tidak ada siklus), terima ke MST.
   * 4. Jika kedua node sudah terhubung, tolak karena membentuk siklus.
   * 5. Berhenti jika sudah terpilih (V - 1) edge.
   * 
   * @param {Object} graph - { nodes: [], edges: [] }
   * @returns {Object} { steps: [], mstEdges: [], totalWeight: number, sortedEdges: [] }
   */
  kruskal: function(graph) {
    const steps = [];
    let currentTotalWeight = 0;
    const mstEdges = [];
    const targetEdgesCount = graph.nodes.length - 1;

    // 1. Urutkan edge berdasarkan bobot naik
    // Tie-break deterministik: jika bobot sama, urutkan berdasarkan ID edge
    const sortedEdges = [...graph.edges].sort((a, b) => {
      if (a.w !== b.w) {
        return a.w - b.w;
      }
      return String(a.id).localeCompare(String(b.id));
    }); 

    const uf = new UnionFind(graph.nodes.map(n => n.id));

    // Iterasi setiap edge yang sudah terurut
    for (let i = 0; i < sortedEdges.length; i++) {
      const edge = sortedEdges[i];
      const uLabel = this.getLabel(graph, edge.u);
      const vLabel = this.getLabel(graph, edge.v);

      // Langkah A: Pemeriksaan (status: "check")
      steps.push({
        edge: edge.id,
        status: 'check',
        note: `Memeriksa edge (${uLabel} - ${vLabel}) dengan bobot ${edge.w}.`,
        totalWeight: currentTotalWeight,
        activeEdgeIndex: i
      });

      // Cek apakah membentuk siklus dengan Union-Find
      if (!uf.connected(edge.u, edge.v)) {
        // Himpunan berbeda -> Tidak ada siklus -> Terima
        uf.union(edge.u, edge.v);
        currentTotalWeight = this.roundWeight(currentTotalWeight + edge.w);
        mstEdges.push(edge);

        steps.push({
          edge: edge.id,
          status: 'accept',
          note: `Edge (${uLabel} - ${vLabel}) diterima masuk MST karena menghubungkan 2 komponen yang terpisah (tidak bersiklus). Total bobot: ${currentTotalWeight}.`,
          totalWeight: currentTotalWeight,
          activeEdgeIndex: i
        });

        // Jika MST sudah lengkap (V - 1 edge)
        if (mstEdges.length === targetEdgesCount) {
          // Tandai selesai jika masih ada sisa edge yang tidak perlu dicek lagi
          const remainingCount = sortedEdges.length - 1 - i;
          if (remainingCount > 0) {
            steps.push({
              edge: edge.id,
              status: 'accept',
              note: `MST telah lengkap dengan ${mstEdges.length} edge (${graph.nodes.length} node - 1). Sebanyak ${remainingCount} edge tersisa tidak perlu diperiksa lagi.`,
              totalWeight: currentTotalWeight,
              activeEdgeIndex: i,
              isCompleted: true
            });
          }
          break;
        }
      } else {
        // Satu himpunan -> Membentuk siklus -> Tolak
        steps.push({
          edge: edge.id,
          status: 'reject',
          note: `Edge (${uLabel} - ${vLabel}) ditolak karena node ${uLabel} dan ${vLabel} sudah terhubung (akan membentuk siklus).`,
          totalWeight: currentTotalWeight,
          activeEdgeIndex: i
        });
      }
    }

    return {
      steps: steps,
      mstEdges: mstEdges,
      totalWeight: currentTotalWeight,
      sortedEdges: sortedEdges
    };
  },

  /**
   * Algoritma Prim
   * 
   * Prinsip:
   * 1. Mulai dari satu node awal pilihan (startNodeId).
   * 2. Tandai node awal sebagai 'visited'.
   * 3. Di setiap langkah, cari semua edge yang menghubungkan node di dalam 'visited'
   *    ke node di luar 'visited' (cut edges).
   * 4. Pilih edge dengan bobot terkecil (tie-break berdasarkan ID).
   * 5. Masukkan edge dan node baru ke dalam MST.
   * 6. Ulangi sampai semua node masuk ke himpunan 'visited'.
   * 
   * @param {Object} graph - { nodes: [], edges: [] }
   * @param {string} startNodeId - ID node awal
   * @returns {Object} { steps: [], mstEdges: [], totalWeight: number }
   */
  prim: function(graph, startNodeId) {
    const steps = [];
    let currentTotalWeight = 0;
    const mstEdges = [];

    // Validasi node awal
    const startNode = graph.nodes.find(n => n.id === startNodeId) || graph.nodes[0];
    const visitedSet = new Set([startNode.id]);

    // Langkah inisialisasi awal
    steps.push({
      edge: null,
      status: 'check',
      note: `Inisialisasi algoritma Prim. Mulai dari node awal [${startNode.label}]. Himpunan MST saat ini: { ${startNode.label} }.`,
      totalWeight: 0,
      visited: Array.from(visitedSet)
    });

    const totalNodes = graph.nodes.length;

    while (visitedSet.size < totalNodes) {
      // Cari semua edge cut: menghubungkan node di dalam visitedSet ke node di luar visitedSet
      const candidateEdges = [];

      graph.edges.forEach(edge => {
        const uIn = visitedSet.has(edge.u);
        const vIn = visitedSet.has(edge.v);

        // Harus tepat satu ujung di dalam visitedSet
        if ((uIn && !vIn) || (!uIn && vIn)) {
          candidateEdges.push({
            edge: edge,
            inside: uIn ? edge.u : edge.v,
            outside: uIn ? edge.v : edge.u
          });
        }
      });

      if (candidateEdges.length === 0) {
        // Graf tidak terhubung (seharusnya sudah dicek di validasi awal)
        break;
      }

      // Urutkan kandidat berdasarkan bobot terkecil
      // Tie-break: gunakan ID edge secara leksikografis
      candidateEdges.sort((a, b) => {
        if (a.edge.w !== b.edge.w) {
          return a.edge.w - b.edge.w;
        }
        return String(a.edge.id).localeCompare(String(b.edge.id));
      });

      const bestCandidate = candidateEdges[0];
      const bestEdge = bestCandidate.edge;
      const newNodeId = bestCandidate.outside;

      const uLabel = this.getLabel(graph, bestEdge.u);
      const vLabel = this.getLabel(graph, bestEdge.v);
      const newLabel = this.getLabel(graph, newNodeId);

      // Langkah A: Pemeriksaan edge kandidat terkecil (status: "check")
      steps.push({
        edge: bestEdge.id,
        status: 'check',
        note: `Mencari edge terpendek dari himpunan MST ke node luar. Terpilih edge (${uLabel} - ${vLabel}) dengan bobot ${bestEdge.w}.`,
        totalWeight: currentTotalWeight,
        visited: Array.from(visitedSet)
      });

      // Langkah B: Diterima masuk MST (status: "accept")
      visitedSet.add(newNodeId);
      currentTotalWeight = this.roundWeight(currentTotalWeight + bestEdge.w);
      mstEdges.push(bestEdge);

      const visitedLabels = Array.from(visitedSet)
        .map(id => this.getLabel(graph, id))
        .join(', ');

      steps.push({
        edge: bestEdge.id,
        status: 'accept',
        note: `Edge (${uLabel} - ${vLabel}) diterima masuk MST. Node [${newLabel}] sekarang masuk himpunan MST. Himpunan MST: { ${visitedLabels} }. Total bobot: ${currentTotalWeight}.`,
        totalWeight: currentTotalWeight,
        visited: Array.from(visitedSet)
      });
    }

    // Langkah penyelesaian
    if (visitedSet.size === totalNodes) {
      steps.push({
        edge: null,
        status: 'accept',
        note: `Seluruh ${totalNodes} node telah terhubung dalam MST! Pohon merentang minimum selesai dibentuk dengan total bobot ${currentTotalWeight}.`,
        totalWeight: currentTotalWeight,
        visited: Array.from(visitedSet),
        isCompleted: true
      });
    }

    return {
      steps: steps,
      mstEdges: mstEdges,
      totalWeight: currentTotalWeight
    };
  }
};

