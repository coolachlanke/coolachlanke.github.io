// /projects/rotatingcubeshelf/rotatingcubeshelf.js

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


const mv = document.getElementById('viewer');
mv.addEventListener('load', () => {
  console.log('▶️ animations:', mv.availableAnimations);
    // should list one or more tracks — you can pick one with mv.animationName = 'YourTrackName'
    // mv.play({repetitions: Infinity}); // it will loop seamlessly every 150 frames
});

// document.addEventListener('DOMContentLoaded', () => {

//   // 1) When the model & animations finish loading…
//   viewer.addEventListener('load', () => {
//     console.log('▶️ availableAnimations:', viewer.availableAnimations);
//     // Ensure we start paused at frame 0 with the cover on
//   });
// });