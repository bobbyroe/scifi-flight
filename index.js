import * as THREE from 'three';
import { EffectComposer } from 'jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js"

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
camera.position.set(0, 2, 5);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0.0;
bloomPass.strength = 3.0;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const squareGeo = new THREE.PlaneGeometry(1, 1);
const colors = [0xfe3508, 0x882121, 0x92505c, 0x300e22, 0x4f0505];

function getSquare() {
  const x = Math.round(Math.random() * 30) - 15.5;
  const y = Math.round(Math.random()) * 4;
  const z = Math.round(Math.random() * -80) - 0.5;

  const basicMat = new THREE.MeshBasicMaterial({
    color: colors[Math.floor(Math.random() * colors.length)],
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(squareGeo, basicMat);
  mesh.position.set(x, y, z);
  mesh.rotation.x = Math.PI * -0.5;
  const limit = 81;
  const speed = 0.1;
  mesh.userData = {
    update() {
      mesh.position.z += speed;
      if (mesh.position.z > 4) {
        mesh.position.z = -limit;
      }
    }
  };
  return mesh;
}

const boxes = Array(800).fill().map(getSquare);
boxes.forEach((b) => scene.add(b));

let paused = false;
function animate() {
  requestAnimationFrame(animate);
  if (!paused) {
    boxes.forEach((b) => b.userData.update());
    camera.rotation.z += 0.0006;
    composer.render(scene, camera);
  }
}
animate();

function handleKeyDown(evt) {
  const { key } = evt;
  if (key === "Escape") {
    paused = !paused;
  }
}
window.addEventListener("keydown", handleKeyDown);

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);
