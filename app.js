// app.js - GSAP animations + particles + noise
gsap.registerPlugin(ScrollTrigger);

/* -------------------------
   Utility: Split text into chars
   Keeps spaces as &nbsp;
------------------------- */
function splitTextToChars(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const text = el.textContent.trim();
  const chars = text.split("").map(ch => {
    if (ch === " ") return `<span class="char">&nbsp;</span>`;
    // escape special html
    const safe = ch.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<span class="char">${safe}</span>`;
  }).join("");
  el.innerHTML = chars;
}

/* -------------------------
   GSAP: Hero text split animation
------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Split the hero title into chars
  splitTextToChars(".hero-title");

  // small staggered entrance for chars
  gsap.from(".char", {
    opacity: 0,
    y: 30,
    stagger: 0.03,
    duration: 0.9,
    ease: "back.out(1.6)"
  });

  // subtitle and cta
  gsap.from(".hero-sub", { opacity: 0, y: 18, duration: 0.9, delay: 0.12, ease: "power3.out" });
  gsap.from(".cta .btn", { opacity: 0, scale: 0.9, duration: 0.7, delay: 0.28, stagger: 0.08, ease: "back.out(1.2)" });

  // moving gradient (slow loop)
  gsap.to(".bg-gradient", { backgroundPosition: "200% center", duration: 20, ease: "linear", repeat: -1 });

  // Ensure ScrollTrigger is used for sections
  gsap.utils.toArray(".section").forEach((sec) => {
    gsap.fromTo(sec, { opacity: 0, y: 30 }, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: sec,
        start: "top 90%",
        toggleActions: "play none none reverse"
      }
    });
  });

  // Magnetic button interaction
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x / 6, y: y / 6, duration: 0.2, ease: "power2.out" });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: "power3.out" });
    });
  });

  // Smooth internal link scrolling (works for nav and Hire Me)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});

/* -------------------------
   Noise canvas (film grain) - inside hero
------------------------- */
(function noiseCanvas() {
  const canvas = document.getElementById("noise-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);

  // generate noise imageData once and reuse to improve perf
  const noiseData = ctx.createImageData(w, h);
  function regenNoiseData() {
    const imageData = ctx.createImageData(w, h);
    const buffer = new Uint32Array(imageData.data.buffer);
    for (let i = 0; i < buffer.length; i++) {
      // alpha random low for subtle noise
      const alpha = (Math.random() * 40) | 0; // 0..39
      buffer[i] = (alpha << 24) | 0x222222; // subtle dark values
    }
    return imageData;
  }

  let baseNoise = regenNoiseData();

  function draw() {
    // occasionally regenerate some frames to avoid static pattern
    if (Math.random() > 0.98) baseNoise = regenNoiseData();
    ctx.putImageData(baseNoise, 0, 0);
    requestAnimationFrame(draw);
  }

  // When resizing, regenerate and continue
  window.addEventListener("resize", () => {
    baseNoise = regenNoiseData();
  });

  draw();
})();

/* -------------------------
   Particles background (no library)
------------------------- */
(function particlesBackground() {
  const canvas = document.getElementById("particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    // adjust particle count for performance
    initParticles();
  }
  window.addEventListener("resize", debounce(resize, 200));

  // particle settings (scaled by screen width)
  let particleCount;
  let particles = [];

  function calcCount() {
    const area = window.innerWidth * window.innerHeight;
    // base density: ~1 particle per 18k px; clamp
    const base = Math.max(30, Math.min(180, (area / 18000) | 0));
    // reduce for small screens
    return window.innerWidth < 600 ? Math.max(18, (base * 0.5) | 0) : base;
  }

  function initParticles() {
    particleCount = calcCount();
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.35 + 0.06
      });
    }
  }

  initParticles();

  function update() {
    ctx.clearRect(0, 0, w, h);
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // wrap around
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(update);
  }

  update();
})();

/* -------------------------
   Helper: debounce
------------------------- */
function debounce(fn, wait) {
  let t;
  return function () {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, arguments), wait);
  };
}
