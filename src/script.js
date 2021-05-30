import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Base
 */
// Debug

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */

let objects = [];
const parameters = {};
parameters.count = 100000;
parameters.size = 0.01;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 1;
parameters.randomness = 0.2;
parameters.randomnessPower = 3;
parameters.insideColor = "#ff6030";
parameters.outsideColor = "#1b3984";

let geometry = null;
let material = null;
let points = null;
let positions = null;
let distances = [];
let speeds = [];
// Destroy old galaxy
if (points !== null) {
  geometry.dispose();
  material.dispose();
  scene.remove(points);
}

/**
 * Geometry
 */
geometry = new THREE.BufferGeometry();

positions = new Float32Array(parameters.count * 3);
const colors = new Float32Array(parameters.count * 3);

const colorInside = new THREE.Color(parameters.insideColor);
const colorOutside = new THREE.Color(parameters.outsideColor);

for (let i = 0; i < parameters.count; i++) {
  // Position
  const i3 = i * 3;

  const radius =
    Math.pow(Math.random(), parameters.randomnessPower) * parameters.radius;

  const spinAngle = radius * parameters.spin;
  const branchAngle =
    ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

  const randomX =
    Math.pow(Math.random(), parameters.randomnessPower) *
    (Math.random() < 0.5 ? 1 : -1) *
    parameters.randomness *
    radius;
  const randomY =
    Math.pow(Math.random(), parameters.randomnessPower) *
    (Math.random() < 0.5 ? 1 : -1) *
    parameters.randomness *
    radius;
  const randomZ =
    Math.pow(Math.random(), parameters.randomnessPower) *
    (Math.random() < 0.5 ? 1 : -1) *
    parameters.randomness *
    radius;

  positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
  positions[i3 + 1] = randomY;
  positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

  // Color
  const mixedColor = colorInside.clone();
  mixedColor.lerp(colorOutside, radius / parameters.radius);

  colors[i3] = mixedColor.r;
  colors[i3 + 1] = mixedColor.g;
  colors[i3 + 2] = mixedColor.b;
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

/**
 * Material
 */
material = new THREE.PointsMaterial({
  size: parameters.size,
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
});

/**
 * Points
 */
points = new THREE.Points(geometry, material);
scene.add(points);
objects.push(points);

for (let i = 0; i < 25; i++) {
  let pointsClone = points.clone();
  pointsClone.position.set(
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100
  );
  let scale = 0.5 * Math.random() + 0.1;
  pointsClone.scale.set(scale, scale, scale);
  scene.add(pointsClone);

  objects.push(pointsClone);
  speeds.push(Math.random())
  distances.push(Math.random())
}

/**
 * Background stars
 */

let stargeometry = new THREE.BufferGeometry();
let starPositions = new Float32Array(300 * 3);

for (let i = 0; i < 300 * 3; i++) {
  starPositions[i] = (Math.random() - 0.5) * 100;
}

stargeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starPositions, 3)
);
let starMaterial = new THREE.PointsMaterial({
  size: 0.2,
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

let stars = new THREE.Points(stargeometry, starMaterial);
console.log(stars);
scene.add(stars);
objects.push(stars);
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  objects.forEach((obj, index) => {
    obj.rotation.y = speeds[index] * 1 * elapsedTime / 10;
    if (index > 0 && index != objects.length -1){
        obj.position.x = Math.sin(elapsedTime * speeds[index - 1] / 100 + speeds[index - 1] * 100) * distances[index -1] * 100
        obj.position.z = Math.cos(elapsedTime * speeds[index - 1] / 100 + speeds[index - 1] * 100) * distances[index -1] * 100
    } else if (index == objects.length -1){
        obj.rotation.y = -elapsedTime / 100;

    }
  });

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
