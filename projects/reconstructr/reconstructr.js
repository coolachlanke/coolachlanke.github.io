// Imports

// Import Three.js core (resolved via Import Map)
import * as THREE from 'https://unpkg.com/three@0.148.0/build/three.module.js';

// Import OrbitControls from the ES6 module path
import { OrbitControls } from 'https://unpkg.com/three@0.148.0/examples/jsm/controls/OrbitControls.js';


let player;
let cubeSize = 1;  // Size of each cubelet
let expansion = 0.01;  // Spacing between cubelets
let currentMove = '';

// Function to load the video
document.getElementById('load-video').addEventListener('click', function() {
    const url = document.getElementById('video-url').value;
    if (url) {
        loadVideo(url);
    } else {
        alert('Please enter a video URL.');
    }
});

function loadVideo(url) {
    const videoId = extractVideoID(url);
    console.log('got hre 1');
    if (videoId) {
        // Create or update the YouTube player
        if (!player) {
            player = new YT.Player('video-player', {
                height: '56.25%',  // Ensures the player scales correctly
                width: '100%',   // Ensures the player scales correctly
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'controls': 0,          // Hide YouTube player controls
                    'rel': 0,               // Disable related videos at the end
                    'modestbranding': 1,     // Minimize YouTube logo
                    'iv_load_policy': 3,     // Hide video annotations
                    'fs': 0,                // Disable fullscreen button
                    'disablekb': 1,          // Disable keyboard controls
                    'cc_load_policy': 0,     // Disable closed captions
                    'autohide': 1,            // Automatically hide the controls
                    'mute': 1
                },
                events: {
                    'onReady': onPlayerReady
                }
            });
        } else {
            player.loadVideoById(videoId);  // Load a new video if the player already exists
        }
    } else {
        alert('Invalid YouTube URL.');
    }
}

function extractVideoID(url) {
    let videoId = null;
    console.log('got hre 2');
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (e) {
        console.error('Invalid URL');
    }
    console.log(videoId);
    return videoId;
}

/*function onPlayerReady(event) {
    console.log('YouTube Player is ready.');
}*/





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let isDragging = false;
let timelineWidth, timelineStart, videoDuration;

// Initialize timeline and playhead
const playhead = document.getElementById('playhead');
const timeline = document.getElementById('timeline');
const currentTimeDisplay = document.getElementById('current-time');

// Function to update the current time display
function updateCurrentTime() {
    const currentTime = player.getCurrentTime();
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
    currentTimeDisplay.textContent = `${minutes}:${seconds}`;

    // Move the playhead based on current video time
    const playheadPosition = (currentTime / videoDuration) * timelineWidth;
    playhead.style.left = `${playheadPosition}px`;
}

// Timeline click event to set video time
timeline.addEventListener('click', function (e) {
    const timelineOffset = timeline.getBoundingClientRect().left;
    const clickPosition = e.pageX - timelineOffset;
    const newTime = (clickPosition / timelineWidth) * videoDuration;

    player.seekTo(newTime, true);
    updateCurrentTime();
});

// Handle playhead dragging
playhead.addEventListener('mousedown', function () {
    isDragging = true;
});

document.addEventListener('mouseup', function () {
    isDragging = false;
});

document.addEventListener('mousemove', function (e) {
    if (isDragging) {
        const timelineOffset = timeline.getBoundingClientRect().left;
        const dragPosition = Math.min(Math.max(e.pageX - timelineOffset, 0), timelineWidth);
        const newTime = (dragPosition / timelineWidth) * videoDuration;

        playhead.style.left = `${dragPosition}px`;
        player.seekTo(newTime, true);
        updateCurrentTime();
    }
});

// Update timeline and video duration on player ready
function onPlayerReady(event) {
    videoDuration = player.getDuration();
    timelineWidth = timeline.offsetWidth;

    // Mute the video
    player.mute();

    // Start updating the current time display
    setInterval(updateCurrentTime, 100);
}


// Zoom controls for timeline
document.getElementById('zoom-in').addEventListener('click', function () {
    timelineWidth += 100;
    timeline.style.width = `${timelineWidth}px`;
});

document.getElementById('zoom-out').addEventListener('click', function () {
    timelineWidth = Math.max(300, timelineWidth - 100);  // Prevent shrinking too much
    timeline.style.width = `${timelineWidth}px`;
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





let isPlaying = false;

document.getElementById('play-pause').addEventListener('click', function() {
    if (isPlaying) {
        player.pauseVideo();
        this.textContent = 'Play';
    } else {
        player.playVideo();
        this.textContent = 'Pause';
    }
    isPlaying = !isPlaying;
});

document.getElementById('start').addEventListener('click', function() {
    player.seekTo(0, true);  // Go to start of the video
    player.pauseVideo();  // Pause the video
});

document.getElementById('end').addEventListener('click', function() {
    const duration = player.getDuration();
    player.seekTo(duration, true);  // Go to end of the video
    player.pauseVideo();  // Pause the video
});

document.getElementById('jump-forward').addEventListener('click', function() {
    const currentTime = player.getCurrentTime();
    const frameDuration = 1 / 30;  // Assuming 30 frames per second
    player.seekTo(currentTime + frameDuration * 10, true);  // Jump forward by 10 frames
});

document.getElementById('jump-back').addEventListener('click', function() {
    const currentTime = player.getCurrentTime();
    const frameDuration = 1 / 30;  // Assuming 30 frames per second
    player.seekTo(currentTime - frameDuration * 10, true);  // Jump backward by 10 frames
});

let playbackRate = 1;

document.getElementById('increase-speed').addEventListener('click', function() {
    playbackRate += 0.25;
    if (playbackRate > 2) playbackRate = 2;
    player.setPlaybackRate(playbackRate);
});

document.getElementById('decrease-speed').addEventListener('click', function() {
    playbackRate -= 0.25;
    if (playbackRate < 0.25) playbackRate = 0.25;
    player.setPlaybackRate(playbackRate);
});

document.getElementById('reset-speed').addEventListener('click', function() {
    playbackRate = 1;
    player.setPlaybackRate(playbackRate);
});

document.getElementById('go-to-timestamp').addEventListener('click', function() {
    const timestamp = document.getElementById('timestamp-input').value;
    const parts = timestamp.split(':');
    let seconds = 0;

    if (parts.length === 2) {
        seconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    } else if (parts.length === 1) {
        seconds = parseInt(parts[0], 10);
    }

    player.seekTo(seconds, true);  // Jump to the specific timestamp
    player.pauseVideo();  // Pause the video
});

// Implement frame stepping
document.getElementById('prev-frame').addEventListener('click', function() {
    stepFrame(-1);
});

document.getElementById('next-frame').addEventListener('click', function() {
    stepFrame(1);
});

function stepFrame(direction) {
    if (player && player.getPlayerState() !== -1) { // Check if the video is loaded
        const currentTime = player.getCurrentTime();
        const frameDuration = 1 / 30; // Assuming 30 frames per second
        const newTime = currentTime + direction * frameDuration;

        player.seekTo(newTime, true); // Seek to the new time
        player.pauseVideo();          // Pause the video after seeking
    }
}

document.getElementById('apply-scramble').addEventListener('click', function() {
    const scramble = document.getElementById('scramble-input').value.trim();
    if (scramble) {
        // Parse the scramble and apply it to the cube
        parseAndExecuteMoves(scramble);
    } else {
        alert('Please enter a valid scramble.');
    }
});


// Update cube based on move input
const solutionInput = document.getElementById('solution-input');

solutionInput.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        // Prevent default space behavior (e.g., adding a space character)
        event.preventDefault();

        const fullText = this.value;

        const caretPosition = this.selectionStart;

        // Get the text up to the caret position
        const textUpToCaret = fullText.substring(0, caretPosition);

        // Split the text into moves using spaces
        const moves = textUpToCaret.trim().split(/\s+/);

        // Get the last move entered
        const lastMove = moves[moves.length - 1];

        if (lastMove) {
            parseAndExecuteMoves(lastMove);
        }

        // Optionally, add a space character at the caret position
        // and move the cursor position forward
        const textAfterCaret = fullText.substring(caretPosition);
        this.value = textUpToCaret + ' ' + textAfterCaret;
        this.selectionStart = this.selectionEnd = caretPosition + 1;
    }
});


// Animate moves on three.js cube
document.getElementById('execute-moves').addEventListener('click', function() {
    const moves = document.getElementById('move-input').value;
    parseAndExecuteMoves(moves);
});

// Reset the three.js cube
document.getElementById('reset-cube').addEventListener('click', function() {
    resetCube();
});

function resetCube() {
    // Remove the existing cube group
    scene.remove(cubeGroup);

    // Recreate the cube
    createRubiksCube(faceMaterials);
}

// YouTube IFrame API requires this function to be globally accessible
function onYouTubeIframeAPIReady() {
    console.log('YouTube IFrame API is ready.');
}


// Three.js variables
let scene, camera, renderer;
let cubeGroup; // Group containing all cube pieces (cubelets)
let cubeInitialized = false;

// Define face colors
const colors = {
    U: 0xffffff, // White
    D: 0xffff00, // Yellow
    F: 0x00ff00, // Green
    B: 0x0000ff, // Blue
    R: 0xff0000, // Red
    L: 0xffa500, // Orange
    blank: 0x000000 // Black
};

// Define materials for each face
const faceMaterials = {
    U: new THREE.MeshBasicMaterial({ color: colors.U }),
    D: new THREE.MeshBasicMaterial({ color: colors.D }),
    F: new THREE.MeshBasicMaterial({ color: colors.F }),
    B: new THREE.MeshBasicMaterial({ color: colors.B }),
    R: new THREE.MeshBasicMaterial({ color: colors.R }),
    L: new THREE.MeshBasicMaterial({ color: colors.L }),
    blank: new THREE.MeshBasicMaterial({ color: colors.blank })
};

window.onload = function() {
    initializeCube();
};

function initializeCube() {
    // Create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    // Set up the camera
    const width = document.getElementById('cube-visualization').clientWidth;
    const height = document.getElementById('cube-visualization').clientHeight;
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(scene.position);

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    document.getElementById('cube-visualization').appendChild(renderer.domElement);

    // Add orbit controls (optional for interactivity)
    const controls = new OrbitControls(camera, renderer.domElement);

    // Disable zoom
    controls.enableZoom = false;

    // Create the Rubik's Cube
    createRubiksCube(faceMaterials);

    // Start the animation loop
    animate();

    cubeInitialized = true;
}


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}


function createRubiksCube(faceMaterials) {
    cubeGroup = new THREE.Group();

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                // Don't create the center cube
                if (x === 0 && y === 0 && z === 0) {continue;};

                const cubelet = createCubelet(x, y, z, cubeSize, faceMaterials);
                cubeGroup.add(cubelet);
            }
        }
    }

    scene.add(cubeGroup);
    console.log('Rubik\'s Cube created.');
}


function createCubelet(x, y, z, cubeSize, faceMaterials) {
    // Create BoxGeometry
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    // Assign materials to each face based on position
    const rightMaterial = (x === 1) ? faceMaterials.R : faceMaterials.blank;
    const leftMaterial = (x === -1) ? faceMaterials.L : faceMaterials.blank;
    const topMaterial = (y === 1) ? faceMaterials.U : faceMaterials.blank;
    const bottomMaterial = (y === -1) ? faceMaterials.D : faceMaterials.blank;
    const frontMaterial = (z === 1) ? faceMaterials.F : faceMaterials.blank;
    const backMaterial = (z === -1) ? faceMaterials.B : faceMaterials.blank;

    // Assign materials in the order: Right, Left, Top, Bottom, Front, Back
    const materials = [rightMaterial, leftMaterial, topMaterial, bottomMaterial, frontMaterial, backMaterial];

    // Create the mesh with the assigned materials
    const cubelet = new THREE.Mesh(geometry, materials);

    // Position the cubelet with expansion spacing
    cubelet.position.set(
        x * (cubeSize + expansion),
        y * (cubeSize + expansion),
        z * (cubeSize + expansion)
    );

    // Optional: Store userData for position tracking
    cubelet.userData = { x, y, z };

    return cubelet;
}


let isRotating = false;
let moveQueue = [];

function rotateFace(face, direction, rotationAmount, onComplete) {
    if (isRotating) {
        moveQueue.push({ face, direction, rotationAmount, onComplete });
        return;
    }

    isRotating = true;

    // Determine which cubelets to rotate and the rotation axis
    let cubeletsToRotate = [];
    let axis = new THREE.Vector3();
    
    switch (face) {
        case 'U':
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.y) === 1);
            axis.set(0, 1, 0);
            break;
        case 'D':
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.y) === -1);
            axis.set(0, -1, 0);
            break;
        case 'F':
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.z) === 1);
            axis.set(0, 0, 1);
            break;
        case 'B':
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.z) === -1);
            axis.set(0, 0, -1);
            break;
        case 'R':
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.x) === 1);
            axis.set(1, 0, 0);
            break;
        case 'L':
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.x) === -1);
            axis.set(-1, 0, 0);
            break;
        
        // Slice Moves
        case 'M':  // Middle slice between R and L (same direction as L)
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.x) === 0);
            axis.set(-1, 0, 0);  // Same direction as L
            break;
        case 'S':  // Middle slice between F and B (same direction as F)
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.z) === 0);
            axis.set(0, 0, 1);  // Same direction as F
            break;
        case 'E':  // Middle slice between U and D (same direction as D)
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.y) === 0);
            axis.set(0, -1, 0);  // Same direction as D
            break;

        // Wide Moves (two layers: face + adjacent slice)
        case 'r':  // Right wide move (rotate R face and adjacent slice)
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.x) === 1 || Math.round(c.userData.x) === 0);
            axis.set(1, 0, 0);
            break;
        case 'l':  // Left wide move (rotate L face and adjacent slice)
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.x) === -1 || Math.round(c.userData.x) === 0);
            axis.set(-1, 0, 0);
            break;
        case 'u':  // Up wide move (rotate U face and adjacent slice)
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.y) === 1 || Math.round(c.userData.y) === 0);
            axis.set(0, 1, 0);
            break;
        case 'd':  // Down wide move (rotate D face and adjacent slice)
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.y) === -1 || Math.round(c.userData.y) === 0);
            axis.set(0, -1, 0);
            break;
        case 'f':  // Front wide move (rotate F face and adjacent slice)
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.z) === 1 || Math.round(c.userData.z) === 0);
            axis.set(0, 0, 1);
            break;
        case 'b':  // Back wide move (rotate B face and adjacent slice)
            cubeletsToRotate = cubeGroup.children.filter(c => Math.round(c.userData.z) === -1 || Math.round(c.userData.z) === 0);
            axis.set(0, 0, -1);
            break;

        default:
            console.warn(`Invalid face or move: ${face}`);
            isRotating = false;
            if (onComplete) onComplete();
            return;
    }

    let angle = 0;
    const targetAngle = (Math.PI / 2) * rotationAmount * direction;  // Modify based on rotationAmount
    const rotationSpeed = (Math.PI / 2) / 20;  // Adjust for desired speed

    function rotate() {
        const delta = Math.min(rotationSpeed, Math.abs(targetAngle - angle));
        const deltaAngle = delta * Math.sign(targetAngle);
        angle += deltaAngle;

        cubeletsToRotate.forEach(cubelet => {
            rotateAroundWorldAxis(cubelet, axis, deltaAngle);
        });

        if (Math.abs(angle - targetAngle) < 0.0001) {
            // Correct for floating-point errors and snap to 90-degree increments
            cubeletsToRotate.forEach(cubelet => {
                cubelet.rotation.x = Math.round(cubelet.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
                cubelet.rotation.y = Math.round(cubelet.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
                cubelet.rotation.z = Math.round(cubelet.rotation.z / (Math.PI / 2)) * (Math.PI / 2);

                cubelet.position.x = Math.round(cubelet.position.x / (cubeSize + expansion)) * (cubeSize + expansion);
                cubelet.position.y = Math.round(cubelet.position.y / (cubeSize + expansion)) * (cubeSize + expansion);
                cubelet.position.z = Math.round(cubelet.position.z / (cubeSize + expansion)) * (cubeSize + expansion);

                cubelet.userData.x = Math.round(cubelet.position.x / (cubeSize + expansion));
                cubelet.userData.y = Math.round(cubelet.position.y / (cubeSize + expansion));
                cubelet.userData.z = Math.round(cubelet.position.z / (cubeSize + expansion));
            });

            isRotating = false;
            if (onComplete) onComplete();

            // Process the next move in the queue
            if (moveQueue.length > 0) {
                const nextMove = moveQueue.shift();
                rotateFace(nextMove.face, nextMove.direction, nextMove.rotationAmount, nextMove.onComplete);
            }
            return;
        }
        requestAnimationFrame(rotate);
    }
    rotate();
}


function rotateCube(axis, direction, rotationAmount, onComplete) {
    if (isRotating) {
        moveQueue.push({ axis, direction, rotationAmount, onComplete });
        return;
    }

    isRotating = true;

    // Set up rotation axis (x, y, z) for full cube rotation
    let rotationAxis = new THREE.Vector3();

    switch (axis) {
        case 'x':
            rotationAxis.set(1, 0, 0);  // X-axis rotation
            break;
        case 'y':
            rotationAxis.set(0, 1, 0);  // Y-axis rotation
            break;
        case 'z':
            rotationAxis.set(0, 0, 1);  // Z-axis rotation
            break;
        default:
            console.warn(`Invalid axis: ${axis}`);
            isRotating = false;
            if (onComplete) onComplete();
            return;
    }

    let angle = 0;
    const targetAngle = (Math.PI / 2) * rotationAmount * direction;  // Modify based on rotationAmount (90° or 180°)
    const rotationSpeed = (Math.PI / 2) / 20;  // Adjust speed if necessary

    function rotate() {
        const delta = Math.min(rotationSpeed, Math.abs(targetAngle - angle));
        const deltaAngle = delta * Math.sign(targetAngle);
        angle += deltaAngle;

        // Apply rotation to the entire cube
        cubeGroup.rotation[axis] += deltaAngle;

        if (Math.abs(angle - targetAngle) < 0.0001) {
            // Snap rotation to a multiple of 90 degrees
            cubeGroup.rotation[axis] = Math.round(cubeGroup.rotation[axis] / (Math.PI / 2)) * (Math.PI / 2);

            isRotating = false;
            if (onComplete) onComplete();

            // Process the next move in the queue
            if (moveQueue.length > 0) {
                const nextMove = moveQueue.shift();
                if (nextMove.axis) {
                    rotateCube(nextMove.axis, nextMove.direction, nextMove.rotationAmount, nextMove.onComplete);
                } else {
                    rotateFace(nextMove.face, nextMove.direction, nextMove.rotationAmount, nextMove.onComplete);
                }
            }
            return;
        }
        requestAnimationFrame(rotate);
    }
    rotate();
}




function rotateAroundWorldAxis(object, axis, radians) {
    // Create a rotation matrix
    const rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

    // Apply the rotation to the object's position
    object.position.applyMatrix4(rotWorldMatrix);

    // Rotate the object's quaternion
    const quat = new THREE.Quaternion();
    quat.setFromAxisAngle(axis.normalize(), radians);
    object.quaternion.premultiply(quat);
}


function parseAndExecuteMoves(moves) {
    // Handle moves as a string or an array
    const moveList = Array.isArray(moves) ? moves : moves.trim().split(/\s+/);

    moveList.forEach(move => {
        if (!move) return;

        const moveType = move.charAt(0).toLowerCase();  // Either face move, wide move, or slice move
        let direction = 1;
        let rotationAmount = 1;  // Default to 90°

        // Check for prime (counterclockwise) and double moves
        if (move.length > 1) {
            const modifier = move.slice(1);
            if (modifier === "'") {
                direction = -1;  // Counterclockwise
            } else if (modifier === '2') {
                rotationAmount = 2;  // Double move (180°)
            } else {
                console.warn(`Invalid move modifier: ${modifier}`);
                return;
            }
        }

        // Check if the move is a slice move (M, S, E)
        if (['m', 's', 'e'].includes(moveType)) {
            rotateFace(moveType.toUpperCase(), -direction, rotationAmount);
        }
        // Check if it's a wide move (lowercase)
        else if (['r', 'l', 'u', 'd', 'f', 'b'].includes(moveType)) {
            rotateFace(moveType, -direction, rotationAmount);
        }
        // Regular face moves
        else {
            rotateFace(moveType.toUpperCase(), -direction, rotationAmount);
        }
    });
}















