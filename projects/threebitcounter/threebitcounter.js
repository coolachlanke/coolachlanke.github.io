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

// Smooth-scroll for back-to-top
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
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


// Highlight the current TOC link on scroll
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('main section[id]');
  let currentId = '';

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= 100 && rect.bottom > 100) {
      currentId = sec.id;
    }
  });

  document.querySelectorAll('.toc-list .list-group-item-action').forEach(link => {
    const hrefId = link.getAttribute('href').substring(1);
    if (hrefId === currentId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

// Toggle PCB view - copper pours on or off
let currentPcbView = 0; // 0: on, 1: off, 2: 3D

  function cyclePcbView() {
    const views = [
      document.getElementById("pcb-2d-render"),
      document.getElementById("pcb-copper-off"),
      document.getElementById("pcb-copper-on")
    ];

    const labels = [
      "Show Copper Pour: OFF",
      "Show Copper Pour: ON",
      "Show 2D Render"
    ];

    // Hide all
    views.forEach(view => view.style.display = "none");

    // Show current
    currentPcbView = (currentPcbView + 1) % views.length;
    views[currentPcbView].style.display = "block";

    // Update button label
    document.getElementById("pcbToggleBtn").textContent = labels[currentPcbView];
  }
