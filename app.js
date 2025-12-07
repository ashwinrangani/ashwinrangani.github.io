gsap.registerPlugin(ScrollTrigger);

// Hero title animation
gsap.from(".hero-title", {
  opacity: 0,
  y: 40,
  duration: 1.2,
  ease: "power4.out"
});

gsap.from(".hero-sub", {
  opacity: 0,
  y: 20,
  duration: 1.2,
  delay: 0.3,
  ease: "power3.out"
});

// Background slow movement
gsap.to(".bg-gradient", {
  backgroundPosition: "200% center",
  duration: 20,
  ease: "linear",
  repeat: -1
});

// Section reveal on scroll
gsap.utils.toArray(".section").forEach((sec) => {
  gsap.from(sec, {
    scrollTrigger: {
      trigger: sec,
      start: "top 80%"
    },
    opacity: 0,
    y: 80,
    duration: 1,
    ease: "power3.out"
  });
});

// Magnetic button
document.querySelectorAll(".magnetic").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x / 4, y: y / 4, duration: 0.2 });
  });

  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.3 });
  });
});
