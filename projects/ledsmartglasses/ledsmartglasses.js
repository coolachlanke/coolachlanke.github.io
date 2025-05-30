// /projects/threebitcounter/threebitcounter.js

// Smooth-scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 70,
        behavior: 'smooth'
      });
    }
  });
});

// Highlight active section in TOC on scroll
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('main section');
  let currentId = '';
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= 80 && rect.bottom > 80) {
      currentId = sec.id;
    }
  });
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.toggle('font-weight-bold', link.getAttribute('href') === `#${currentId}`);
  });
});

// 3D <model-viewer> toggle (PCB isolation)
// ledsmartglasses.js
document.addEventListener('DOMContentLoaded', () => {
  const viewer = document.getElementById('viewer');
  const btn    = document.getElementById('toggleCover');
  let   isOn   = true;  // cover starts ON

  // 1) When the model & animations finish loading…
  viewer.addEventListener('load', () => {
    console.log('▶️ availableAnimations:', viewer.availableAnimations);
    // Ensure we start paused at frame 0 with the cover on
    viewer.pause();
    viewer.currentTime = 0;
    btn.textContent   = 'Cover OFF';
    btn.disabled      = false;
  });

  // 2) Only play things on button-click
  btn.addEventListener('click', async () => {
    btn.disabled = true;

    // pick the right baked clip
    const clip = isOn ? 'WholeUp' : 'WholeDown';
    console.log(`▶️ playing ${clip}`);
    viewer.animationName = clip;
    await viewer.updateComplete;
    viewer.play({repetitions: 1});

    // wait for it to finish
    viewer.addEventListener('finished', function handler() {
      isOn = !isOn;
      btn.textContent = isOn ? 'Cover OFF' : 'Cover ON';
      btn.disabled    = false;
      viewer.removeEventListener('finished', handler);
    }, { once: true });
  });
});






// disrupt, agentic, 