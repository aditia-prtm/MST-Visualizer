/**
 * ==========================================================================
 * CONTROLS.JS
 * Pengendali pemutaran visualisasi langkah (Prev, Next, Play/Pause, Reset, Kecepatan).
 * ==========================================================================
 */

window.ControlsModule = {
  steps: [],
  currentIndex: -1,
  isPlaying: false,
  timerId: null,
  speedMs: 1000, // Default 1 detik per langkah
  onStepChange: null,

  /**
   * Inisialisasi controller dengan daftar langkah baru
   * @param {Array} steps - Array langkah dari algoritma
   * @param {Function} onStepChange - Callback dipanggil saat indeks langkah berubah: fn(currentIndex)
   */
  init: function(steps, onStepChange) {
    this.pause();
    this.steps = steps || [];
    this.currentIndex = -1;
    this.onStepChange = onStepChange || function() {};
    this.updateControlsUI();
    this.onStepChange(this.currentIndex);
  },

  /**
   * Mengatur kecepatan autoplay dalam milidetik
   */
  setSpeed: function(speedMs) {
    this.speedMs = Math.max(200, Math.min(3000, Number(speedMs)));
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  },

  /**
   * Maju satu langkah (Next)
   */
  next: function() {
    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex += 1;
      this.updateControlsUI();
      if (this.onStepChange) this.onStepChange(this.currentIndex);
      return true;
    } else {
      this.pause();
      return false;
    }
  },

  /**
   * Mundur satu langkah (Prev)
   */
  prev: function() {
    if (this.currentIndex > -1) {
      this.currentIndex -= 1;
      this.updateControlsUI();
      if (this.onStepChange) this.onStepChange(this.currentIndex);
      return true;
    }
    return false;
  },

  /**
   * Reset ke kondisi sebelum langkah pertama
   */
  reset: function() {
    this.pause();
    this.currentIndex = -1;
    this.updateControlsUI();
    if (this.onStepChange) this.onStepChange(this.currentIndex);
  },

  /**
   * Memulai autoplay
   */
  play: function() {
    if (this.isPlaying) return;

    // Jika sudah di akhir langkah, mulai ulang dari -1
    if (this.currentIndex >= this.steps.length - 1) {
      this.currentIndex = -1;
      if (this.onStepChange) this.onStepChange(this.currentIndex);
    }

    this.isPlaying = true;
    this.updateControlsUI();

    const tick = () => {
      const hasNext = this.next();
      if (hasNext && this.isPlaying) {
        this.timerId = setTimeout(tick, this.speedMs);
      } else {
        this.pause();
      }
    };

    this.timerId = setTimeout(tick, this.speedMs);
  },

  /**
   * Menghentikan autoplay (Pause)
   */
  pause: function() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.updateControlsUI();
  },

  /**
   * Toggle antara Play dan Pause
   */
  togglePlay: function() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  },

  /**
   * Melompat ke langkah tertentu secara langsung
   */
  jumpTo: function(index) {
    this.pause();
    this.currentIndex = Math.max(-1, Math.min(this.steps.length - 1, index));
    this.updateControlsUI();
    if (this.onStepChange) this.onStepChange(this.currentIndex);
  },

  /**
   * Memperbarui status tombol di DOM (enable/disable, icon play/pause)
   */
  updateControlsUI: function() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnPlay = document.getElementById('btn-play');
    const btnReset = document.getElementById('btn-reset');
    const stepCounter = document.getElementById('step-counter');

    if (btnPrev) {
      btnPrev.disabled = this.currentIndex <= -1;
    }

    if (btnNext) {
      btnNext.disabled = this.currentIndex >= this.steps.length - 1;
    }

    if (btnReset) {
      btnReset.disabled = this.currentIndex === -1;
    }

    if (btnPlay) {
      if (this.isPlaying) {
        btnPlay.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg> Pause
        `;
        btnPlay.classList.add('btn-playing');
      } else {
        btnPlay.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg> Play
        `;
        btnPlay.classList.remove('btn-playing');
      }
    }

    if (stepCounter) {
      const displayCurrent = Math.max(0, this.currentIndex + 1);
      stepCounter.textContent = `${displayCurrent} / ${this.steps.length}`;
    }
  }
};

