let scene, camera, renderer;
let buildingModel, arrowModel;
let arrows = [];
let destination = '';
const pathData = {
  room1: [[0, 0, 0], [1, 0, 0], [2, 0, 0]],
  lab: [[0, 0, 0], [0, 0, 1], [0, 0, 2]],
  library: [[0, 0, 0], [1, 0, 1], [2, 0, 2]]
};

let arrowPositions = [];
let currentPathIndex = 0;

init();

function init() {
  // Scene setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 3);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("arScene").appendChild(renderer.domElement);

  // Lights
  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  scene.add(light);

  // Load building model
  const loader = new THREE.GLTFLoader();
  loader.load('models/3d.glb', function(gltf) {
    buildingModel = gltf.scene;
    scene.add(buildingModel);
  });

  // Load arrow model
  loader.load('models/arrow.glb', function(gltf) {
    arrowModel = gltf.scene;
  });

  // UI events
  document.getElementById("startBtn").addEventListener("click", startNavigation);
  document.getElementById("stopBtn").addEventListener("click", stopNavigation);
  document.getElementById("locationSelect").addEventListener("change", (e) => {
    destination = e.target.value;
  });

  animate();
}

function startNavigation() {
  stopNavigation(); // Clear old arrows
  if (!destination || !pathData[destination]) return;

  // Get the positions from pathData and create arrows at those positions
  arrowPositions = pathData[destination];
  currentPathIndex = 0; // Reset the path index
  createArrowAtPosition(arrowPositions[currentPathIndex]); // Create the first arrow

  animateArrows(); // Start animating the arrows along the path
}

function createArrowAtPosition(position) {
  const arrow = arrowModel.clone();
  arrow.position.set(...position);
  arrows.push(arrow);
  scene.add(arrow);
}

function animateArrows() {
  if (currentPathIndex < arrowPositions.length - 1) {
    // Move the arrow along the path (linear interpolation)
    currentPathIndex++;
    const nextPos = arrowPositions[currentPathIndex];

    // Move the arrow to the next position
    arrows.forEach(arrow => {
      new TWEEN.Tween(arrow.position)
        .to({ x: nextPos[0], y: nextPos[1], z: nextPos[2] }, 1000) // Animate over 1 second
        .start();
    });

    setTimeout(animateArrows, 1000); // Continue animating after 1 second
  }
}

function stopNavigation() {
  arrows.forEach(a => scene.remove(a));
  arrows = [];
  currentPathIndex = 0; // Reset path index
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update(); // Update tween animations
  renderer.render(scene, camera);
}
