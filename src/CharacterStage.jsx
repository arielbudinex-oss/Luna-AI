import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import {
  VRMAnimationLoaderPlugin,
  VRMLookAtQuaternionProxy,
  createVRMAnimationClip,
} from '@pixiv/three-vrm-animation';

const MODEL_URL = `${import.meta.env.BASE_URL}models/vita.vrm`;
// Model VRM 0.x ini menghadap kamera setelah dibalik setengah putaran;
// rotasi dasar juga menutupi arah hadap bawaan yang berbeda dari VRM 1.0.
const MODEL_YAW = Math.PI;
// Dua idle rekaman Overte (Apache-2.0, lihat public/animations/NOTICE.md):
// napas, geser berat badan, dan jari yang tidak pernah benar-benar diam.
const IDLE_CLIPS = ['idle-7.vrma', 'idle-3.vrma'];
const MOOD_KEYS = ['happy', 'angry', 'sad', 'relaxed'];
const VISEMES = ['aa', 'ih', 'ou', 'ee', 'oh'];

const damp = (rate, dt) => 1 - Math.exp(-rate * dt);

function floorShadow() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.22)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.05, 0.7),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.003;
  return mesh;
}

// Model CC0 ini tidak membawa normal map sama sekali, jadi kulit dan kainnya
// tampil seperti plastik. Pola butir halus yang bisa diulang (tileable) dipakai
// sebagai detail permukaan tanpa mengubah tekstur asli model.
function microNormalMap(size = 128, repeat = 7) {
  let seed = 20241116;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const levels = [8, 16, 32, 64];
  const grids = levels.map((cells) => {
    const grid = new Float32Array(cells * cells);
    for (let i = 0; i < grid.length; i += 1) grid[i] = rnd();
    return grid;
  });
  const heights = new Float32Array(size * size);
  const smooth = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let value = 0;
      let amp = 0.5;
      for (let o = 0; o < levels.length; o += 1) {
        const cells = levels[o];
        const grid = grids[o];
        const gx = (x / size) * cells;
        const gy = (y / size) * cells;
        const x0 = Math.floor(gx) % cells;
        const y0 = Math.floor(gy) % cells;
        const x1 = (x0 + 1) % cells;
        const y1 = (y0 + 1) % cells;
        const tx = smooth(gx - Math.floor(gx));
        const ty = smooth(gy - Math.floor(gy));
        const top = grid[y0 * cells + x0] * (1 - tx) + grid[y0 * cells + x1] * tx;
        const bot = grid[y1 * cells + x0] * (1 - tx) + grid[y1 * cells + x1] * tx;
        value += (top * (1 - ty) + bot * ty) * amp;
        amp *= 0.55;
      }
      heights[y * size + x] = value;
    }
  }
  const data = new Uint8Array(size * size * 4);
  const h = (x, y) => heights[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * 1.4;
      const dy = (h(x, y + 1) - h(x, y - 1)) * 1.4;
      const inv = 1 / Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      data[i] = (-dx * inv * 0.5 + 0.5) * 255;
      data[i + 1] = (-dy * inv * 0.5 + 0.5) * 255;
      data[i + 2] = (inv * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.needsUpdate = true;
  return texture;
}

const CLOTH = /cloth|sock|underwear|skirt|dress|shirt|pants/i;
const SKIN = /body|face|skin/i;
const NO_GRAIN = /hair|eye|brow|mouth|lash|translucent/i;

function floorGlow() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(150, 178, 255, 0.32)');
  grad.addColorStop(0.5, 'rgba(120, 150, 230, 0.1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.5),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.0015;
  return mesh;
}

function dressMaterials(vrm) {
  const grain = microNormalMap();
  let used = false;
  vrm.scene.traverse((obj) => {
    if (!obj.isMesh) return;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of materials) {
      if (!mat?.isMToonMaterial) continue;
      const name = mat.name || '';
      if (NO_GRAIN.test(name)) continue;
      if (!mat.normalMap && (CLOTH.test(name) || SKIN.test(name))) {
        mat.normalMap = grain;
        const strength = CLOTH.test(name) ? 0.3 : 0.15;
        mat.normalScale = new THREE.Vector2(strength, strength);
        used = true;
      }
      if (CLOTH.test(name)) {
        mat.parametricRimColorFactor = new THREE.Color('#c3d2ff');
        mat.rimLightingMixFactor = 0.16;
        mat.parametricRimFresnelPowerFactor = 6;
        mat.parametricRimLiftFactor = 0;
      }
      mat.needsUpdate = true;
    }
  });
  if (!used) grain.dispose();
}

export default function CharacterStage({ mood, talking }) {
  const hostRef = useRef(null);
  const live = useRef({ mood, talking });
  live.current = { mood, talking };
  const engine = useRef(null);
  const [status, setStatus] = useState('loading');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setStatus('error');
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = 'vd-canvas';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    scene.add(new THREE.HemisphereLight(0xeef4ff, 0x1f232b, 0.45));
    const key = new THREE.DirectionalLight(0xeaf2ff, 1.5);
    key.position.set(2.2, 3, 2.6);
    const rim = new THREE.DirectionalLight(0x9fb8ff, 1.1);
    rim.position.set(-2.4, 2.2, -2.2);
    const fill = new THREE.DirectionalLight(0xf0f6ff, 0.35);
    fill.position.set(-1.4, 1.3, 2.6);
    scene.add(key, rim, fill);
    scene.add(floorGlow());
    scene.add(floorShadow());

    const lookTarget = new THREE.Object3D();
    lookTarget.position.set(0, 1.4, 1.6);
    scene.add(lookTarget);

    const frame = { height: 1.9, width: 1.05, cy: 0.88 };
    const fit = () => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      const dist = Math.max(
        (frame.height / 2 / Math.tan(vFov / 2)) * 1.03,
        (frame.width / 2 / Math.tan(hFov / 2)) * 1.06
      );
      camera.position.set(0, frame.cy, dist);
      camera.lookAt(0, frame.cy, 0);
      camera.updateProjectionMatrix();
    };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(host);

    let vrm = null;
    let disposed = false;
    let yaw = 0;
    let yawTarget = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const gaze = { x: 0, y: 0, active: false };
    const weights = Object.fromEntries(MOOD_KEYS.map((k) => [k, 0]));
    const viseme = Object.fromEntries(VISEMES.map((k) => [k, 0]));
    let visemeTarget = Object.fromEntries(VISEMES.map((k) => [k, 0]));
    let lastVisemeAt = -1;
    let nextBlink = 2.4;
    let blinkStart = -1;
    let blinkValue = 0;
    let time = 0;
    let mixer = null;
    let idles = [];
    let idleIndex = 0;
    let nextIdleSwap = 0;
    let headLook = 0;

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    const animationLoader = new GLTFLoader();
    animationLoader.register((parser) => new VRMAnimationLoaderPlugin(parser));
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        vrm = gltf.userData.vrm;
        dressMaterials(vrm);
        vrm.scene.traverse((obj) => {
          obj.frustumCulled = false;
        });

        const bone = (name) => vrm.humanoid?.getNormalizedBoneNode(name);
        // T-pose bawaan konversi; turunkan lengan supaya terlihat santai.
        const lArm = bone('leftUpperArm');
        const rArm = bone('rightUpperArm');
        if (lArm) lArm.rotation.z = -1.14;
        if (rArm) rArm.rotation.z = 1.14;
        const lShoulder = bone('leftShoulder');
        const rShoulder = bone('rightShoulder');
        if (lShoulder) lShoulder.rotation.z = -0.03;
        if (rShoulder) rShoulder.rotation.z = 0.03;

        vrm.lookAt.target = lookTarget;
        if (vrm.lookAt) {
          const proxy = new VRMLookAtQuaternionProxy(vrm.lookAt);
          proxy.name = 'VRMLookAtQuaternionProxy';
          vrm.scene.add(proxy);
        }
        scene.add(vrm.scene);
        vrm.scene.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(vrm.scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        if (Number.isFinite(size.y) && size.y > 0.5) {
          frame.height = size.y;
          frame.width = Math.max(size.x, 0.5);
          frame.cy = center.y;
          fit();
        }
        mixer = new THREE.AnimationMixer(vrm.scene);
        setStatus('ready');

        void Promise.all(
          IDLE_CLIPS.map(async (file) => {
            try {
              const gltf = await animationLoader.loadAsync(`${import.meta.env.BASE_URL}animations/${file}`);
              const animation = gltf.userData.vrmAnimations?.[0];
              if (!animation || disposed) return null;
              return mixer.clipAction(createVRMAnimationClip(animation, vrm));
            } catch {
              return null;
            }
          })
        ).then((loaded) => {
          if (disposed || !vrm) return;
          const actions = loaded.filter(Boolean);
          if (!actions.length) return;
          idles = actions;
          for (const action of idles) action.setLoop(THREE.LoopRepeat, Infinity);
          idles[0].play();
          mixer.update(0);
          nextIdleSwap = time + 18 + Math.random() * 10;
        });
      },
      (event) => {
        if (event.total > 0) setProgress(Math.round((event.loaded / event.total) * 100));
      },
      () => {
        if (!disposed) setStatus('error');
      }
    );

    const onPointerDown = (event) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture?.(event.pointerId);
      renderer.domElement.classList.add('dragging');
    };
    const onPointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      gaze.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      gaze.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      gaze.active = true;
      if (!dragging) return;
      yawTarget = THREE.MathUtils.clamp(yawTarget + (event.clientX - lastX) * 0.0085, -2.4, 2.4);
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onPointerUp = () => {
      dragging = false;
      renderer.domElement.classList.remove('dragging');
    };
    const onPointerLeave = () => {
      gaze.active = false;
      onPointerUp();
    };
    const onDoubleClick = () => {
      yawTarget = 0;
    };
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('dblclick', onDoubleClick);

    engine.current = {
      reset: () => {
        yawTarget = 0;
        gaze.active = false;
      },
    };

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!vrm) {
        renderer.render(scene, camera);
        return;
      }
      time += dt;
      yaw += (yawTarget - yaw) * damp(10, dt);
      const sway = reduceMotion ? 0 : Math.sin(time * 0.55) * 0.028;
      vrm.scene.rotation.y = MODEL_YAW + yaw + sway;

      if (mixer && idles.length && !reduceMotion) {
        mixer.update(dt);
        if (time > nextIdleSwap) {
          const prev = idles[idleIndex];
          idleIndex = (idleIndex + 1) % idles.length;
          idles[idleIndex].reset().fadeIn(0.9).play();
          prev.fadeOut(0.9);
          nextIdleSwap = time + 20 + Math.random() * 12;
        }
        const bias = gaze.active ? THREE.MathUtils.clamp(gaze.x, -1, 1) : 0;
        headLook += (bias - headLook) * damp(2.6, dt);
        const head = vrm.humanoid?.getNormalizedBoneNode('head');
        const neck = vrm.humanoid?.getNormalizedBoneNode('neck');
        if (head) head.rotation.y += headLook * 0.12;
        if (neck) neck.rotation.y += headLook * 0.055;
      } else if (!idles.length) {
        const chest = vrm.humanoid?.getNormalizedBoneNode('chest');
        if (chest && !reduceMotion) chest.rotation.x = Math.sin(time * 1.5) * 0.012;
      }

      lookTarget.position.set(gaze.x * 0.7, 1.4 - gaze.y * 0.32, 1.6);

      const expr = vrm.expressionManager;
      if (expr) {
        const { mood: want, talking: speak } = live.current;
        for (const name of MOOD_KEYS) {
          const target = want === name ? 1 : 0;
          weights[name] += (target - weights[name]) * damp(9, dt);
          expr.setValue(name, weights[name] < 0.005 ? 0 : weights[name]);
        }

        if (!reduceMotion) {
          if (blinkStart < 0 && time > nextBlink) blinkStart = time;
          if (blinkStart >= 0) {
            const p = (time - blinkStart) / 0.15;
            if (p >= 1) {
              blinkStart = -1;
              blinkValue = 0;
              nextBlink = time + 2.2 + Math.random() * 3.4;
            } else {
              blinkValue = Math.sin(Math.PI * p);
            }
          }
          expr.setValue('blink', blinkValue);
        }

        if (speak) {
          if (time - lastVisemeAt > 0.1 + Math.random() * 0.05) {
            lastVisemeAt = time;
            const amp = Math.random() < 0.15 ? 0.08 : 0.32 + Math.random() * 0.5;
            visemeTarget = Object.fromEntries(VISEMES.map((k) => [k, k === VISEMES[(Math.random() * VISEMES.length) | 0] ? amp : 0]));
          }
        } else {
          visemeTarget = Object.fromEntries(VISEMES.map((k) => [k, 0]));
        }
        for (const name of VISEMES) {
          viseme[name] += (visemeTarget[name] - viseme[name]) * damp(20, dt);
          expr.setValue(name, viseme[name] < 0.004 ? 0 : viseme[name]);
        }
      }

      vrm.update(dt);
      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      engine.current = null;
      mixer?.stopAllAction();
      if (vrm) mixer?.uncacheRoot(vrm.scene);
      mixer = null;
      idles = [];
      resize.disconnect();
      renderer.setAnimationLoop(null);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('dblclick', onDoubleClick);
      scene.traverse((obj) => {
        obj.geometry?.dispose?.();
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of materials) {
          if (!mat) continue;
          for (const value of Object.values(mat)) {
            if (value?.isTexture) value.dispose();
          }
          mat.dispose?.();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <>
      <div className="vd-mount" ref={hostRef} aria-hidden="true" />
      <div className="vd-grain" aria-hidden="true" />
      {status === 'loading' ? (
        <div className="vd-cover">
          <span className="vd-spinner" aria-hidden="true" />
          <p>Menyiapkan karakter{progress > 0 ? ` · ${progress}%` : '…'}</p>
          <small>Dimuat sekali, lalu berjalan langsung di browser.</small>
        </div>
      ) : null}
      {status === 'error' ? (
        <div className="vd-cover">
          <p>Browser ini belum bisa menjalankan karakter 3D.</p>
          <small>
            Halaman tetap bisa dibaca. Coba buka dengan Chrome, Edge, atau Firefox terbaru.
          </small>
        </div>
      ) : null}
      <div className="vd-badge" aria-hidden="true">3D langsung</div>
      <button
        className="vd-reset"
        type="button"
        onClick={() => engine.current?.reset()}
        disabled={status !== 'ready'}
      >
        Reset
      </button>
      {status === 'ready' ? (
        <p className="vd-hint" aria-hidden="true">
          Geser untuk memutar <span>·</span> dobel klik untuk kembali
        </p>
      ) : null}
    </>
  );
}
