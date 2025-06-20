// -----------------------------------  USER INPUT CANVAS ----------------------------------- //
const canvas = document.getElementById('mnist-canvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.lineWidth = 1;
ctx.strokeStyle = 'white';

let drawing = false;

canvas.addEventListener('mousedown', e => { drawing = true; draw(e); });
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);
canvas.addEventListener('mousemove', draw);

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: Math.floor((e.clientX - rect.left) * scaleX),
    y: Math.floor((e.clientY - rect.top) * scaleY)
  };
}

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

function clearCanvas() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function toggleMatrixVisibility() {
  const checkbox = document.getElementById('toggleMatrix');
  const wrapper = document.getElementById('matrix-wrapper');

  if (checkbox.checked) {
    wrapper.style.display = 'flex';
  } else {
    wrapper.style.display = 'none';
  }
}

function renderMatrixFromGrayscale(grayscale) {
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

  const container = document.getElementById('latex-matrix');
  container.innerHTML = latex;

  const checkbox = document.getElementById('toggleMatrix');
  if (!checkbox.checked) {
    checkbox.checked = true;
  }

  if (window.MathJax) {
    MathJax.typesetPromise().then(() => {
      toggleMatrixVisibility();
    });
  } else {
    toggleMatrixVisibility();
  }
}

async function predictImage() {
    if (!pyodide) {
        alert("Model not loaded yet. Please wait...");
        return;
    }

  const imageData = ctx.getImageData(0, 0, 28, 28);
  const data = imageData.data;

  const grayscale = [];
  for (let i = 0; i < data.length; i += 4) {
    grayscale.push((data[i] / 255).toPrecision(8)); // normalize pixel value to [0, 1]
  }
  renderMatrixFromGrayscale(grayscale);

  const pyInput = grayscale.join(", ");

  // Python code from the predict.py script via Pyodide
  const pythonCode = `
input_image = np.array([${pyInput}], dtype=np.float32).reshape((784, 1))
z1 = forward_prop(input_image, W_1, b_1)
a1 = sigmoid(z1)
z2 = forward_prop(a1, W_2, b_2)
y_hat = softmax(z2)
int(np.argmax(y_hat))
`;

  const prediction = await pyodide.runPythonAsync(pythonCode);

  alert("Predicted digit: " + prediction);
}


window.addEventListener('DOMContentLoaded', () => {
  toggleMatrixVisibility();
});


// -----------------------------------  NEURAL NET FORWARD PROP ----------------------------------- //
let pyodide;

async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
  await pyodide.loadPackage("numpy");
}

async function setupPyodideModel() {
  if (!pyodide) {
    await loadPyodideAndPackages();
  }

  // Fetch and mount model_parameters.npz
  const modelBinary = await fetch("assets/model_parameters.npz").then(res => res.arrayBuffer());
  pyodide.FS.writeFile("model_parameters.npz", new Uint8Array(modelBinary));

  // Fetch and run predict.py to load definitions
  const predictPy = await fetch("assets/predict.py").then(res => res.text());
  pyodide.runPython(predictPy);
}

// Call this once after page load
setupPyodideModel();





