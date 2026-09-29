/* ======================================================
   DIGITINHO — js/ambient.js
   Saturated ambient landscape & dynamic mesh glow.
   Renders vibrant colorful orbs, topographical contours,
   and oceanic gradients behind frosted glass panels.
   ====================================================== */
'use strict';

(function() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let animationId = null;

  function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Floating saturated color orbs (Cyan, Emerald, Violet, Coral, Amber, Magenta)
  const orbs = [
    { xRatio: 0.12, yRatio: 0.28, radiusRatio: 0.44, colorDark: [0, 190, 255, 0.65], colorLight: [14, 165, 233, 0.60], speedX: 0.0008, speedY: 0.0006, phase: 0 },
    { xRatio: 0.88, yRatio: 0.22, radiusRatio: 0.42, colorDark: [16, 215, 140, 0.60], colorLight: [16, 185, 129, 0.55], speedX: 0.0007, speedY: 0.0009, phase: 1.8 },
    { xRatio: 0.14, yRatio: 0.82, radiusRatio: 0.42, colorDark: [139, 92, 246, 0.65], colorLight: [147, 51, 234, 0.55], speedX: 0.0009, speedY: 0.0007, phase: 3.2 },
    { xRatio: 0.86, yRatio: 0.78, radiusRatio: 0.44, colorDark: [255, 71, 110, 0.60], colorLight: [244, 63, 94, 0.55], speedX: 0.0006, speedY: 0.0008, phase: 4.5 },
    { xRatio: 0.50, yRatio: 0.38, radiusRatio: 0.36, colorDark: [245, 158, 11, 0.45], colorLight: [245, 158, 11, 0.45], speedX: 0.0005, speedY: 0.0005, phase: 2.4 },
    { xRatio: 0.50, yRatio: 0.90, radiusRatio: 0.36, colorDark: [217, 70, 239, 0.55], colorLight: [236, 72, 153, 0.50], speedX: 0.0007, speedY: 0.0006, phase: 5.1 },
  ];

  // Topographic contour lines (modern map style)
  function drawTopography(isLight) {
    const strokeStyle = isLight ? 'rgba(14, 165, 233, 0.22)' : 'rgba(56, 189, 248, 0.15)';
    const gridStyle   = isLight ? 'rgba(15, 23, 42, 0.05)'   : 'rgba(255, 255, 255, 0.04)';

    // Fine coordinate grid lines
    ctx.strokeStyle = gridStyle;
    ctx.lineWidth = 1;
    const step = 90;
    ctx.beginPath();
    for (let x = 0; x < width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Topographic organic contours
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 1.5;

    const cx = width * 0.5;
    const cy = height * 0.52;
    const count = 5;

    for (let i = 1; i <= count; i++) {
      const rx = (width * 0.24) * (i / count * 1.55);
      const ry = (height * 0.30) * (i / count * 1.45);
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.15; a += 0.18) {
        // Organic coastal ripple
        const wobble = Math.sin(a * 4 + i * 1.2) * 18 + Math.cos(a * 2 - i * 0.8) * 14;
        const px = cx + Math.cos(a) * (rx + wobble);
        const py = cy + Math.sin(a) * (ry + wobble);
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  function render(time) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    // Base background gradient with vibrant atmosphere
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (isLight) {
      bgGrad.addColorStop(0, '#BAE6FD');   // Saturated sky cyan
      bgGrad.addColorStop(0.45, '#DDD6FE'); // Lavender sunset
      bgGrad.addColorStop(1, '#FED7AA');   // Warm golden horizon
    } else {
      bgGrad.addColorStop(0, '#0a1024');   // Deep nocturnal indigo
      bgGrad.addColorStop(0.45, '#140c2e'); // Tropical twilight violet
      bgGrad.addColorStop(1, '#071626');   // Deep oceanic teal
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Render saturated glowing orbs
    orbs.forEach(orb => {
      const offsetX = Math.sin(time * orb.speedX + orb.phase) * (width * 0.05);
      const offsetY = Math.cos(time * orb.speedY + orb.phase) * (height * 0.06);
      const ox = orb.xRatio * width + offsetX;
      const oy = orb.yRatio * height + offsetY;
      const radius = orb.radiusRatio * Math.max(width, height);

      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
      const c = isLight ? orb.colorLight : orb.colorDark;
      grad.addColorStop(0, `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3]})`);
      grad.addColorStop(0.5, `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3] * 0.45})`);
      grad.addColorStop(1, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ox, oy, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Topographic contours
    drawTopography(isLight);

    animationId = requestAnimationFrame(render);
  }

  animationId = requestAnimationFrame(render);
})();
