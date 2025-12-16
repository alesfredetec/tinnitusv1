/**
 * Visualization Engine - Hypnotic Visual Effects
 * Tinnitus MVP - Relaxing visual distractions
 */

class VisualizationEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.isPlaying = false;
    this.currentType = 'fractal'; // 'fractal', 'waves', 'particles', 'mandala', 'aurora'
    this.time = 0;
    this.particles = [];
    this.isFullscreen = false;

    // Configuration
    this.config = {
      fractal: {
        speed: 0.001,
        complexity: 5,
        colorShift: 0.1
      },
      waves: {
        speed: 0.02,
        amplitude: 50,
        frequency: 0.01,
        layers: 5
      },
      particles: {
        count: 100,
        speed: 1,
        size: 3,
        connectionDistance: 150
      },
      mandala: {
        speed: 0.005,
        petals: 12,
        layers: 6
      },
      aurora: {
        speed: 0.015,
        waves: 3,
        height: 0.6
      }
    };
  }

  /**
   * Initialize visualization
   */
  initialize(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      Logger.error('visualization', `Canvas con id '${canvasId}' no encontrado`);
      return false;
    }

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      Logger.error('visualization', 'No se pudo obtener contexto 2D del canvas');
      return false;
    }

    this.resize();

    // Verify canvas has valid dimensions
    if (this.canvas.width === 0 || this.canvas.height === 0) {
      Logger.warn('visualization', `Canvas tiene dimensiones inválidas: ${this.canvas.width}x${this.canvas.height}`);
      // Force minimum dimensions
      this.canvas.width = 800;
      this.canvas.height = 400;
      Logger.info('visualization', `Dimensiones forzadas a: ${this.canvas.width}x${this.canvas.height}`);
    }

    // Handle window resize
    window.addEventListener('resize', () => this.resize());

    // Handle fullscreen changes
    document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
    document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());
    document.addEventListener('MSFullscreenChange', () => this.onFullscreenChange());

    Logger.success('visualization', '✅ Motor de visualización inicializado');
    return true;
  }

  /**
   * Handle fullscreen change events
   */
  onFullscreenChange() {
    const isFullscreen = !!(document.fullscreenElement ||
                           document.webkitFullscreenElement ||
                           document.mozFullScreenElement ||
                           document.msFullscreenElement);

    this.isFullscreen = isFullscreen;
    this.resize();

    Logger.info('visualization', `Fullscreen ${isFullscreen ? 'activado' : 'desactivado'}`);
  }

  /**
   * Resize canvas
   */
  resize() {
    if (!this.canvas) return;

    if (this.isFullscreen) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    } else {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      // Fallback to a minimum size if parent has no dimensions yet
      this.canvas.width = rect.width > 0 ? rect.width : 800;
      this.canvas.height = rect.height > 0 ? rect.height : 400;
    }

    Logger.debug('visualization', `Canvas resized to ${this.canvas.width}x${this.canvas.height}`);

    // Reinitialize particles if needed
    if (this.currentType === 'particles') {
      this.initParticles();
    }
  }

  /**
   * Start visualization
   */
  start(type = 'fractal') {
    // Re-connect canvas if it was disconnected (e.g., after therapy change)
    if (this.canvas && !document.body.contains(this.canvas)) {
      Logger.warn('visualization', 'Canvas desconectado, re-conectando...');
      const newCanvas = document.getElementById('visualization-canvas');
      if (newCanvas && document.body.contains(newCanvas)) {
        this.canvas = newCanvas;
        this.ctx = newCanvas.getContext('2d');
        this.resize();
        Logger.success('visualization', '✅ Canvas re-conectado automáticamente');
      }
    }

    if (!this.canvas || !this.ctx) {
      Logger.error('visualization', 'Cannot start: canvas or context not initialized');
      return;
    }

    if (this.isPlaying) {
      this.stop();
    }

    this.currentType = type;
    this.isPlaying = true;
    this.time = 0;

    Logger.info('visualization', `🎨 Iniciando visualización: ${type}`);
    Logger.debug('visualization', `Canvas dimensiones: ${this.canvas.width}x${this.canvas.height}`);

    // Debug: Check canvas visibility
    const computedStyle = window.getComputedStyle(this.canvas);
    const parentStyle = window.getComputedStyle(this.canvas.parentElement);
    Logger.debug('visualization', `Canvas display: ${computedStyle.display}, visibility: ${computedStyle.visibility}, opacity: ${computedStyle.opacity}`);
    Logger.debug('visualization', `Parent (canvas-wrapper) display: ${parentStyle.display}, visibility: ${parentStyle.visibility}`);

    const container = document.getElementById('visualization-container');
    if (container) {
      const containerStyle = window.getComputedStyle(container);
      Logger.debug('visualization', `Container display: ${containerStyle.display}, visibility: ${containerStyle.visibility}`);
    } else {
      Logger.warn('visualization', `Container 'visualization-container' no encontrado en el DOM`);
    }

    // Initialize type-specific elements
    if (type === 'particles') {
      this.initParticles();
    }

    this.animate();
    Logger.success('visualization', `✅ Visualización ${type} iniciada correctamente`);
  }

  /**
   * Stop visualization
   */
  stop() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.clearCanvas();
    Logger.info('visualization', '⏹️ Visualización detenida');
  }

  /**
   * Change visualization type
   */
  changeType(type) {
    if (this.isPlaying) {
      this.start(type);
    } else {
      this.currentType = type;
    }
    Logger.info('visualization', `🎨 Tipo de visualización cambiado: ${type}`);
  }

  /**
   * Toggle fullscreen
   */
  async toggleFullscreen() {
    if (!this.canvas) {
      Logger.error('visualization', 'No se puede activar fullscreen: canvas no existe');
      return;
    }

    // Verify canvas is connected to DOM
    if (!document.body.contains(this.canvas)) {
      Logger.warn('visualization', 'Canvas desconectado del DOM (cambio de terapia detectado)');
      Logger.debug('visualization', 'Intentando re-conectar al canvas nuevo...');

      // Try to re-acquire canvas reference
      const newCanvas = document.getElementById('visualization-canvas');
      if (newCanvas && document.body.contains(newCanvas)) {
        Logger.success('visualization', '✅ Canvas nuevo encontrado y conectado');
        this.canvas = newCanvas;
        this.ctx = newCanvas.getContext('2d');

        // Resize to match new canvas
        this.resize();

        Logger.info('visualization', `Canvas re-conectado: ${this.canvas.width}x${this.canvas.height}`);
      } else {
        Logger.error('visualization', 'No se pudo encontrar canvas nuevo en el DOM');
        Logger.debug('visualization', 'Verificando estructura DOM...');

        const container = document.getElementById('visualization-container');
        if (container) {
          Logger.debug('visualization', `Container existe: ${container.style.display}`);
          const wrapper = container.querySelector('.canvas-wrapper');
          if (wrapper) {
            Logger.debug('visualization', `Wrapper existe, buscando canvas...`);
            const canvasInDom = wrapper.querySelector('#visualization-canvas');
            Logger.debug('visualization', `Canvas en DOM: ${canvasInDom ? 'SI' : 'NO'}`);
          } else {
            Logger.error('visualization', 'Canvas wrapper no encontrado');
          }
        } else {
          Logger.error('visualization', 'Visualization container no encontrado');
        }
        return;
      }
    }

    const isCurrentlyFullscreen = !!(document.fullscreenElement ||
                                     document.webkitFullscreenElement ||
                                     document.mozFullScreenElement ||
                                     document.msFullscreenElement);

    if (!isCurrentlyFullscreen) {
      try {
        Logger.debug('visualization', 'Intentando activar fullscreen...');
        Logger.debug('visualization', `Canvas: ${this.canvas.width}x${this.canvas.height}, isConnected: ${this.canvas.isConnected}`);

        // Request fullscreen on canvas
        if (this.canvas.requestFullscreen) {
          await this.canvas.requestFullscreen();
        } else if (this.canvas.webkitRequestFullscreen) {
          await this.canvas.webkitRequestFullscreen();
        } else if (this.canvas.mozRequestFullScreen) {
          await this.canvas.mozRequestFullScreen();
        } else if (this.canvas.msRequestFullscreen) {
          await this.canvas.msRequestFullscreen();
        } else {
          Logger.error('visualization', 'Fullscreen API no soportada en este navegador');
          return;
        }
        Logger.info('visualization', '🖥️ Solicitando modo fullscreen');
      } catch (error) {
        Logger.error('visualization', `Error activando fullscreen: ${error.message}`);
        Logger.debug('visualization', `Error completo: ${error.stack || error}`);
      }
    } else {
      try {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        Logger.info('visualization', '🖥️ Saliendo de modo fullscreen');
      } catch (error) {
        Logger.error('visualization', `Error desactivando fullscreen: ${error.message}`);
      }
    }
  }

  /**
   * Animation loop
   */
  animate() {
    if (!this.isPlaying) return;

    this.clearCanvas();

    switch (this.currentType) {
      case 'fractal':
        this.drawFractal();
        break;
      case 'waves':
        this.drawWaves();
        break;
      case 'particles':
        this.drawParticles();
        break;
      case 'mandala':
        this.drawMandala();
        break;
      case 'aurora':
        this.drawAurora();
        break;
    }

    this.time += 1;
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Clear canvas
   */
  clearCanvas() {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * FRACTAL VISUALIZATION
   */
  drawFractal() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const config = this.config.fractal;

    for (let i = 0; i < config.complexity; i++) {
      const angle = (this.time * config.speed + i * Math.PI / config.complexity) * 2;
      const radius = 50 + i * 30;
      const hue = (this.time * config.colorShift + i * 60) % 360;

      this.ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.6)`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();

      for (let j = 0; j < 360; j += 5) {
        const rad = (j * Math.PI) / 180;
        const r = radius + Math.sin(angle + rad * 3) * 20;
        const x = centerX + Math.cos(rad) * r;
        const y = centerY + Math.sin(rad) * r;

        if (j === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      this.ctx.closePath();
      this.ctx.stroke();
    }
  }

  /**
   * WAVES VISUALIZATION
   */
  drawWaves() {
    const config = this.config.waves;
    const width = this.canvas.width;
    const height = this.canvas.height;

    for (let layer = 0; layer < config.layers; layer++) {
      const hue = (this.time + layer * 60) % 360;
      this.ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${0.3 + layer * 0.1})`;
      this.ctx.lineWidth = 2 + layer;
      this.ctx.beginPath();

      const offset = (this.time * config.speed + layer * 50) % width;
      const yBase = height / 2 + layer * 20;

      for (let x = 0; x < width; x += 2) {
        const y = yBase +
          Math.sin((x + offset) * config.frequency) * config.amplitude +
          Math.sin((x + offset) * config.frequency * 2) * (config.amplitude / 2);

        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      this.ctx.stroke();
    }
  }

  /**
   * PARTICLES VISUALIZATION
   */
  initParticles() {
    this.particles = [];
    const config = this.config.particles;

    for (let i = 0; i < config.count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        hue: Math.random() * 360
      });
    }
  }

  drawParticles() {
    const config = this.config.particles;

    // Update and draw particles
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

      // Draw particle
      this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, 0.8)`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, config.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.connectionDistance) {
          const opacity = 1 - (distance / config.connectionDistance);
          this.ctx.strokeStyle = `rgba(100, 200, 255, ${opacity * 0.3})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  /**
   * MANDALA VISUALIZATION
   */
  drawMandala() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const config = this.config.mandala;

    for (let layer = 0; layer < config.layers; layer++) {
      const radius = 50 + layer * 40;
      const rotation = this.time * config.speed * (layer % 2 === 0 ? 1 : -1);
      const hue = (this.time * 0.5 + layer * 50) % 360;

      this.ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.6)`;
      this.ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.1)`;
      this.ctx.lineWidth = 2;

      for (let i = 0; i < config.petals; i++) {
        const angle = (i / config.petals) * Math.PI * 2 + rotation;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        this.ctx.beginPath();
        this.ctx.arc(x, y, 20 + layer * 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
      }
    }
  }

  /**
   * AURORA VISUALIZATION
   */
  drawAurora() {
    const config = this.config.aurora;
    const width = this.canvas.width;
    const height = this.canvas.height;

    for (let wave = 0; wave < config.waves; wave++) {
      const gradient = this.ctx.createLinearGradient(0, 0, 0, height * config.height);
      const hue1 = (this.time + wave * 80) % 360;
      const hue2 = (this.time + wave * 80 + 60) % 360;

      gradient.addColorStop(0, `hsla(${hue1}, 70%, 50%, 0.3)`);
      gradient.addColorStop(0.5, `hsla(${hue2}, 70%, 60%, 0.5)`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();

      const offset = (this.time * config.speed + wave * 100) % width;
      const yBase = height * 0.3 + wave * 50;

      this.ctx.moveTo(0, height);

      for (let x = 0; x < width; x += 5) {
        const y = yBase +
          Math.sin((x + offset) * 0.01) * 50 +
          Math.sin((x + offset) * 0.02) * 30 +
          Math.sin((x + offset) * 0.005) * 70;
        this.ctx.lineTo(x, y);
      }

      this.ctx.lineTo(width, height);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisualizationEngine;
}
