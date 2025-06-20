// Get canvas and context
const canvas = document.getElementById('mnist-canvas');
const ctx = canvas.getContext('2d');

// Set initial background to black (MNIST style)
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Draw settings
ctx.lineWidth = 1;
ctx.strokeStyle = 'white';

let drawing = false;

// Mouse listeners for drawing
canvas.addEventListener('mousedown', e => { drawing = true; draw(e); });
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);
canvas.addEventListener('mousemove', draw);

// Get cursor position on the canvas
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: Math.floor((e.clientX - rect.left) * scaleX),
    y: Math.floor((e.clientY - rect.top) * scaleY)
  };
}

// Draw a 1x1 white pixel at the cursor
let lastPos = null;

function draw(e) {
  if (!drawing) return;
  const pos = getPos(e);

  if (lastPos) {
    const dx = pos.x - lastPos.x;
    const dy = pos.y - lastPos.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    for (let i = 0; i <= steps; i++) {
      const x = lastPos.x + (dx * i) / steps;
      const y = lastPos.y + (dy * i) / steps;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 2);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  lastPos = pos;
}

canvas.addEventListener('mouseup', () => {
  drawing = false;
  lastPos = null;
});
canvas.addEventListener('mouseout', () => {
  drawing = false;
  lastPos = null;
});

// Clear canvas function (linked to button)
function clearCanvas() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}


// ---------------------------------------------------------------------- //
function predictImage() {
  const imageData = ctx.getImageData(0, 0, 28, 28);
  const data = imageData.data;

  const grayscale = [];
  for (let i = 0; i < data.length; i += 4) {
    grayscale.push((data[i] / 255).toFixed(2));
  }

  // Build LaTeX \bmatrix string
  let latex = '\\[\\begin{bmatrix}\n';
  for (let i = 0; i < 28; i++) {
    const row = [];
    for (let j = 0; j < 28; j++) {
      const val = grayscale[i * 28 + j];
      let display = parseFloat(val).toString();
        if (display.length < 4) {
        display += '\\phantom{0}'.repeat(4 - display.length);
        }

        row.push(display);
    }
    latex += row.join(' & ') + (i < 27 ? ' \\\\\n' : '\n');
  }
  latex += '\\end{bmatrix}\\]';

  // Insert into preview div
  const container = document.getElementById('latex-matrix');
  container.innerHTML = latex;

  // Trigger MathJax rendering
  if (window.MathJax) {
    MathJax.typesetPromise();
  }

}


function toggleMatrixVisibility() {
  const checkbox = document.getElementById('toggleMatrix');
  const wrapper = document.getElementById('matrix-wrapper');

  if (checkbox.checked) {
    wrapper.classList.remove('d-none');
  } else {
    wrapper.classList.add('d-none');
  }
}

// Make sure checkbox state controls visibility on load
window.addEventListener('DOMContentLoaded', toggleMatrixVisibility);




