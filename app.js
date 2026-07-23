/**
 * app.js — Antigravity: Fixed-background 3D head that tracks the mouse
 * Three.js r164 · GLTFLoader
 *
 * The model is loaded in full but the camera is framed tightly on the head.
 * Only the head/neck bones are animated (look-at + breathing micro-drift).
 * The canvas is fixed full-screen behind all page content.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

window.isTrackingMouse = true;

// Detect touch device
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// ─── Renderer ────────────────────────────────────────────────────────────────
const canvas = document.getElementById('avatar-canvas');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled      = true;
renderer.shadowMap.type         = THREE.PCFSoftShadowMap;
renderer.outputColorSpace        = THREE.SRGBColorSpace;
renderer.localClippingEnabled    = false;
renderer.clippingPlanes          = [];
renderer.toneMapping             = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure     = 1.4;

var avatarRoot = null;
var modelReady = false;

let lastWidth = 0;

// Size to full window
function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // On mobile, scrolling hides the URL bar, firing resize events with minor height changes.
  // Resizing WebGL on every scroll causes severe lag. We only resize on width changes (rotation).
  if (width !== lastWidth) {
    lastWidth = width;

    renderer.setSize(width, height, true);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    if (modelReady) {
      positionCameraOnHead();
    }
  }
}

// ─── Scene ────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();

// ─── Camera — tight on head ───────────────────────────────────────────────────
// Will be repositioned after model loads, once we know the head world position.
const camera = new THREE.PerspectiveCamera(20, 1, 0.10, 50);
camera.position.set(0, 0, 3);
camera.lookAt(0, 0, 0);

window.addEventListener('resize', resize);
resize();

// ─── Lights ───────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(3, 6, 5);
dirLight.castShadow = true;
scene.add(dirLight);

const rimLight = new THREE.PointLight(0x10b981, 8, 10);
rimLight.position.set(-3, 2, -2);
scene.add(rimLight);

const fillLight = new THREE.PointLight(0x2dd4bf, 4, 10);
fillLight.position.set(2, 1, 3);
scene.add(fillLight);

// ─── Mouse → normalised ──────────────────────────────────────────────────────
const mouseNDC = new THREE.Vector2(0, 0);
// Spring-smoothed world target for head look-at
const lookTarget    = new THREE.Vector3(0, 0, 2);
const lookTargetRaw = new THREE.Vector3(0, 0, 2);
const lookVel       = new THREE.Vector3();

// Helper objects for cursor-to-world raycasting
const raycaster      = new THREE.Raycaster();
const lookPlane      = new THREE.Plane();
const camDir         = new THREE.Vector3();
const targetWorldPos = new THREE.Vector3();

// Idle detection — return to centre after IDLE_DELAY ms of no input
const IDLE_DELAY = 1500; // ms
let lastInputTime = Date.now();

/** Convert screen pixel coords to NDC and update mouseNDC. */
function setNDCFromPixel(x, y) {
  mouseNDC.x =  (x / window.innerWidth)  * 2 - 1;
  mouseNDC.y = -(y / window.innerHeight) * 2 + 1;
}

/** Full interaction: updates NDC + resets sleep/idle timers. */
function onDeliberateInput(x, y) {
  setNDCFromPixel(x, y);
  lastInputTime = Date.now();
  hasUserMoved = true;

  const mCanvas = document.getElementById('matrix-canvas');
  if (mCanvas) {
    mCanvas.style.setProperty('--mouse-x', x + 'px');
    mCanvas.style.setProperty('--mouse-y', y + 'px');
  }
}

// ── Mouse ──────────────────────────────────────────────────────────────────
document.addEventListener('mousemove', (e) => onDeliberateInput(e.clientX, e.clientY));

// ── Touch ──────────────────────────────────────────────────────────────────
// touchstart = deliberate tap → wakes avatar + resets sleep timer
document.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  if (t) onDeliberateInput(t.clientX, t.clientY);
}, { passive: true });

// touchmove = scrolling → only update look direction, do NOT reset sleep timer
document.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (t) setNDCFromPixel(t.clientX, t.clientY);
}, { passive: true });

// On finger lift → drift back to centre over time (handled by spring)
document.addEventListener('touchend', () => {
  mouseNDC.x = 0;
  mouseNDC.y = 0;
}, { passive: true });

function springVec3(cur, tgt, vel, k, d, dt) {
  const f = tgt.clone().sub(cur).multiplyScalar(k);
  vel.addScaledVector(f, dt).multiplyScalar(1 - d * dt);
  cur.addScaledVector(vel, dt);
}

// ─── Bone refs ────────────────────────────────────────────────────────────────
let boneHead = null, boneNeck = null;
const initialHeadQ = new THREE.Quaternion();
const initialNeckQ = new THREE.Quaternion();

const PATTERNS = {
  head: /^Head$/i,
  neck: /^Neck$/i,
  neck1: /^Neck1$/i,
  // Match any bone/node related to the arms, hands, shoulders or fingers
  arms: /arm|forearm|hand|shoulder|uparm|clavicle|elbow|wrist|finger|thumb|index|middle|ring|pinky/i,
};

// ─── Organic noise ────────────────────────────────────────────────────────────
function noise(t, freq, seed) {
  return Math.sin(t * freq + seed) * 0.5
       + Math.sin(t * freq * 1.73 + seed * 2.3) * 0.3
       + Math.sin(t * freq * 3.13 + seed * 5.7) * 0.2;
}

// ─── Model & Blinking ──────────────────────────────────────────────────────────
const blinkMeshes = [];
let blinkTimer = 0;
let nextBlinkTime = 2 + Math.random() * 4; // blink every 2-6 seconds
const blinkDuration = 0.16; // 160ms total blink time
let isBlinking = false;
let blinkProgress = 0;

let hasUserMoved = false;
let sleepInfluence = 1;
const allMorphMeshes = [];

const loadStartTime = Date.now();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load('./modelazo-optimized.glb', (gltf) => {
  avatarRoot = gltf.scene;

  const allMorphNames = new Set();

  avatarRoot.traverse((node) => {
    if (node.isMesh || node.isSkinnedMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
      if (node.isSkinnedMesh) node.frustumCulled = false;

      // Detect morph targets for blinking
      if (node.morphTargetDictionary) {
        allMorphMeshes.push(node);
        Object.keys(node.morphTargetDictionary).forEach(k => allMorphNames.add(k));

        const dict = node.morphTargetDictionary;
        const leftIdx = dict['eyeBlinkLeft'] ?? dict['eyeBlink_L'] ?? dict['Blink_Left'];
        const rightIdx = dict['eyeBlinkRight'] ?? dict['eyeBlink_R'] ?? dict['Blink_Right'];
        if (leftIdx !== undefined || rightIdx !== undefined) {
          blinkMeshes.push({ mesh: node, leftIdx, rightIdx });
        }
      }
    }
    if (PATTERNS.head.test(node.name)) boneHead = node;
    if (PATTERNS.neck.test(node.name) || PATTERNS.neck1.test(node.name)) boneNeck = node;

    // Relaxed posture: adjust arms closer to the torso by ~10%
    if (node.isBone) {
      if (node.name === 'LeftArm') {
        node.rotation.set(1.2, 0, -0.3);
      } else if (node.name === 'RightArm') {
        node.rotation.set(1.2, 0, 0.3);
      }
      else if (node.name === 'LeftForeArm' || node.name === 'RightForeArm') {
        node.rotation.set(0, 0, 0);
      }
    }
  });

  console.log('🤖 Detected blink meshes count:', blinkMeshes.length);
  blinkMeshes.forEach(b => console.log('Mesh:', b.mesh.name, 'LeftIdx:', b.leftIdx, 'RightIdx:', b.rightIdx));

  // --- TEMPORARY DEBUG UI FOR ALL MORPH TARGETS ---
  if (!document.getElementById('morph-debug-panel')) {
    const panel = document.createElement('div');
    panel.id = 'morph-debug-panel';
    panel.style.cssText = 'position:fixed; top:20px; left:20px; z-index:99999; background:rgba(0,0,0,0.85); border:1px solid #10B981; padding:15px; width: 320px; max-height:90vh; overflow-y:auto; display:flex; flex-direction:column; gap:10px; border-radius:8px; pointer-events:auto; font-size:12px; font-family:monospace; color:white;';
    
    const title = document.createElement('div');
    title.textContent = 'PRUEBA DE GESTOS';
    title.style.cssText = 'color:#10B981; font-size:16px; font-weight:bold; margin-bottom:5px; text-align:center; border-bottom:1px solid #10B981; padding-bottom:10px;';
    panel.appendChild(title);

    const morphButtons = [];

    // HELPER TO SET MORPH INFLUENCES
    const setMorph = (morphName, value) => {
      allMorphMeshes.forEach(m => {
        if (m.morphTargetDictionary[morphName] !== undefined) {
          m.morphTargetInfluences[m.morphTargetDictionary[morphName]] = value;
        }
      });
    };

    // RESET
    const btnReset = document.createElement('button');
    btnReset.textContent = 'RESET (Cara normal)';
    btnReset.style.cssText = 'background:#ef4444; color:white; border:none; padding:8px; cursor:pointer; border-radius:4px; font-weight:bold;';
    btnReset.onclick = () => {
      allMorphMeshes.forEach(m => {
        Object.values(m.morphTargetDictionary).forEach(idx => m.morphTargetInfluences[idx] = 0);
      });
      morphButtons.forEach(b => {
        b.isActive = false;
        b.el.style.background = '#1f2937';
        b.el.onmouseleave = () => b.el.style.background = '#1f2937';
      });
    };
    panel.appendChild(btnReset);

    const btnTrack = document.createElement('button');
    btnTrack.textContent = window.isTrackingMouse ? 'SEGUIR RATÓN: SÍ' : 'SEGUIR RATÓN: NO';
    btnTrack.style.cssText = 'background:#3b82f6; color:white; border:none; padding:8px; cursor:pointer; border-radius:4px; font-weight:bold; margin-bottom:15px;';
    btnTrack.onclick = () => {
      window.isTrackingMouse = !window.isTrackingMouse;
      btnTrack.textContent = window.isTrackingMouse ? 'SEGUIR RATÓN: SÍ' : 'SEGUIR RATÓN: NO';
      btnTrack.style.background = window.isTrackingMouse ? '#3b82f6' : '#6b7280';
    };
    panel.appendChild(btnTrack);

    // COMBOS
    const combosHeader = document.createElement('div');
    combosHeader.textContent = '🔥 COMBOS PREDEFINIDOS';
    combosHeader.style.cssText = 'color:#F59E0B; font-weight:bold; margin-top:5px; border-bottom:1px solid #4B5563; padding-bottom:5px;';
    panel.appendChild(combosHeader);

    const combos = [
      { name: 'Confianza Sobrada', morphs: {'mouthSmileLeft':0.8, 'browInnerUp':0.4} },
      { name: 'Sorpresa Absoluta', morphs: {'jawOpen':0.8, 'eyeWideLeft':1, 'eyeWideRight':1, 'browOuterUpLeft':1, 'browOuterUpRight':1} },
      { name: 'Desprecio / Superioridad', morphs: {'noseSneerLeft':1, 'browDownLeft':0.8, 'browDownRight':0.8, 'eyeSquintLeft':0.5} },
      { name: 'Sonrisa Sincera', morphs: {'mouthSmile':1, 'cheekPuff':0.6, 'eyeSquintLeft':0.4, 'eyeSquintRight':0.4} }
    ];

    combos.forEach(combo => {
      const btn = document.createElement('button');
      btn.textContent = combo.name;
      btn.style.cssText = 'background:#F59E0B; color:black; border:none; padding:6px; cursor:pointer; border-radius:4px; font-weight:bold; text-align:left; transition:opacity 0.2s;';
      btn.onmouseenter = () => btn.style.opacity = '0.8';
      btn.onmouseleave = () => btn.style.opacity = '1';
      btn.onclick = () => {
        btnReset.onclick(); // Reset first
        Object.entries(combo.morphs).forEach(([k, v]) => setMorph(k, v));
        // Visually activate corresponding single buttons if they exist
        Object.keys(combo.morphs).forEach(k => {
           const bState = morphButtons.find(b => b.name === k);
           if (bState) {
             bState.isActive = true;
             bState.el.style.background = '#10B981';
             bState.el.onmouseleave = () => bState.el.style.background = '#10B981';
           }
        });
      };
      panel.appendChild(btn);
    });

    // CATEGORIES DICTIONARY
    const categories = [
      { id: 'brow', title: '👁️ CEJAS', regex: /brow/i },
      { id: 'eye', title: '👀 OJOS', regex: /eye(?!Blink)/i },
      { id: 'mouth', title: '👄 BOCA (Sonrisas/Tristeza)', regex: /mouth/i },
      { id: 'jaw_tongue', title: '👅 MANDÍBULA Y LENGUA', regex: /jaw|tongue/i },
      { id: 'nose_cheek', title: '👃 NARIZ Y MEJILLAS', regex: /nose|cheek/i },
      { id: 'other', title: '⚙️ OTROS', regex: /.*/ }
    ];

    const translationMap = {
      'mouthSmile': 'Sonrisa Completa', 'mouthSmileLeft': 'Sonrisa Izq', 'mouthSmileRight': 'Sonrisa Der',
      'mouthFrownLeft': 'Triste Izq', 'mouthFrownRight': 'Triste Der',
      'mouthPucker': 'Lanzar Beso/Morritos', 'jawOpen': 'Boca Abierta', 'tongueOut': 'Sacar Lengua',
      'browInnerUp': 'Cejas Centro Arriba', 'browOuterUpLeft': 'Ceja Ext Izq Arriba', 'browOuterUpRight': 'Ceja Ext Der Arriba',
      'browDownLeft': 'Ceja Izq Abajo (Enfado)', 'browDownRight': 'Ceja Der Abajo (Enfado)',
      'eyeWideLeft': 'Ojo Izq Abierto', 'eyeWideRight': 'Ojo Der Abierto',
      'eyeSquintLeft': 'Ojo Izq Entrecerrado', 'eyeSquintRight': 'Ojo Der Entrecerrado',
      'noseSneerLeft': 'Asco Izq', 'noseSneerRight': 'Asco Der', 'cheekPuff': 'Hinchar Mofletes'
    };

    const sortedNames = Array.from(allMorphNames).filter(n => !n.toLowerCase().includes('blink')).sort();
    
    const catContainers = {};
    categories.forEach(c => {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex; flex-direction:column; gap:4px; margin-top:10px;';
      const h = document.createElement('div');
      h.textContent = c.title;
      h.style.cssText = 'color:#60A5FA; font-weight:bold; border-bottom:1px solid #374151; padding-bottom:4px; margin-bottom:4px; margin-top:10px;';
      div.appendChild(h);
      catContainers[c.id] = div;
    });

    const assigned = new Set();

    sortedNames.forEach(morphName => {
      const btn = document.createElement('button');
      const translated = translationMap[morphName] ? `${translationMap[morphName]} (${morphName})` : morphName;
      btn.textContent = translated;
      btn.style.cssText = 'background:#1f2937; color:white; border:1px solid #374151; padding:4px 6px; cursor:pointer; border-radius:4px; text-align:left; transition:background 0.2s; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;';
      
      const state = { name: morphName, el: btn, isActive: false };
      morphButtons.push(state);

      btn.onmouseenter = () => btn.style.background = state.isActive ? '#10B981' : '#374151';
      btn.onmouseleave = () => btn.style.background = state.isActive ? '#10B981' : '#1f2937';
      
      btn.onclick = () => {
        state.isActive = !state.isActive;
        btn.style.background = state.isActive ? '#10B981' : '#1f2937';
        btn.onmouseleave = () => btn.style.background = state.isActive ? '#10B981' : '#1f2937';
        setMorph(morphName, state.isActive ? 1 : 0);
      };
      
      // Find category
      for (const cat of categories) {
        if (cat.regex.test(morphName) && !assigned.has(morphName)) {
          catContainers[cat.id].appendChild(btn);
          assigned.add(morphName);
          break;
        }
      }
    });

    // Append populated categories to panel
    categories.forEach(c => {
      if (catContainers[c.id].childNodes.length > 1) { // 1 is the header
        panel.appendChild(catContainers[c.id]);
      }
    });
    // Hide panel by default
    panel.style.display = 'none';
    document.body.appendChild(panel);

    // Easter egg toggle button (invisible in bottom right corner)
    const easterEgg = document.createElement('div');
    easterEgg.style.cssText = 'position:fixed; bottom:0; right:0; width:50px; height:50px; z-index:99999; cursor:pointer; opacity:0; background:transparent;';
    easterEgg.title = '🤫 Menú de expresiones';
    easterEgg.onclick = () => {
      panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    };
    document.body.appendChild(easterEgg);
  }
  // --------------------------------------------

  // Store initial rotations of head and neck
  if (boneHead) initialHeadQ.copy(boneHead.quaternion);
  if (boneNeck) initialNeckQ.copy(boneNeck.quaternion);

  // Fit the whole model first
  const box  = new THREE.Box3().setFromObject(avatarRoot);
  const size = box.getSize(new THREE.Vector3());
  const modelScale = 2.4 / size.y;
  avatarRoot.scale.setScalar(modelScale);

  const box2 = new THREE.Box3().setFromObject(avatarRoot);
  avatarRoot.position.y = -box2.min.y; // feet at y=0

  scene.add(avatarRoot);

  // Wait 2 frames so world matrices settle, then aim camera at head
  requestAnimationFrame(() => requestAnimationFrame(() => {
    positionCameraOnHead();
    modelReady = true;
    
    // Hide preloader with minimum display time guarantee (2.8 seconds)
    const MIN_LOAD_TIME = 2800; // ms
    const elapsedTime = Date.now() - loadStartTime;
    const remainingTime = Math.max(0, MIN_LOAD_TIME - elapsedTime);
    
    setTimeout(() => {
      const preloader = document.getElementById('preloader');
      if (preloader) preloader.classList.add('preloader--hidden');
    }, remainingTime);
  }));

  console.log('🦴 Head:', boneHead?.name, '| Neck:', boneNeck?.name);

}, (p) => {
  /* progress — no loader needed here since it's background */
}, (err) => console.error('GLTF error:', err));

/**
 * Moves the camera to frame the face cleanly — no clipping planes.
 * The narrow FOV + distance naturally frames the head without
 * showing body parts. Called once after world matrices are ready.
 */
function positionCameraOnHead() {
  const headBone = boneHead ?? boneNeck;
  if (!headBone) return;
 
  headBone.updateWorldMatrix(true, false);
  const headPos = new THREE.Vector3();
  headBone.getWorldPosition(headPos);
 
  // Responsiveness based on aspect ratio:
  let camDist = 3.3;
  let targetOffset = new THREE.Vector3(0, -0.05, 0);

  if (camera.aspect < 1) {
    // Narrow portrait screen (mobile)
    camDist = 3.3 / (camera.aspect * 1.35); // Zoom out dynamically
    camDist = Math.min(Math.max(camDist, 3.3), 5.6); // Clamp zoom out range
    
    // Shift target up (moves avatar down in screen space so it sits nicely below the hero text)
    targetOffset.y = -0.18;
  } else {
    // Desktop: shift target up slightly (moves avatar down) to clear centered text
    targetOffset.y = -0.08;
  }

  const cameraTarget = headPos.clone().add(targetOffset);
 
  camera.position.set(cameraTarget.x, cameraTarget.y, cameraTarget.z + camDist);
  camera.lookAt(cameraTarget);
 
  console.log('📸 Camera Setup:', {
    position: [camera.position.x, camera.position.y, camera.position.z],
    target: [cameraTarget.x, cameraTarget.y, cameraTarget.z],
    camDist,
    aspect: camera.aspect
  });

  // Seed the spring look-at target directly in front of the head
  lookTarget.copy(headPos).add(new THREE.Vector3(0, 0, 1));
  lookTargetRaw.copy(lookTarget);
}

// ─── Animation loop ───────────────────────────────────────────────────────────
const clock = new THREE.Clock();
let t = 0;

// Reusable temporary objects to prevent Garbage Collection Jank
const tempVec = new THREE.Vector3();
const tempVec2 = new THREE.Vector3();
const tempQuat1 = new THREE.Quaternion();
const tempQuat2 = new THREE.Quaternion();
const tempEuler = new THREE.Euler();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  t += dt;

  if (!modelReady || !avatarRoot) { renderer.render(scene, camera); return; }

  // ── Blinking logic ─────────────────────────────────────────────────────────
  if (blinkMeshes.length > 0) {
    blinkTimer += dt;
    if (!isBlinking && blinkTimer >= nextBlinkTime) {
      isBlinking = true;
      blinkProgress = 0;
    }
    if (isBlinking) {
      blinkProgress += dt / blinkDuration;
      let influence = 0;
      if (blinkProgress < 0.5) {
        influence = blinkProgress * 2; // Closing: 0 -> 1
      } else if (blinkProgress < 1.0) {
        influence = 2 - (blinkProgress * 2); // Opening: 1 -> 0
      } else {
        influence = 0;
        isBlinking = false;
        blinkTimer = 0;
        nextBlinkTime = 2 + Math.random() * 4;
      }
      for (const item of blinkMeshes) {
        if (item.leftIdx !== undefined) item.mesh.morphTargetInfluences[item.leftIdx] = influence;
        if (item.rightIdx !== undefined) item.mesh.morphTargetInfluences[item.rightIdx] = influence;
      }
    }
  }

  // ── Wake Up & Frown Behaviors ──────────────────────────────────────────────
  if (hasUserMoved) {
    sleepInfluence = Math.max(0, sleepInfluence - dt * 1.5); // Wake up over ~0.66s
  } else {
    sleepInfluence = Math.min(1, sleepInfluence + dt * 0.5); // Fall asleep over 2s
    if (sleepInfluence > 0.8) blinkTimer = 0; // Stop blinking when mostly asleep
  }

  const distFromCenter = mouseNDC.length();
  let frownAmount = 0;
  if (hasUserMoved && distFromCenter > 0.6) {
    frownAmount = THREE.MathUtils.clamp((distFromCenter - 0.6) * 2.5, 0, 1);
  }

  // Apply dynamic morphs
  allMorphMeshes.forEach(m => {
    if (m.morphTargetDictionary['eyesClosed'] !== undefined) {
      m.morphTargetInfluences[m.morphTargetDictionary['eyesClosed']] = sleepInfluence;
    }
    if (m.morphTargetDictionary['browDownLeft'] !== undefined) {
      m.morphTargetInfluences[m.morphTargetDictionary['browDownLeft']] = frownAmount;
      m.morphTargetInfluences[m.morphTargetDictionary['browDownRight']] = frownAmount;
    }
  });

  // ── 0. Idle: if no input for IDLE_DELAY ms, drift NDC back to centre ───────
  const timeSinceLastInput = Date.now() - lastInputTime;
  if (timeSinceLastInput > IDLE_DELAY) {
    mouseNDC.x = THREE.MathUtils.lerp(mouseNDC.x, 0, 0.03);
    mouseNDC.y = THREE.MathUtils.lerp(mouseNDC.y, 0, 0.03);
  }
  
  // Go back to sleep if no interaction for 5 seconds
  if (timeSinceLastInput > 5000) {
    hasUserMoved = false;
  }

  // ── 1. Compute mouse world pos at head depth ──────────────────────────────
  const headBone = boneHead ?? boneNeck;
  if (headBone) {
    headBone.updateWorldMatrix(true, false);
    const headPos = new THREE.Vector3();
    headBone.getWorldPosition(headPos);

    // Intersect cursor ray with a vertical plane 1.5 units in front of the head (towards the camera).
    // This Z offset ensures the character looks straight forward at the screen/user when the mouse is idle in the center.
    camera.getWorldDirection(camDir);
    tempVec.copy(headPos).addScaledVector(camDir, -1.5);
    tempVec2.copy(camDir).negate();
    lookPlane.setFromNormalAndCoplanarPoint(tempVec2, tempVec);
    raycaster.setFromCamera(mouseNDC, camera);
    if (raycaster.ray.intersectPlane(lookPlane, targetWorldPos)) {
      lookTargetRaw.copy(targetWorldPos);

      // Correction: when cursor/touch is idle or centered (mouseNDC near 0,0), 
      // pull the look-at target Y position back up to the head level so he looks straight at the user.
      const distFromCenter = mouseNDC.length(); // 0 at center, ~1 at edge
      const centerFactor = Math.max(0, 1 - distFromCenter); // 1 at center, 0 at edge
      lookTargetRaw.y = THREE.MathUtils.lerp(lookTargetRaw.y, headPos.y, centerFactor);
    } else {
      lookTargetRaw.copy(headPos).addScaledVector(camDir, -1.5);
    }

    // Spring-smooth the look target
    springVec3(lookTarget, lookTargetRaw, lookVel, 14, 7, dt);

    // ── 2. Head look-at with clamped range (exaggerated sensitivity) ───────
    let yaw = 0;
    let pitch = 0;
    
    if (window.isTrackingMouse) {
      tempVec.copy(lookTarget).sub(headPos).normalize();
      yaw   = THREE.MathUtils.clamp(Math.atan2(tempVec.x, tempVec.z) * 2.2, -1.0, 1.0);
      pitch = THREE.MathUtils.clamp(Math.asin(-tempVec.y) * 2.2,         -0.6, 0.6);
    }

    // Organic micro-drift (blink-like subtle head movements)
    const microYaw   = noise(t, 0.38, 33) * 0.018;
    const microPitch = noise(t, 0.30, 37) * 0.012;
    const microRoll  = noise(t, 0.22, 41) * 0.006;

    // Calculate rotation relative to the initial rest pose
    tempEuler.set(pitch + microPitch, yaw + microYaw, microRoll, 'YXZ');
    tempQuat1.setFromEuler(tempEuler);
    tempQuat2.copy(initialHeadQ).multiply(tempQuat1);
    headBone.quaternion.slerp(tempQuat2, 0.06);

    // ── 3. Neck: subtle sympathetic follow ────────────────────────────────
    if (boneNeck && boneHead) {
      tempEuler.set(
        pitch * 0.3 + noise(t, 0.25, 51) * 0.008,
        yaw   * 0.3 + noise(t, 0.20, 53) * 0.007,
        0, 'YXZ'
      );
      tempQuat1.setFromEuler(tempEuler);
      tempQuat2.copy(initialNeckQ).multiply(tempQuat1);
      boneNeck.quaternion.slerp(tempQuat2, 0.04);
    }
  }

  // ── 4. Very subtle idle float of the whole model ──────────────────────────
  avatarRoot.position.y += Math.sin(t * 0.9) * 0.0003;

  renderer.render(scene, camera);
}

animate();

// ─── Scroll-to-Hide Navbar ───────────────────────────────────────────────────
let lastScrollY = window.scrollY;
const navElement = document.querySelector('.navbar');

if (navElement) {
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Prevent issues with iOS bounce/elastic scroll
    if (currentScrollY < 0 || currentScrollY > (document.documentElement.scrollHeight - window.innerHeight)) {
      return;
    }

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down and past threshold -> hide
      navElement.classList.add('navbar--hidden');
    } else if (currentScrollY < lastScrollY) {
      // Scrolling up -> show
      navElement.classList.remove('navbar--hidden');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
}

// ─── Matrix Digital Rain Background Effect ──────────────────────────────────
const matrixCanvas = document.createElement('canvas');
matrixCanvas.id = 'matrix-canvas';
matrixCanvas.setAttribute('aria-hidden', 'true');
// Insert it before the 3D canvas so it sits behind it in depth
const avatarCanvas = document.getElementById('avatar-canvas');
if (avatarCanvas) {
  document.body.insertBefore(matrixCanvas, avatarCanvas);
} else {
  document.body.appendChild(matrixCanvas);
}

const mCtx = matrixCanvas.getContext('2d');

let mWidth = window.innerWidth;
let mHeight = window.innerHeight;
matrixCanvas.width = mWidth;
matrixCanvas.height = mHeight;

const matrixChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテト';
const matrixCharArr = matrixChars.split('');

const mFontSize = 14;
let mColumns = Math.floor(mWidth / mFontSize);
let mRainDrops = Array(mColumns).fill(1).map(() => Math.floor(Math.random() * -50)); // stagger start positions

function drawMatrix() {
  mCtx.fillStyle = 'rgba(4, 10, 8, 0.08)'; // matching brand var(--bg) #040a08
  mCtx.fillRect(0, 0, mWidth, mHeight);

  mCtx.font = mFontSize + 'px monospace';

  for (let i = 0; i < mRainDrops.length; i++) {
    // Only draw if the drop is on-screen
    if (mRainDrops[i] >= 0) {
      const text = matrixCharArr[Math.floor(Math.random() * matrixCharArr.length)];
      
      // Lead character is occasionally white/glowing
      const isLead = Math.random() > 0.97;
      mCtx.fillStyle = isLead ? '#ffffff' : (Math.random() > 0.5 ? '#39ff14' : '#00ff00');
      
      mCtx.fillText(text, i * mFontSize, mRainDrops[i] * mFontSize);
    }

    if (mRainDrops[i] * mFontSize > mHeight && Math.random() > 0.975) {
      mRainDrops[i] = 0;
    }
    mRainDrops[i]++;
  }
}

let lastMTime = 0;
const mFPS = 30; // smooth 30 FPS limits CPU usage
const mInterval = 1000 / mFPS;

function animateMatrix(timestamp) {
  requestAnimationFrame(animateMatrix);

  if (!lastMTime) lastMTime = timestamp;
  const elapsed = timestamp - lastMTime;

  if (elapsed > mInterval) {
    lastMTime = timestamp - (elapsed % mInterval);
    drawMatrix();
  }
}
requestAnimationFrame(animateMatrix);

let lastMWidth = window.innerWidth;

// Adjust Matrix grid on window resize
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  
  if (w !== lastMWidth) {
    lastMWidth = w;
    mWidth = w;
    mHeight = h;
    matrixCanvas.width = w;
    matrixCanvas.height = h;
    mColumns = Math.floor(w / mFontSize);
    mRainDrops = Array(mColumns).fill(1).map(() => Math.floor(Math.random() * -50));
  } else {
    // Si solo cambia el alto (ej: barra de navegación de móvil al hacer scroll), actualizamos el alto sin reiniciar la lluvia
    mHeight = h;
    matrixCanvas.height = h;
  }
});

// ─── Cookie Banner Logic ──────────────────────────────────────────────────────
const cookieBanner = document.getElementById('cookie-banner');
const btnAcceptCookies = document.getElementById('btn-accept-cookies');
const btnRejectCookies = document.getElementById('btn-reject-cookies');

if (cookieBanner && btnAcceptCookies && btnRejectCookies) {
  // Check if user has already made a choice
  const cookieChoice = localStorage.getItem('insego_cookie_consent');
  
  if (!cookieChoice) {
    // Show after a small delay for a smoother entrance
    setTimeout(() => {
      cookieBanner.classList.add('cookie-banner--visible');
      cookieBanner.setAttribute('aria-hidden', 'false');
    }, 1500);
  }

  const hideBanner = (choice) => {
    localStorage.setItem('insego_cookie_consent', choice);
    cookieBanner.classList.remove('cookie-banner--visible');
    cookieBanner.setAttribute('aria-hidden', 'true');
  };

  btnAcceptCookies.addEventListener('click', () => hideBanner('accepted'));
  btnRejectCookies.addEventListener('click', () => hideBanner('rejected'));
}
