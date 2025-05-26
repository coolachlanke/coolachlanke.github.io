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

// document.addEventListener('DOMContentLoaded', () => {
//   const viewer = document.getElementById('viewer');
//   const btnOn    = document.getElementById('coverOn');
//   const btn    = document.getElementById('coverOff');

//   // Wait until the model and its animations are fully loaded
//   viewer.addEventListener('load', () => {

//     btn.addEventListener('click', async () => {
//       // Disable the button so you can't re-click mid-slide
//       console.log('▶️ availableAnimations:', viewer.availableAnimations);
//       btn.disabled = true;

//       // pick your track
//       viewer.animationName = 'CoverSlideBack';
//       await viewer.updateComplete;
//       viewer.play({repetitions: 1});

//       // When it finishes, re-enable auto-rotate and the button (if you want)
//       viewer.autoRotate = true;
//       btn.disabled     = false;
//       btn.textContent  = 'Hide PCB Cover'; 
//       // If you wanted to let them toggle back:
//       // you could also viewer.pause(); viewer.currentTime=0; etc.
//     });
//   });
// });

// ledsmartglasses.js
// document.addEventListener('DOMContentLoaded', () => {
//   const viewer = document.getElementById('viewer');
//   const btn    = document.getElementById('toggleCover');
//   let isCoverOn = true;  // initial state

//   viewer.addEventListener('load', () => {
//     // Log what animations actually came through
//     console.log('▶️ availableAnimations:', viewer.availableAnimations);

//     // Initialize button label
//     btn.textContent = 'Cover OFF';

//     btn.addEventListener('click', async () => {
//       // Disable while animating
//       btn.disabled = true;

//       // Choose the right clip
//       const clip = isCoverOn ? 'CoverSlide' : 'CoverSlide';
//       console.log(`▶️ playing ${clip}`);
//       viewer.animationName = clip;
//       await viewer.updateComplete;
//       viewer.play({repetitions: 1});

//       // When that clip finishes, flip state and update UI
//       viewer.addEventListener('finished', function handler() {
//         btn.disabled = false;
//         isCoverOn = !isCoverOn;
//         btn.textContent = isCoverOn ? 'Cover OFF' : 'Cover ON';

//         // Clean up
//         viewer.removeEventListener('finished', handler);
//       }, { once: true });
//     });
//   });
// });

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




