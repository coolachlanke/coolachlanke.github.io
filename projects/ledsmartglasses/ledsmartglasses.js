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
  const btn    = document.getElementById('revealPCB');

  // Wait until the model and its animations are fully loaded
  viewer.addEventListener('load', () => {
    // Pause auto-rotate until after the animation plays
    viewer.autoRotate = false;
    // Make sure the model starts paused on frame 0
    viewer.pause();

    btn.addEventListener('click', async () => {
      // Disable the button so you can't re-click mid-slide
      console.log('▶️ availableAnimations:', viewer.availableAnimations);
      btn.disabled = true;

      // Play only the named CoverSlide clip
      // await viewer.play({
      //   // some older versions use viewer.animationName = 'CoverSlide'; viewer.play();
      //   name: 'CoverSliss',
      //   loop: false
      // });

      // pick your track
      viewer.animationName = 'CoverSlide';
      // disable looping
      viewer.animationLoop = false;
      // start it
      viewer.play();

      // When it finishes, re-enable auto-rotate and the button (if you want)
      viewer.autoRotate = true;
      btn.disabled     = false;
      btn.textContent  = 'Hide PCB Cover'; 
      // If you wanted to let them toggle back:
      // you could also viewer.pause(); viewer.currentTime=0; etc.
    });
  });
});


