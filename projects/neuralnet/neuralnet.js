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


// MNIST test-set random images
let testImages, testLabels, testImageCount = 0;

async function loadTestSet() {
  const [imgRes, lblRes] = await Promise.all([
    fetch("assets/MNIST_HRD/t10k-images.idx3-ubyte"),
    fetch("assets/MNIST_HRD/t10k-labels.idx1-ubyte")
  ]);

  const imgBuffer = await imgRes.arrayBuffer();
  const lblBuffer = await lblRes.arrayBuffer();

  const imgBytes = new Uint8Array(imgBuffer);
  const lblBytes = new Uint8Array(lblBuffer);

  // Read image count from bytes 4–7
  testImageCount = (imgBytes[4] << 24) | (imgBytes[5] << 16) | (imgBytes[6] << 8) | imgBytes[7];
  testImages = imgBytes.slice(16); // strip header
  testLabels = lblBytes.slice(8);  // strip header
}

function showRandomTestImage() {
  const canvas = document.getElementById("test-example");
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(28, 28);

  const index = Math.floor(Math.random() * testImageCount);
  const offset = index * 28 * 28;

  for (let i = 0; i < 28 * 28; i++) {
    const val = testImages[offset + i];
    imageData.data[i * 4 + 0] = val;
    imageData.data[i * 4 + 1] = val;
    imageData.data[i * 4 + 2] = val;
    imageData.data[i * 4 + 3] = 255; // fully opaque
  }

  ctx.putImageData(imageData, 0, 0);

  document.getElementById("image-label").innerText = "Label: " + testLabels[index];
}

document.getElementById("random-example").addEventListener("click", showRandomTestImage);

window.addEventListener("DOMContentLoaded", async () => {
  await loadTestSet();
  showRandomTestImage();
});

