// Global variables
var images = []; // Array to hold the images
var labels = []; // Array to hold the labels
var numImages = 0;

// Function to load the images IDX file
function loadImagesIDXFile(url, callback) {
  fetch(url)
    .then(response => response.arrayBuffer())
    .then(buffer => {
      // Parse the images IDX file
      var data = parseImagesIDXFile(buffer);
      callback(data);
    })
    .catch(error => {
      console.error('Error fetching the images IDX file:', error);
    });
}

// Function to parse the images IDX file
function parseImagesIDXFile(buffer) {
  var dataView = new DataView(buffer);
  var magicNumber = dataView.getUint32(0, false); // Big endian
  var numberOfImages = dataView.getUint32(4, false);
  var numRows = dataView.getUint32(8, false);
  var numCols = dataView.getUint32(12, false);

  console.log('Images Magic Number:', magicNumber);
  console.log('Number of Images:', numberOfImages);
  console.log('Image Size:', numRows + 'x' + numCols);

  var images = [];

  var imageSize = numRows * numCols;
  var offset = 16; // Header size in bytes

  // Limit the number of images to load for performance
  var maxImagesToLoad = 10; // Adjust as needed
  var numImagesToLoad = Math.min(numberOfImages, maxImagesToLoad);

  for (var i = 0; i < numImagesToLoad; i++) {
    var image = new Uint8Array(buffer, offset, imageSize);
    images.push(image);
    offset += imageSize;
  }

  return {
    images: images,
    numRows: numRows,
    numCols: numCols
  };
}

// Function to load the labels IDX file
function loadLabelsIDXFile(url, callback) {
  fetch(url)
    .then(response => response.arrayBuffer())
    .then(buffer => {
      // Parse the labels IDX file
      var data = parseLabelsIDXFile(buffer);
      callback(data);
    })
    .catch(error => {
      console.error('Error fetching the labels IDX file:', error);
    });
}

// Function to parse the labels IDX file
function parseLabelsIDXFile(buffer) {
  var dataView = new DataView(buffer);
  var magicNumber = dataView.getUint32(0, false); // Big endian
  var numberOfItems = dataView.getUint32(4, false);

  console.log('Labels Magic Number:', magicNumber);
  console.log('Number of Labels:', numberOfItems);

  var labels = [];

  var offset = 8; // Header size in bytes

  // Limit the number of labels to load for performance
  var maxLabelsToLoad = 1000; // Adjust as needed
  var numLabelsToLoad = Math.min(numberOfItems, maxLabelsToLoad);

  for (var i = 0; i < numLabelsToLoad; i++) {
    var label = dataView.getUint8(offset);
    labels.push(label);
    offset += 1;
  }

  return labels;
}

// Function to draw image on canvas
function drawImageOnCanvas(imageData) {
  var canvas = document.getElementById('mnist-canvas');
  var ctx = canvas.getContext('2d');

  var numRows = 28; // MNIST images are 28x28
  var numCols = 28;

  // Create an ImageData object
  var imgData = ctx.createImageData(numCols, numRows);

  for (var i = 0; i < imageData.length; i++) {
    var pixel = imageData[i];
    imgData.data[i * 4 + 0] = pixel; // Red
    imgData.data[i * 4 + 1] = pixel; // Green
    imgData.data[i * 4 + 2] = pixel; // Blue
    imgData.data[i * 4 + 3] = 255;   // Alpha
  }

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the image data onto the canvas
  ctx.putImageData(imgData, 0, 0);
}

// Function to display a random image
function displayRandomImage() {
  if (images.length === 0 || labels.length === 0) {
    console.error('Images or labels not loaded yet.');
    return;
  }

  var randomIndex = Math.floor(Math.random() * images.length);
  var image = images[randomIndex];
  var label = labels[randomIndex];

  drawImageOnCanvas(image);

  // Display the label
  var labelElement = document.getElementById('image-label');
  labelElement.textContent = 'Label: ' + label;
}

// Add event listener to 'Random' button
document.getElementById('random-button').addEventListener('click', function() {
  displayRandomImage();
});

// Load the images and labels on page load
window.onload = function() {
  var imagesFileUrl = 'assets/MNIST_HRD/train-images.idx3-ubyte';
  var labelsFileUrl = 'assets/MNIST_HRD/train-labels.idx1-ubyte';

  // Load images
  loadImagesIDXFile(imagesFileUrl, function(data) {
    images = data.images;
    numImages = images.length;
    console.log('Images loaded:', numImages);

    // Load labels
    loadLabelsIDXFile(labelsFileUrl, function(data) {
      labels = data;
      console.log('Labels loaded:', labels.length);

      // Display a random image
      displayRandomImage();
    });
  });
};