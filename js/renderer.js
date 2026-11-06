/**
 * ==========================================================================
 * RENDERER.JS
 * Modul penggambaran SVG untuk graf dan visualisasi langkah algoritma.
 * Stateless: Fungsi render menghitung ulang kondisi graf dari langkah 0 hingga index.
 * ==========================================================================
 */

window.RendererModule = {
  // Pengaturan visual graf
  config: {
    nodeRadius: 22,
    colors: {
      idle: '#64748b',       // Abu-abu
      check: '#f59e0b',      // Kuning
      accept: '#10b981',     // Hijau
      reject: '#ef4444',     // Merah
      selected: '#38bdf8',   // Biru muda untuk seleksi di editor
      nodeBg: '#1e293b',
      nodeText: '#f8fafc',
      weightBg: '#0f172a'
    }
  },

  /**
   * Menghitung status setiap edge dan node dari langkah 0 sampai stepIndex.
   * index = -1 mengindikasikan kondisi awal (semua edge idle).
   * 
   * @param {Object} graph - { nodes, edges }
   * @param {Array} steps - Array step dari Kruskal / Prim
   * @param {number} stepIndex - Indeks langkah saat ini (-1 s.d. steps.length - 1)
   * @returns {Object} { edgeStates: Map, nodeStates: Map, currentStep: Object|null }
   */
  computeGraphState: function(graph, steps, stepIndex) {
    const edgeStates = new Map(); // id edge -> status ('idle' | 'check' | 'accept' | 'reject')
    const nodeStates = new Map(); // id node -> status ('idle' | 'check' | 'accept')

    // Set default awal
    graph.edges.forEach(e => edgeStates.set(e.id, 'idle'));
    graph.nodes.forEach(n => nodeStates.set(n.id, 'idle'));

    if (!steps || stepIndex < 0 || stepIndex >= steps.length) {
      return { edgeStates, nodeStates, currentStep: null };
    }

    // Putar ulang langkah dari 0 sampai stepIndex (stateless)
    for (let i = 0; i <= stepIndex; i++) {
      const step = steps[i];

      // Reset edge yang sedang 'check' dari langkah sebelumnya jika tidak berstatus khusus
      // tapi biarkan accept dan reject tetap permanen
      if (step.edge) {
        edgeStates.set(step.edge, step.status);
      }

      // Update state node untuk algoritma Prim (memiliki properti visited)
      if (step.visited && Array.isArray(step.visited)) {
        step.visited.forEach(nodeId => {
          nodeStates.set(nodeId, 'accept');
        });
      }
    }

    // Tandai node yang terhubung dengan edge accept / check
    edgeStates.forEach((status, edgeId) => {
      const edge = graph.edges.find(e => e.id === edgeId);
      if (!edge) return;

      if (status === 'accept') {
        // Node penerima MST
        if (nodeStates.get(edge.u) !== 'accept') nodeStates.set(edge.u, 'accept');
        if (nodeStates.get(edge.v) !== 'accept') nodeStates.set(edge.v, 'accept');
      }
    });

    const currentStep = steps[stepIndex] || null;

    // Jika di langkah saat ini ada edge yang sedang diperiksa, highlight node ujungnya
    if (currentStep && currentStep.edge && currentStep.status === 'check') {
      const activeEdge = graph.edges.find(e => e.id === currentStep.edge);
      if (activeEdge) {
        if (nodeStates.get(activeEdge.u) !== 'accept') nodeStates.set(activeEdge.u, 'check');
        if (nodeStates.get(activeEdge.v) !== 'accept') nodeStates.set(activeEdge.v, 'check');
      }
    }

    return { edgeStates, nodeStates, currentStep };
  },

  /**
   * Merender graf ke dalam elemen SVG berdasarkan langkah saat ini
   * @param {SVGElement} svgElement - Elemen SVG target
   * @param {Object} graph - { nodes: [], edges: [] }
   * @param {Array} steps - Daftar langkah dari algoritma
   * @param {number} stepIndex - Indeks langkah (-1 untuk awal)
   * @param {Object} options - { selectedNodeId, isEditable, onNodeClick, onEdgeClick, onNodeDragStart }
   */
  render: function(svgElement, graph, steps = [], stepIndex = -1, options = {}) {
    if (!svgElement || !graph) return;

    // Kosongkan kanvas SVG
    svgElement.innerHTML = '';

    const { edgeStates, nodeStates, currentStep } = this.computeGraphState(graph, steps, stepIndex);
    const selectedNodeId = options.selectedNodeId || null;
    const isEditable = options.isEditable || false;

    // Definisikan defs untuk marker panah atau efek filter glow bila perlu
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgElement.appendChild(defs);

    // Group untuk edge
    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgesGroup.setAttribute('class', 'edges-layer');
    svgElement.appendChild(edgesGroup);

    // Group untuk node
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodesGroup.setAttribute('class', 'nodes-layer');
    svgElement.appendChild(nodesGroup);

    // 1. Gambar Edges
    graph.edges.forEach(edge => {
      const uNode = graph.nodes.find(n => n.id === edge.u);
      const vNode = graph.nodes.find(n => n.id === edge.v);
      if (!uNode || !vNode) return;

      const state = edgeStates.get(edge.id) || 'idle';
      const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      edgeGroup.setAttribute('class', `edge-group edge-${state}`);
      edgeGroup.setAttribute('data-edge-id', edge.id);

      // Garis Edge
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', uNode.x);
      line.setAttribute('y1', uNode.y);
      line.setAttribute('x2', vNode.x);
      line.setAttribute('y2', vNode.y);
      line.setAttribute('class', `graph-edge edge-status-${state}`);

      // Styling berdasarkan status
      let strokeColor = this.config.colors.idle;
      let strokeWidth = 3;
      let strokeDasharray = 'none';
      let opacity = '0.7';

      if (state === 'check') {
        strokeColor = this.config.colors.check;
        strokeWidth = 5;
        opacity = '1';
      } else if (state === 'accept') {
        strokeColor = this.config.colors.accept;
        strokeWidth = 5.5;
        opacity = '1';
      } else if (state === 'reject') {
        strokeColor = this.config.colors.reject;
        strokeWidth = 3;
        strokeDasharray = '6,5';
        opacity = '0.45';
      }

      line.style.stroke = strokeColor;
      line.style.strokeWidth = strokeWidth;
      line.style.strokeDasharray = strokeDasharray;
      line.style.opacity = opacity;
      line.style.transition = 'all 0.3s ease';

      edgeGroup.appendChild(line);

      // Titik tengah untuk label bobot
      const midX = (uNode.x + vNode.x) / 2;
      const midY = (uNode.y + vNode.y) / 2;

      // Label Bobot (Background Badge + Text)
      const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      labelGroup.setAttribute('class', 'weight-badge');
      labelGroup.setAttribute('transform', `translate(${midX}, ${midY})`);

      const weightText = String(edge.w);
      const boxWidth = Math.max(26, weightText.length * 9 + 12);
      const boxHeight = 22;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', -boxWidth / 2);
      rect.setAttribute('y', -boxHeight / 2);
      rect.setAttribute('width', boxWidth);
      rect.setAttribute('height', boxHeight);
      rect.setAttribute('rx', 6);
      rect.setAttribute('ry', 6);
      rect.style.fill = '#090d16';
      rect.style.stroke = strokeColor;
      rect.style.strokeWidth = state === 'check' || state === 'accept' ? '2' : '1.5';
      rect.style.transition = 'stroke 0.3s ease';

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('class', 'weight-text');
      text.textContent = weightText;
      text.style.fill = state === 'reject' ? '#f87171' : (state === 'check' ? '#fbbf24' : (state === 'accept' ? '#34d399' : '#cbd5e1'));
      text.style.fontSize = '12px';
      text.style.fontWeight = 'bold';
      text.style.fontFamily = 'monospace, sans-serif';
      text.style.userSelect = 'none';

      labelGroup.appendChild(rect);
      labelGroup.appendChild(text);
      edgeGroup.appendChild(labelGroup);

      // Event click untuk hapus edge di mode editor jika diinginkan
      if (isEditable && options.onEdgeClick) {
        edgeGroup.style.cursor = 'pointer';
        edgeGroup.addEventListener('click', (e) => {
          e.stopPropagation();
          options.onEdgeClick(edge);
        });
      }

      edgesGroup.appendChild(edgeGroup);
    });

    // 2. Gambar Nodes
    graph.nodes.forEach(node => {
      const state = nodeStates.get(node.id) || 'idle';
      const isSelected = selectedNodeId === node.id;

      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeGroup.setAttribute('class', `node-group node-${state} ${isSelected ? 'is-selected' : ''}`);
      nodeGroup.setAttribute('data-node-id', node.id);
      nodeGroup.setAttribute('transform', `translate(${node.x}, ${node.y})`);

      // Lingkaran luar (halo effect jika terpilih atau sedang dicek)
      if (isSelected || state === 'check' || state === 'accept') {
        const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        halo.setAttribute('r', this.config.nodeRadius + 6);
        halo.setAttribute('class', 'node-halo');
        halo.style.fill = 'transparent';
        halo.style.stroke = isSelected ? this.config.colors.selected : (state === 'accept' ? this.config.colors.accept : this.config.colors.check);
        halo.style.strokeWidth = '2';
        halo.style.strokeDasharray = isSelected ? '4,3' : 'none';
        halo.style.opacity = isSelected ? '0.9' : '0.6';
        halo.style.animation = isSelected ? 'spin 10s linear infinite' : 'none';
        nodeGroup.appendChild(halo);
      }

      // Lingkaran utama
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', this.config.nodeRadius);
      circle.setAttribute('class', 'node-circle');

      let strokeColor = '#475569';
      let fillColor = '#1e293b';

      if (isSelected) {
        strokeColor = this.config.colors.selected;
        fillColor = '#0f172a';
      } else if (state === 'accept') {
        strokeColor = this.config.colors.accept;
        fillColor = 'rgba(16, 185, 129, 0.2)';
      } else if (state === 'check') {
        strokeColor = this.config.colors.check;
        fillColor = 'rgba(245, 158, 11, 0.2)';
      }

      circle.style.fill = fillColor;
      circle.style.stroke = strokeColor;
      circle.style.strokeWidth = isSelected || state !== 'idle' ? '3' : '2.5';
      circle.style.transition = 'all 0.25s ease';

      // Label teks node
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('class', 'node-label');
      text.textContent = node.label;
      text.style.fill = '#ffffff';
      text.style.fontSize = '14px';
      text.style.fontWeight = 'bold';
      text.style.userSelect = 'none';
      text.style.pointerEvents = 'none';

      nodeGroup.appendChild(circle);
      nodeGroup.appendChild(text);

      // Event listener di editor (klik node & drag)
      if (isEditable) {
        nodeGroup.style.cursor = 'grab';

        nodeGroup.addEventListener('click', (e) => {
          e.stopPropagation();
          if (options.onNodeClick) {
            options.onNodeClick(node);
          }
        });

        nodeGroup.addEventListener('mousedown', (e) => {
          if (options.onNodeDragStart) {
            options.onNodeDragStart(node, e);
          }
        });

        // Dukungan touch untuk smartphone & tablet
        nodeGroup.addEventListener('touchstart', (e) => {
          if (options.onNodeDragStart) {
            options.onNodeDragStart(node, e);
          }
        }, { passive: true });
      }

      nodesGroup.appendChild(nodeGroup);
    });
  }
};

