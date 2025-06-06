import * as THREE from 'https://cdn.skypack.dev/three@0.154.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'https://cdn.skypack.dev/tween.js';

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
  document.getElementById('arScene').appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  scene.add(light);

  const loader = new GLTFLoader();
  loader.load('models/3d.glb', function(gltf) {
    buildingModel = gltf.scene;
    scene.add(buildingModel);
  });

  loader.load('models/arrow.glb', function(gltf) {
    arrowModel = gltf.scene;
  });

  // UI Events
  document.getElementById('startBtn').addEventListener('click', startNavigation);
  document.getElementById('stopBtn').addEventListener('click', stopNavigation);
  document.getElementById('locationSelect').addEventListener('change', (e) => {
    destination = e.target.value;
  });

  enableCameraBackground();
  animate();
}

function enableCameraBackground() {
  // Request access to the back camera
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      const video = document.createElement('video');
      video.setAttribute('playsinline', 'true');
      video.muted = true;
      video.autoplay = true;
      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play();
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;

        scene.background = videoTexture;
      };
    })
    .catch((err) => {
      console.error('Camera access error:', err);
      alert('Camera permission denied or unavailable. Make sure your device has a working camera and you have allowed access.');
      scene.background = new THREE.Color(0x000000); // Fallback to black background
    });
}

function startNavigation() {
  stopNavigation();
  if (!destination || !pathData[destination]) return;

  arrowPositions = pathData[destination];
  currentPathIndex = 0;
  createArrowAtPosition(arrowPositions[currentPathIndex]);
  animateArrows();
}

function createArrowAtPosition(position) {
  const arrow = arrowModel.clone();
  arrow.position.set(...position);
  arrows.push(arrow);
  scene.add(arrow);
}

function animateArrows() {
  if (currentPathIndex < arrowPositions.length - 1) {
    currentPathIndex++;
    const nextPos = arrowPositions[currentPathIndex];

    arrows.forEach(arrow => {
      new TWEEN.Tween(arrow.position)
        .to({ x: nextPos[0], y: nextPos[1], z: nextPos[2] }, 1000)
        .start();
    });

    setTimeout(animateArrows, 1000);
  }
}

function stopNavigation() {
  arrows.forEach(a => scene.remove(a));
  arrows = [];
  currentPathIndex = 0;
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  renderer.render(scene, camera);
}
