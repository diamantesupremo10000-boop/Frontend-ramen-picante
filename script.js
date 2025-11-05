/* script.js
   Minimal, performant DOM animations: particle background, interactive subtle parallax,
   toggle motion, respects prefers-reduced-motion.
*/

(function () {
  // Helpers
  const $ = (sel) => document.querySelector(sel);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Particle field (simple DOM-based, lightweight)
  const particlesRoot = document.getElementById('particles');
  const PART_COUNT = Math.max(Math.floor((window.innerWidth * window.innerHeight) / 50000), 12);

  function makeParticle(i) {
    const el = document.createElement('div');
    el.className = 'p';
    // Inline minimal styles to keep CSS lighter
    const size = 6 + Math.round(Math.random() * 18);
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const hue = 330 + Math.round(Math.random() * 60); // pink -> orange
    el.style.position = 'absolute';
    el.style.left = left + '%';
    el.style.top = top + '%';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.borderRadius = '50%';
    el.style.pointerEvents = 'none';
    el.style.opacity = (0.08 + Math.random() * 0.25).toString();
    el.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), hsl(${hue} 90% 60% / 0.9))`;
    el.dataset.vx = (Math.random() - 0.5) * 0.02;
    el.dataset.vy = (Math.random() - 0.5) * 0.06;
    return el;
  }

  function initParticles() {
    if (!particlesRoot) return;
    particlesRoot.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (let i = 0; i < PART_COUNT; i++) {
      const p = makeParticle(i);
      frag.appendChild(p);
    }
    particlesRoot.appendChild(frag);
  }

  // Animation loop for particles
  let running = true;
  function tickParticles() {
    if (!running) return;
    const nodes = particlesRoot.children;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const left = parseFloat(n.style.left);
      const top = parseFloat(n.style.top);
      let nx = left + parseFloat(n.dataset.vx);
      let ny = top + parseFloat(n.dataset.vy);
      if (nx < -5) nx = 105;
      if (nx > 105) nx = -5;
      if (ny < -10) ny = 110;
      if (ny > 110) ny = -10;
      n.style.left = nx + '%';
      n.style.top = ny + '%';
      // subtle shimmer
      const o = 0.06 + (Math.sin((Date.now() / 1000) + i) * 0.02);
      n.style.opacity = Math.abs(o).toFixed(3);
    }
    requestAnimationFrame(tickParticles);
  }

  // Parallax/tilt on mouse move for ramen
  const ramen = document.getElementById('ramen');
  function onPointer(e) {
    if (!ramen) return;
    const rect = ramen.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / rect.width;
    const py = (e.clientY - cy) / rect.height;
    const ry = px * 12;
    const rx = -py * 10;
    // limit
    ramen.style.transform = `translateZ(40px) rotateX(${12 + rx}deg) rotateY(${ -6 + ry }deg) scale(1)`;
  }

  function resetRamenTransform() {
    if (!ramen) return;
    ramen.style.transform = `translateZ(40px) rotateX(12deg) rotateY(-6deg) scale(1)`;
  }

  // Toggle motion button
  const toggleBtn = document.getElementById('toggleMotion');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      running = !running;
      toggleBtn.textContent = running ? 'Pause Motion' : 'Resume Motion';
      if (running) requestAnimationFrame(tickParticles);
    });
  }

  // Init
  if (!prefersReducedMotion) {
    initParticles();
    requestAnimationFrame(tickParticles);
    // event listeners for parallax
    window.addEventListener('pointermove', onPointer);
    window.addEventListener('pointerleave', resetRamenTransform);
  } else {
    // if reduced motion, keep static particles but don't animate
    initParticles();
    (document.getElementById('toggleMotion') || {}).style.display = 'none';
  }

  // Rebuild on resize for density control
  let resizeTO;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => {
      initParticles();
    }, 220);
  });

  // keyboard accessible focus effect
  if (ramen) {
    ramen.addEventListener('focus', () => ramen.style.transform = `translateZ(48px) rotateX(8deg) rotateY(-2deg) scale(1.02)`);
    ramen.addEventListener('blur', resetRamenTransform);
  }

  // Small progressive enhancement: gentle pulse to rim with requestAnimationFrame
  const rim = document.querySelector('.rim-glow');
  if (rim && !prefersReducedMotion) {
    let t0 = performance.now();
    (function rimPulse(now) {
      const dt = (now - t0) / 1000;
      const glow = 0.75 + Math.sin(dt * 1.2) * 0.25;
      rim.style.opacity = (0.6 + glow * 0.5).toFixed(2);
      requestAnimationFrame(rimPulse);
    })(t0);
  }
})();