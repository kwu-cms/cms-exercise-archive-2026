import * as THREE from 'three';
import {
  PROJECT_CARD_CORNER_RADIUS,
  PROJECT_CARD_HEIGHT,
  PROJECT_CARD_WIDTH,
} from '../archetypes';
import { createRoundedAlphaTexture } from './rounded-alpha-texture';
import { OPEN_SUBMISSION_EVENT, type HeroOrbitCard } from './types';

const CARD_ASPECT = PROJECT_CARD_WIDTH / PROJECT_CARD_HEIGHT;
const CARD_HEIGHT = 1.55;
const CARD_WIDTH = CARD_HEIGHT * CARD_ASPECT;
const MASK_WIDTH = 256;
const MASK_HEIGHT = Math.round(MASK_WIDTH / CARD_ASPECT);
const MASK_CORNER_RADIUS = Math.round(
  PROJECT_CARD_CORNER_RADIUS * (MASK_WIDTH / PROJECT_CARD_WIDTH),
);

const OVERVIEW_FOV = 52;
const FOCUS_FOV = 38;
const FOCUS_FRAME_PADDING = 1.14;

const OVERVIEW_DISTANCE = 13.5;
const VIEWPORT_FILL_X = 0.9;
const VIEWPORT_FILL_Y = 0.62;

const SEQUENCE_MS = 9200;
const Z_SPAWN_FAR = -14;
const Z_APPROACH_START = -11.5;
const Z_FOCUS_NEAR = 4.2;
const Z_PASS_MARGIN = 0.25;
const BG_SPEED_MIN = 0.18;
const BG_SPEED_MAX = 0.52;
const CAMERA_FOLLOW_POS = 1.35;
const CAMERA_FOLLOW_LOOK = 1.55;
const CAMERA_FOLLOW_FOV = 1.05;
const CARD_VISUAL_SMOOTH = 2.1;
const FLOAT_AMP_XY = 0.08;

const FOCUS_APPROACH_SPEED = (Z_FOCUS_NEAR - Z_APPROACH_START) / (SEQUENCE_MS / 1000);

function smoothFactor(dt: number, speed: number): number {
  return 1 - Math.exp(-speed * dt);
}

interface CardStreamState {
  x: number;
  y: number;
  z: number;
  speed: number;
  phase: number;
  isBackground: boolean;
}

export interface HeroOrbitSceneHandle {
  dispose: () => void;
  setFocusedIndex: (index: number) => void;
  getFocusedIndex: () => number;
  onFocusChange: (cb: (index: number) => void) => void;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function shuffleWithRng<T>(items: T[], rng: () => number): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
}

function computeScatterExtents(aspect: number): { halfWidth: number; halfHeight: number } {
  const vFov = THREE.MathUtils.degToRad(OVERVIEW_FOV);
  const halfHeight =
    OVERVIEW_DISTANCE * Math.tan(vFov / 2) * VIEWPORT_FILL_Y - CARD_HEIGHT * 0.52;
  const halfWidth =
    OVERVIEW_DISTANCE * Math.tan(vFov / 2) * aspect * VIEWPORT_FILL_X - CARD_WIDTH * 0.52;
  return {
    halfWidth: Math.max(halfWidth, CARD_WIDTH),
    halfHeight: Math.max(halfHeight, CARD_HEIGHT),
  };
}

function scatterCardXY(
  count: number,
  aspect: number,
  rng: () => number,
): Array<{ x: number; y: number }> {
  const { halfWidth, halfHeight } = computeScatterExtents(aspect);
  const cols = Math.max(3, Math.round(Math.sqrt(count * aspect)));
  const rows = Math.ceil(count / cols);

  const cells: Array<{ col: number; row: number }> = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push({ col, row });
    }
  }
  shuffleWithRng(cells, rng);

  const cellW = (halfWidth * 2) / cols;
  const cellH = (halfHeight * 2) / rows;

  return Array.from({ length: count }, (_, i) => {
    const cell = cells[i]!;
    const cx = -halfWidth + (cell.col + 0.5) * cellW;
    const cy = -halfHeight + (cell.row + 0.5) * cellH;
    return {
      x: cx + (rng() - 0.5) * cellW * 0.62,
      y: cy + (rng() - 0.5) * cellH * 0.62,
    };
  });
}

function randomBackgroundSpeed(rng: () => number): number {
  return BG_SPEED_MIN + rng() * (BG_SPEED_MAX - BG_SPEED_MIN);
}

function createCardStreamStates(count: number, aspect: number, seed = 20260709): CardStreamState[] {
  const rng = createSeededRng(seed);
  const xy = scatterCardXY(count, aspect, rng);

  return xy.map(({ x, y }, i) => ({
    x,
    y,
    z: i === 0 ? Z_APPROACH_START : Z_SPAWN_FAR - rng() * 4 - i * 0.35,
    speed: i === 0 ? FOCUS_APPROACH_SPEED : randomBackgroundSpeed(rng),
    phase: i * 0.73,
    isBackground: i !== 0,
  }));
}

const _worldPos = new THREE.Vector3();
const _cameraTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

function computeFocusCameraDistance(aspect: number, fov: number): number {
  const vFov = THREE.MathUtils.degToRad(fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const focusScale = 1.06;
  const halfH = (CARD_HEIGHT * focusScale) / 2;
  const halfW = (CARD_WIDTH * focusScale) / 2;
  const vDist = halfH / Math.tan(vFov / 2);
  const hDist = halfW / Math.tan(hFov / 2);
  return Math.max(vDist, hDist) * FOCUS_FRAME_PADDING;
}

function computeFocusCamera(
  card: CardStreamState,
  aspect: number,
  fov: number,
  posOut: THREE.Vector3,
  lookOut: THREE.Vector3,
) {
  const distance = computeFocusCameraDistance(aspect, fov);
  lookOut.set(card.x, card.y, card.z);
  posOut.set(card.x, card.y + 0.04, card.z + distance);
}

function prepareCardApproach(state: CardStreamState) {
  state.z = Z_APPROACH_START;
  state.speed = FOCUS_APPROACH_SPEED;
  state.isBackground = false;
}

function respawnCard(state: CardStreamState, rng: () => number) {
  state.z = Z_SPAWN_FAR - rng() * 4;
  state.speed = randomBackgroundSpeed(rng);
  state.isBackground = true;
}

function cardOpacity(mesh: THREE.Mesh, camera: THREE.PerspectiveCamera, isFocus: boolean): number {
  mesh.getWorldPosition(_worldPos);
  const dist = _worldPos.distanceTo(camera.position);
  const base = isFocus ? 1 : 0.72;
  const t = THREE.MathUtils.clamp(1 - (dist - 4) / 16, 0.42, 1);
  return base * t;
}

function createStarfield(): THREE.Points {
  const count = 160;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const dist = 8 + Math.random() * 22;
    positions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta) * 0.5;
    positions[i * 3 + 2] = dist * Math.cos(phi) - 4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xb8c8e8,
    size: 0.045,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

export function initHeroOrbitScene(
  container: HTMLElement,
  cards: HeroOrbitCard[],
): HeroOrbitSceneHandle {
  const reduced = prefersReducedMotion();
  const count = Math.max(cards.length, 1);
  const respawnRng = createSeededRng(20260710);

  let disposed = false;
  let focusedIndex = 0;
  let userFocusLock: number | null = null;
  let sequenceStartedAt = performance.now();
  const focusListeners: Array<(index: number) => void> = [];
  let elapsed = 0;

  const w = Math.max(container.clientWidth, 320);
  const h = Math.max(container.clientHeight, 360);
  const aspect = w / h;
  const cardStates = createCardStreamStates(count, aspect);

  const cameraPos = new THREE.Vector3();
  const lookAt = new THREE.Vector3();

  focusedIndex = 0;
  computeFocusCamera(cardStates[0]!, aspect, FOCUS_FOV, cameraPos, lookAt);

  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.FogExp2(0x131822, 0.0045);

  const camera = new THREE.PerspectiveCamera(FOCUS_FOV, w / h, 0.1, 120);
  camera.position.copy(cameraPos);
  camera.lookAt(lookAt);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'manipulation';
  container.appendChild(canvas);

  const starfield = createStarfield();
  scene.add(starfield);

  const meshes: THREE.Mesh[] = [];
  const displayScales = new Float32Array(count);
  const displayOpacities = new Float32Array(count);
  displayScales.fill(1);
  displayOpacities.fill(1);
  let displayFov = FOCUS_FOV;
  const loader = new THREE.TextureLoader();
  const materials: THREE.MeshBasicMaterial[] = [];
  const cornerMask = createRoundedAlphaTexture(MASK_WIDTH, MASK_HEIGHT, MASK_CORNER_RADIUS);

  cards.forEach((card, i) => {
    const geo = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      toneMapped: true,
      depthWrite: true,
      side: THREE.FrontSide,
      alphaMap: cornerMask,
      alphaTest: 0.42,
    });
    materials.push(mat);

    loader.load(card.imageUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      mat.map = texture;
      mat.needsUpdate = true;
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.index = i;
    const state = cardStates[i]!;
    mesh.position.set(state.x, state.y, state.z);
    scene.add(mesh);
    meshes.push(mesh);
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function notifyFocus(index: number) {
    if (focusedIndex === index) return;
    focusedIndex = index;
    for (const cb of focusListeners) cb(index);
  }

  function setFocus(index: number, fromUser = false) {
    const safe = ((index % count) + count) % count;
    if (fromUser) {
      respawnCard(cardStates[focusedIndex]!, respawnRng);
      userFocusLock = safe;
      prepareCardApproach(cardStates[safe]!);
    }
    sequenceStartedAt = performance.now();
    notifyFocus(safe);
  }

  function advanceFocusSequential() {
    const prev = focusedIndex;
    const next = (prev + 1) % count;
    respawnCard(cardStates[prev]!, respawnRng);
    userFocusLock = null;
    prepareCardApproach(cardStates[next]!);
    sequenceStartedAt = performance.now();
    notifyFocus(next);
  }

  function updateCardMeshes(now: number, dt: number) {
    const visualBlend = smoothFactor(dt, CARD_VISUAL_SMOOTH);

    meshes.forEach((mesh, i) => {
      const state = cardStates[i]!;
      const isFocus = i === focusedIndex;
      const float = reduced ? 0 : 1;
      mesh.position.set(
        state.x + Math.sin(now * 0.29 + state.phase) * FLOAT_AMP_XY * float,
        state.y + Math.sin(now * 0.24 + state.phase * 1.15) * FLOAT_AMP_XY * float,
        state.z,
      );
      mesh.rotation.set(0, 0, 0);

      const mat = materials[i]!;
      const targetScale = isFocus ? 1.06 : 0.88;
      const targetOpacity = cardOpacity(mesh, camera, isFocus);
      displayScales[i] = THREE.MathUtils.lerp(displayScales[i]!, targetScale, visualBlend);
      displayOpacities[i] = THREE.MathUtils.lerp(displayOpacities[i]!, targetOpacity, visualBlend);
      mesh.scale.setScalar(displayScales[i]!);
      mat.opacity = displayOpacities[i]!;
    });
  }

  function pickCard(clientX: number, clientY: number): number | null {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(meshes, false);
    if (!hits.length) return null;
    const idx = hits[0]!.object.userData.index;
    return typeof idx === 'number' ? idx : null;
  }

  const onPointerUp = (event: PointerEvent) => {
    const idx = pickCard(event.clientX, event.clientY);
    if (idx == null) return;
    if (idx === focusedIndex && userFocusLock === idx) {
      const card = cards[idx];
      if (card) {
        window.dispatchEvent(
          new CustomEvent(OPEN_SUBMISSION_EVENT, { detail: { id: card.id } }),
        );
      }
      return;
    }
    setFocus(idx, true);
  };
  canvas.addEventListener('pointerup', onPointerUp);

  const onResize = () => {
    const nw = Math.max(container.clientWidth, 1);
    const nh = Math.max(container.clientHeight, 1);
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  };
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(container);

  let lastFrame = performance.now();

  renderer.setAnimationLoop(() => {
    if (disposed) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    elapsed += dt;

    if (!reduced) {
      const passZ = camera.position.z - Z_PASS_MARGIN;

      for (let i = 0; i < cardStates.length; i += 1) {
        const state = cardStates[i]!;
        state.z += state.speed * dt;

        if (i === focusedIndex) {
          state.z = Math.min(state.z, Z_FOCUS_NEAR);
        }

        if (state.isBackground && state.z > passZ) {
          respawnCard(state, respawnRng);
        }
      }

      if (userFocusLock == null && now - sequenceStartedAt >= SEQUENCE_MS) {
        advanceFocusSequential();
      }

      starfield.rotation.y = elapsed * 0.006;
    }

    const focusState = cardStates[focusedIndex]!;
    computeFocusCamera(focusState, camera.aspect, displayFov, _cameraTarget, _lookTarget);

    const posBlend = smoothFactor(dt, CAMERA_FOLLOW_POS);
    const lookBlend = smoothFactor(dt, CAMERA_FOLLOW_LOOK);
    cameraPos.lerp(_cameraTarget, posBlend);
    lookAt.lerp(_lookTarget, lookBlend);
    camera.position.copy(cameraPos);
    camera.lookAt(lookAt);

    const focusDistance = computeFocusCameraDistance(camera.aspect, displayFov);
    const approachT = THREE.MathUtils.clamp(
      1 - (camera.position.z - focusState.z - focusDistance) / 6,
      0,
      1,
    );
    const targetFov = THREE.MathUtils.lerp(OVERVIEW_FOV, FOCUS_FOV, approachT);
    displayFov = THREE.MathUtils.lerp(displayFov, targetFov, smoothFactor(dt, CAMERA_FOLLOW_FOV));
    camera.fov = displayFov;
    camera.updateProjectionMatrix();

    updateCardMeshes(elapsed, dt);
    renderer.render(scene, camera);
  });

  for (const cb of focusListeners) cb(focusedIndex);

  return {
    dispose: () => {
      disposed = true;
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerup', onPointerUp);
      renderer.setAnimationLoop(null);
      materials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      cornerMask.dispose();
      starfield.geometry.dispose();
      (starfield.material as THREE.Material).dispose();
      meshes.forEach((m) => m.geometry.dispose());
      renderer.dispose();
      container.replaceChildren();
      focusListeners.length = 0;
    },
    setFocusedIndex: (index) => setFocus(index, true),
    getFocusedIndex: () => focusedIndex,
    onFocusChange: (cb) => {
      focusListeners.push(cb);
      cb(focusedIndex);
    },
  };
}
