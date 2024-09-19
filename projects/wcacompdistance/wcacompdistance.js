import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

$(document).ready(function() {
    $('.distance-stat').circliful();
});

let scene, camera, renderer, globe, controls, centerPoint;
let points = [];
let lines = [];
let totalDistance = 0;

// Constants
const EARTH_RADIUS = 6371; // Radius of the Earth in kilometers

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
    const wcaId = document.getElementById('wcaIdInput').value;
    if (!wcaId) {
        document.getElementById('errorMessage').style.display = 'block';
        return;
    } else {
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('fetchErrorMessage').style.display = 'none';
    }

    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }

    try {
        const response = await fetch(`https://www.worldcubeassociation.org/api/v0/persons/${wcaId}/competitions`);
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
            lng: parseFloat(comp.longitude_degrees),
            date: new Date(comp.start_date)
        })).filter(loc => !isNaN(loc.lat) && !isNaN(loc.lng) && loc.lat !== 0 && loc.lng !== 0);

        locations.sort((a, b) => a.date - b.date);

        plotPoints(locations);
        calculateTotalDistance(locations);
    } catch (error) {
        console.error('Error fetching competition data:', error);
        document.getElementById('fetchErrorMessage').style.display = 'block';
        if (error.message === 'Invalid WCA ID') {
            document.getElementById('fetchErrorMessage').textContent = 'Invalid WCA ID. Please check and try again.';
        } else {
            document.getElementById('fetchErrorMessage').textContent = 'Error fetching competition data. Please try again.';
        }
    } finally {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
}

/*function plotPoints(locations) {
    locations.forEach((location, index) => {
        const coords = latLngToVector3(location.lat, location.lng);

        const dotGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.copy(coords);
        scene.add(dot);

        if (index > 0) {
            const previousCoords = latLngToVector3(locations[index - 1].lat, locations[index - 1].lng);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
            const points = [previousCoords, coords];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
        }
    });
}*/

function plotPoints(locations) {
  locations.forEach((location, index) => {
    const coords = latLngToVector3(location.lat, location.lng);
    
    const pointGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);
    const { x, y, z } = latLngToVector3(location.lat, location.lng);
    point.position.set(x, y, z);
    scene.add(point);
    points.push(point);

    if (index > 0) {
      const previousCoords = latLngToVector3(locations[index - 1].lat, locations[index - 1].lng);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
      const points = [previousCoords, coords];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
    }
  });
}

function calculateTotalDistance(locations) {
    totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
        const previousCoords = latLngToVector3(locations[i - 1].lat, locations[i - 1].lng);
        const currentCoords = latLngToVector3(locations[i].lat, locations[i].lng);
        const distance = previousCoords.distanceTo(currentCoords) * 6371; // Multiply by Earth's radius in km
        totalDistance += distance;
    }
    updateDistanceStats(totalDistance);
}

function updateDistanceStats(distance) {
    const distanceStatElement = document.getElementById('distance-stat');
    distanceStatElement.setAttribute('data-text', `${distance.toFixed(2)} km`);
    distanceStatElement.setAttribute('data-percent', Math.min(distance / 40000 * 100, 100));
    $('.distance-stat').circliful();
    document.querySelector('.stat-wrapper').style.display = 'block';
}

function clearCompetitions() {
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    scene.add(globe);
    totalDistance = 0;
    document.querySelector('.stat-wrapper').style.display = 'none';
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

document.getElementById('addCompetitionsBtn').addEventListener('click', addCompetitions);
document.getElementById('clearCompetitionsBtn').addEventListener('click', clearCompetitions);

$(document).ready(function() {
    $('.distance-stat').circliful();
});
