import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

$(document).ready(function() {
    $('#distance-stat').circliful();
});
$(document).ready(function() {
    $('#distanceper-stat').circliful();
});

// Constants
const EARTH_RADIUS = 6371; // Radius of the Earth in kilometers
const COLORS = [0x00ff00, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500, 0x800080]; // Array of colors for centroids

let scene, camera, renderer, globe, controls, centerPoint, line;
let points = []; // Store the points for dynamic size adjustment
let centroids = []; // Store the mean points
let lines = []; // Store the lines
let centroidIndex = 0; // Index to cycle through colors

init();
animate();

function init() {
    // Create a scene
    scene = new THREE.Scene();
  
    // Set up a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2;
  
    // Set up a renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff); // Set the background color to white
    document.getElementById('container').appendChild(renderer.domElement);
  
    // Load Earth texture and create globe with inverted colors
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = ''; // Enable cross-origin requests
    loader.load('../../images/earthmapbw_10k.jpg', (texture) => {
      const geometry = new THREE.SphereGeometry(1, 64, 64);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          texture1: { type: 't', value: texture },
          opacity: { value: 0.5 } // Set the opacity value
        },
        vertexShader: `
          varying vec2 vUV;
          void main() {
            vUV = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D texture1;
          uniform float opacity;
          varying vec2 vUV;
          void main() {
            vec4 color = texture2D(texture1, vUV);
            gl_FragColor = vec4(1.0 - color.rgb, opacity);
          }
        `,
        transparent: true // Enable transparency
      });
      globe = new THREE.Mesh(geometry, material);
      scene.add(globe);
    });
  
    // Add the center point of the Earth
    const centerPointGeometry = new THREE.SphereGeometry(0.02, 16, 16);
    const centerPointMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    centerPoint = new THREE.Mesh(centerPointGeometry, centerPointMaterial);
    centerPoint.position.set(0, 0, 0);
    scene.add(centerPoint);
  
    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
  
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5).normalize();
    scene.add(directionalLight);
  
    // Add orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;  // Disable panning
    controls.enableZoom = true;  // Enable zooming
    controls.minDistance = 1;    // Minimum distance for zoom
    controls.maxDistance = 10;   // Maximum distance for zoom
    controls.zoomSpeed = 0.3;    // Adjust this value to control zoom sensitivity
  
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
  
    // Add event listener for Enter key
    document.getElementById('wcaIdInput').addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        addCompetitions();
      }
    });
  }
  

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  adjustPointSizes();
  renderer.render(scene, camera);
}

function adjustPointSizes() {
  const distanceFactor = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
  points.forEach(point => {
    const scale = 0.25 * (distanceFactor - 1); // Adjust this value to make the points larger
    point.scale.set(scale, scale, scale);
  });
}

window.addCompetitions = async function() {  // Expose the function to the global scope
    const wca_id = document.getElementById('wcaIdInput').value;
    if (!wca_id) {
      document.getElementById('errorMessage').style.display = 'block';
      return;
    } else {
      document.getElementById('errorMessage').style.display = 'none';
      document.getElementById('fetchErrorMessage').style.display = 'none';
    }
  
    document.getElementById('loadingIndicator').style.display = 'flex';
  
    try {
      const response = await fetch(`https://www.worldcubeassociation.org/api/v0/persons/${wca_id}/competitions`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Invalid WCA ID');
        } else {
          throw new Error('Error fetching competition data');
        }
      }
      const competitions = await response.json();
  
      const locations = competitions.map(comp => ({
        lat: parseFloat(comp.latitude_degrees),
        lng: parseFloat(comp.longitude_degrees)
      })).filter(loc => !isNaN(loc.lat) && !isNaN(loc.lng) && loc.lat !== 0 && loc.lng !== 0);
  
      plotPoints(locations);
      plotMeanPoint(locations);
    } catch (error) {
      console.error('Error fetching competition data:', error);
      document.getElementById('fetchErrorMessage').style.display = 'block';
      if (error.message === 'Invalid WCA ID') {
        document.getElementById('fetchErrorMessage').textContent = 'Invalid WCA ID. Please check and try again.';
      } else {
        document.getElementById('fetchErrorMessage').textContent = 'Error fetching competition data. Please try again.';
      }
    } finally {
      document.getElementById('loadingIndicator').style.display = 'none';
    }
  }
  

window.clearCompetitions = function() {  // Expose the function to the global scope
    clearPoints(); // Clear existing points
    centroids.forEach(centroid => scene.remove(centroid));
    centroids = [];
    lines.forEach(line => scene.remove(line));
    lines = [];
    centroidIndex = 0; // Reset the color index
  }

function clearPoints() {
  // Clear existing points from the globe
  points.forEach(point => scene.remove(point));
  points = [];
}

function plotPoints(locations) {
  locations.forEach(location => {
    const pointGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);
    const { x, y, z } = latLngToVector3(location.lat, location.lng);
    point.position.set(x, y, z);
    scene.add(point);
    points.push(point);
  });
}

function latLngToVector3(lat, lng) {
    // Convert lat/lon to phi/theta
    const phi = ((90 - lat) * Math.PI) / 180; // Azimuthal angle
    const theta = (lng * Math.PI) / 180; // Polar angle

    // Spherical --> Cartesian
    const x = Math.sin(phi) * Math.cos(theta);
    const z = -(Math.sin(phi) * Math.sin(theta));
    const y = Math.cos(phi);
    return { x, y, z };
}

function plotMeanPoint(locations) {
  showStats(); // Show stats when plotting competitions
  const mean = computeCentroid(locations);

  // Cycle through the colors array
  const color = COLORS[centroidIndex % COLORS.length];
  centroidIndex++;

  // Add centroid point to the scene
  const meanPointGeometry = new THREE.SphereGeometry(0.02, 16, 16);
  const meanPointMaterial = new THREE.MeshBasicMaterial({ color: color });
  const meanPoint = new THREE.Mesh(meanPointGeometry, meanPointMaterial);
  meanPoint.position.set(mean.x, mean.y, mean.z);
  scene.add(meanPoint);
  centroids.push(meanPoint);

  // Draw a line from the center to the mean point
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff }); // Magenta color
  const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(mean.x, mean.y, mean.z)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const newLine = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(newLine);
  lines.push(newLine);

  // Calculate and display the distance from the centroid to the center
  const normalizedDistance = Math.sqrt(mean.x * mean.x + mean.y * mean.y + mean.z * mean.z);
  const distance = normalizedDistance * EARTH_RADIUS;

  // Update the distance stat animation
  // Clear previous instance if any
  $('#distance-stat').empty();
  $('#distanceper-stat').empty();
  $('#distance-stat').data('text', `${distance.toFixed(0)}km`);
  $('#distanceper-stat').data('text', `${normalizedDistance.toFixed(3)}`);
  $('#distanceper-stat').data('percent', 100 * normalizedDistance.toFixed(2));
  $('#distance-stat').data('percent', 100 * normalizedDistance.toFixed(2));
  $('#distance-stat').circliful();
  $('#distanceper-stat').circliful();
  /*document.getElementById('distanceDisplay').innerText = `Distance to Center: ${(distance * EARTH_RADIUS).toFixed(4)}km (${distance.toFixed(2)}re)`;
  console.log(`Distance from center: ${(distance * EARTH_RADIUS).toFixed(4)}`);*/
  /*document.getElementById('distanceDisplay').innerHTML = `Distance to Center: \\({${distance.toFixed(0)}}\\)km \\(\\left({${normalizedDistance.toFixed(3)}}{r_e}\\right) \\)`;
  MathJax.typeset(); // Render the LaTeX*/
}

// Function to show stats
function showStats() {
    document.querySelector('.stat-wrapper').style.display = 'block';
    document.querySelector('.stat-wrapper2').style.display = 'block';
}

// Function to hide stats
function hideStats() {
    document.querySelector('.stat-wrapper').style.display = 'none';
    document.querySelector('.stat-wrapper2').style.display = 'none';
}

// Add event listener to clear button to hide stats
document.getElementById('clearCompetitionsBtn').addEventListener('click', function() {
    hideStats();
});

function computeCentroid(locations) {
  let x = 0, y = 0, z = 0;

  locations.forEach(location => {
    const coords = latLngToVector3(location.lat, location.lng);

    x += coords.x;
    y += coords.y;
    z += coords.z;
  });

  const total = locations.length;

  x /= total;
  y /= total;
  z /= total;

  return { x: x, y: y, z: z };
}