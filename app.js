let scene, camera, renderer;
let buildingModel, arrowModel;
let arrows = [];
let destination = '';
let arrowPositions = [];
let currentPathIndex = 0;

// Path data for each room (predefined)
const pathData = {
  room1: [[0, 0, 0], [1, 0, 0], [2, 0, 0]],
  lab: [[0, 0, 0], [0, 0, 1], [0, 0, 2]],
  library: [[0, 0, 0], [1, 0, 1], [2, 0, 2]]
};

init();

function init() {
  // Create the scene, camera, and renderer
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 3);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('arScene').appendChild(renderer.domElement);

  // Lighting for the 3D scene
  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  scene.add(light);

  // Load the building model
  const loader = new THREE.GLTFLoader();
  loader.load('models/building.glb', function(gltf) {
    buildingModel = gltf.scene;
    scene.add(buildingModel);
  });

  // Load the arrow model for navigation
  loader.load('models/arrow.glb', function(gltf) {
    arrowModel = gltf.scene;
  });

  // UI event handlers
  document.getElementById('startBtn').addEventListener('click', startNavigation);
  document.getElementById('stopBtn').addEventListener('click', stopNavigation);
  document.getElementById('locationSelect').addEventListener('change', (e) => {
    destination = e.target.value;
  });

  // Initialize camera background
  enableCameraBackground();

  // Start the animation loop
  animate();
}

function enableCameraBackground() {
  // Access the user's camera and specify the back camera (facing mode: environment)
  navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } })
    .then((stream) => {
      const video = document.createElement('video');
      video.setAttribute('playsinline', 'true');
      video.muted = true;
      video.autoplay = true;
      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play();

        // Create a video texture and set it as the background of the scene
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;

        scene.background = videoTexture;
      };
    })
    .catch((err) => {
      console.error('Camera access error:', err);
      scene.background = new THREE.Color(0x000000); // Fallback if camera is not accessible
    });
}

function startNavigation() {
  // Clear any existing arrows and start the navigation
  stopNavigation();
  if (!destination || !pathData[destination]) return;

  arrowPositions = pathData[destination];
  currentPathIndex = 0;
  createArrowAtPosition(arrowPositions[currentPathIndex]);
  animateArrows();
}

function createArrowAtPosition(position) {
  // Create an arrow at the given position and add it to the scene
  const arrow = arrowModel.clone();
  arrow.position.set(...position);
  arrows.push(arrow);
  scene.add(arrow);
}

function animateArrows() {
  // Animate arrows along the predefined path
  if (currentPathIndex < arrowPositions.length - 1) {
    currentPathIndex++;
    const nextPos = arrowPositions[currentPathIndex];

    arrows.forEach(arrow => {
      new TWEEN.Tween(arrow.position)
        .to({ x: nextPos[0], y: nextPos[1], z: nextPos[2] }, 1000) // Move arrow to the next position
        .start();
    });

    setTimeout(animateArrows, 1000); // Repeat after 1 second
  }
}

function stopNavigation() {
  // Clear all arrows from the scene
  arrows.forEach(a => scene.remove(a));
  arrows = [];
  currentPathIndex = 0;
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update(); // Update the animations
  renderer.render(scene, camera); // Render the scene with the camera
}
