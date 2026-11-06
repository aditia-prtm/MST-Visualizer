/**
 * js/particles.js
 * Sistem partikel graf interaktif latar belakang (Latar MST).
 * Ringan, tanpa pustaka eksternal, performa tinggi dengan requestAnimationFrame.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('bg-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Cek preferensi aksesibilitas gerakan
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let particles = [];
  let mouse = { x: -1000, y: -1000, radius: 140 };
  let animationFrameId = null;

  // Konfigurasi visual partikel terarah (Deep Slate / Tech Blue)
  const CONFIG = {
    particleCountBase: 50,
    maxDistance: 120,
    nodeColor: 'rgba(59, 130, 246, 0.45)',
    accentNodeColor: 'rgba(14, 165, 233, 0.65)',
    edgeColorRgb: '59, 130, 246',
    maxSpeed: 0.45
  };

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : (Math.random() > 0.5 ? 0 : width);
      this.y = initial ? Math.random() * height : Math.random() * height;
      this.vx = (Math.random() - 0.5) * CONFIG.maxSpeed;
      this.vy = (Math.random() - 0.5) * CONFIG.maxSpeed;
      this.radius = Math.random() > 0.8 ? 2.5 : 1.6;
      this.isAccent = Math.random() > 0.75;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Pantulan tepi layar halus
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Interaksi lembut kursor mouse
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distSq = dx * dx + dy * dy;
      const mouseDistSq = mouse.radius * mouse.radius;

      if (distSq < mouseDistSq && distSq > 0) {
        const force = (1 - distSq / mouseDistSq) * 0.02;
        this.x -= dx * force;
        this.y -= dy * force;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.isAccent ? CONFIG.accentNodeColor : CONFIG.nodeColor;
      ctx.fill();
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);

    // Sesuaikan kepadatan node berdasarkan lebar viewport
    const count = Math.min(
      Math.floor((width * height) / 22000),
      CONFIG.particleCountBase
    );

    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    if (prefersReducedMotion) {
      renderStatic();
    }
  }

  function drawEdges() {
    const maxDistSq = CONFIG.maxDistance * CONFIG.maxDistance;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const alpha = (1 - distSq / maxDistSq) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${CONFIG.edgeColorRgb}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Hubungkan ke kursor mouse jika dekat
      const dxM = particles[i].x - mouse.x;
      const dyM = particles[i].y - mouse.y;
      const distSqM = dxM * dxM + dyM * dyM;
      const mouseRadiusSq = mouse.radius * mouse.radius;

      if (distSqM < mouseRadiusSq) {
        const alpha = (1 - distSqM / mouseRadiusSq) * 0.28;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
  }

  function renderStatic() {
    ctx.clearRect(0, 0, width, height);
    drawEdges();
    for (let i = 0; i < particles.length; i++) {
      particles[i].draw();
    }
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    drawEdges();
    animationFrameId = requestAnimationFrame(loop);
  }

  // Event Listeners
  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('mouseleave', function () {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Matikan animasi saat tab background untuk hemat energi
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else if (!prefersReducedMotion) {
      loop();
    }
  });

  // Inisialisasi
  resize();
  if (!prefersReducedMotion) {
    loop();
  }
})();

