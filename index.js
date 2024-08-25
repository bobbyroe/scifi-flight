import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/postprocessing/UnrealBloomPass.js"

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
scene.fog = new THREE.FogExp2(0x000000, 0.02);

const renderScene = new RenderPass( scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0;
bloomPass.strength = 0.5;
bloomPass.radius = 0;

const composer = new EffectComposer( renderer);
composer.addPass(renderScene);
// composer.addPass(bloomPass);

const size = 0.33;
const squareGeo = new THREE.BoxGeometry(size, size, size);
const colors = [0xe63946, 0xf1faee, 0xa8dadc, 0x457b9d, 0x1d3557];

const boxGroup = new THREE.Group();
scene.add(boxGroup);
function getSquare({ u, v}) {
  console.log(u, v);
  const x = u - 30;
  const y = 0;
  const z = v - 80;

  const basicMat = new THREE.MeshBasicMaterial({
    color: colors[Math.floor(Math.random()* colors.length)],
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(squareGeo, basicMat);
  mesh.position.set(x, y, z);
  mesh.rotation.x = -90 * Math.PI / 180;
  const limit = 81;
  const speed = 0.1;
  mesh.userData = {
    update() {
      mesh.position.z += speed;
      if (mesh.position.z > 4) {
        mesh.position.z = -limit;
      }
    },
  };
  return mesh;
}
const gridWidth = 60;
const gridDepth = 80;
for (let u = 0; u < gridWidth; u += 1) {
  for (let v = 0; v < gridDepth; v += 1) {
    const square = getSquare({ u, v });
    boxGroup.add(square);
  }
}

camera.position.y = 2;
camera.position.z = 5;

let paused = false;
function animate(t = 0) {
  requestAnimationFrame(animate);
  if (!paused) {
    boxGroup.children.forEach((b) => b.userData.update());
    camera.rotation.z += 0.0006;
    camera.position.x = 1.0 + Math.cos(t * 0.0003) * 2;
    camera.position.y = 2.0 + Math.sin(t * 0.0003) * 4;

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

document.body.addEventListener("keydown", handleKeyDown);
