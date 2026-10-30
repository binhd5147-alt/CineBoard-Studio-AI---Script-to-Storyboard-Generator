import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Camera,
  Layers,
  Maximize2,
  Minimize2,
  Move,
  RefreshCw,
  Sliders,
  Sun,
  Video,
  Eye,
  CameraOff,
  Crosshair,
  Check,
} from 'lucide-react';
import { Shot } from '../types/storyboard';

interface ThreeStagePreVizProps {
  activeShot?: Shot | null;
  onApplyCameraToShot?: (cameraData: {
    shotType: string;
    focalLength: string;
    cameraMovement: string;
    framingNotes: string;
  }) => void;
}

export const ThreeStagePreViz: React.FC<ThreeStagePreVizProps> = ({
  activeShot,
  onApplyCameraToShot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focalLength, setFocalLength] = useState<number>(35); // mm
  const [cameraPreset, setCameraPreset] = useState<string>('Over-The-Shoulder');
  const [lightingPreset, setLightingPreset] = useState<'dramatic' | 'noir' | 'scifi' | 'daylight'>('dramatic');
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [actorPose, setActorPose] = useState<'standing' | 'action' | 'crouch'>('standing');
  const [capturedNotification, setCapturedNotification] = useState<boolean>(false);

  // Scene references kept in ref to decouple from React rendering
  const sceneContextRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    keyLight?: THREE.DirectionalLight;
    fillLight?: THREE.HemisphereLight;
    rimLight?: THREE.PointLight;
    actorGroup?: THREE.Group;
    cameraRigGroup?: THREE.Group;
    requestRender?: () => void;
  }>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene & Renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1117);
    scene.fog = new THREE.FogExp2(0x0e1117, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.8, 1.6, 3.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment map using PMREMGenerator & RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 2. OrbitControls with smooth damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going below ground
    controls.minDistance = 0.8;
    controls.maxDistance = 15;
    controls.target.set(0, 1.2, 0);
    controls.update();

    // 3. Lighting Rig (Warm Key, Cool Hemisphere Fill, Accent Rim)
    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.5);
    keyLight.position.set(4, 5, 3);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x7090b0, 0x1a202c, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 3.0, 10);
    rimLight.position.set(-2.5, 3.0, -2.5);
    scene.add(rimLight);

    // 4. Procedural Studio Soundstage Ground with Contact Shadow
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x161b22,
      roughness: 0.85,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Studio grid lines
    const gridHelper = new THREE.GridHelper(20, 20, 0x3b82f6, 0x222a38);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // Soft radial contact shadow plane under subjects
    const shadowGeo = new THREE.PlaneGeometry(2.5, 2.5);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,0.7)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(canvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.8,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.01;
    scene.add(contactShadow);

    // 5. Composite 3-12 Part Procedural Actor Mannequin (THREE.Group)
    // Assembles Torso, Pelvis, Limbs, Boots, Neck, Head/Visor, Cape/Vest, Accent
    const actorGroup = new THREE.Group();
    actorGroup.position.set(0, 0, 0);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.45,
      metalness: 0.2,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3,
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.75,
      metalness: 0.1,
    });
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.95,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
    });

    // Part 1: Torso
    const torsoGeo = new THREE.BoxGeometry(0.38, 0.48, 0.22);
    const torso = new THREE.Mesh(torsoGeo, bodyMat);
    torso.position.y = 1.25;
    torso.castShadow = !isSoftwareGl;
    actorGroup.add(torso);

    // Part 2: Pelvis
    const pelvisGeo = new THREE.BoxGeometry(0.32, 0.18, 0.2);
    const pelvis = new THREE.Mesh(pelvisGeo, jointMat);
    pelvis.position.y = 0.94;
    pelvis.castShadow = !isSoftwareGl;
    actorGroup.add(pelvis);

    // Part 3 & 4: Left & Right Legs
    const legGeo = new THREE.BoxGeometry(0.12, 0.45, 0.14);
    const leftLeg = new THREE.Mesh(legGeo, bodyMat);
    leftLeg.position.set(-0.11, 0.65, 0);
    leftLeg.castShadow = !isSoftwareGl;
    actorGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, bodyMat);
    rightLeg.position.set(0.11, 0.65, 0);
    rightLeg.castShadow = !isSoftwareGl;
    actorGroup.add(rightLeg);

    // Part 5 & 6: Boots
    const bootGeo = new THREE.BoxGeometry(0.13, 0.4, 0.18);
    const leftBoot = new THREE.Mesh(bootGeo, jointMat);
    leftBoot.position.set(-0.11, 0.2, 0.02);
    leftBoot.castShadow = !isSoftwareGl;
    actorGroup.add(leftBoot);

    const rightBoot = new THREE.Mesh(bootGeo, jointMat);
    rightBoot.position.set(0.11, 0.2, 0.02);
    rightBoot.castShadow = !isSoftwareGl;
    actorGroup.add(rightBoot);

    // Part 7 & 8: Arms
    const armGeo = new THREE.BoxGeometry(0.1, 0.46, 0.1);
    const leftArm = new THREE.Mesh(armGeo, bodyMat);
    leftArm.position.set(-0.27, 1.22, 0);
    leftArm.castShadow = !isSoftwareGl;
    actorGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, bodyMat);
    rightArm.position.set(0.27, 1.22, 0);
    rightArm.castShadow = !isSoftwareGl;
    actorGroup.add(rightArm);

    // Part 9: Head
    const headGeo = new THREE.BoxGeometry(0.22, 0.25, 0.22);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 1.62;
    head.castShadow = !isSoftwareGl;
    actorGroup.add(head);

    // Part 10: Cinematic Visor
    const visorGeo = new THREE.BoxGeometry(0.23, 0.08, 0.08);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.63, 0.1);
    actorGroup.add(visor);

    // Part 11: Tactical harness chest badge
    const chestPlateGeo = new THREE.BoxGeometry(0.26, 0.2, 0.05);
    const chestPlate = new THREE.Mesh(chestPlateGeo, accentMat);
    chestPlate.position.set(0, 1.3, 0.11);
    actorGroup.add(chestPlate);

    scene.add(actorGroup);

    // 6. Composite 3-12 Part Hollywood Camera Rig on Dolly Track
    const cameraRigGroup = new THREE.Group();
    cameraRigGroup.position.set(1.5, 0, 1.8);

    const metalDarkMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.85,
    });
    const goldRingMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.9,
    });
    const tallyLightMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.9,
    });

    // Part 1: Dolly track rails (two steel tubes)
    const trackGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.5, 12);
    const leftTrack = new THREE.Mesh(trackGeo, metalDarkMat);
    leftTrack.rotation.x = Math.PI / 2;
    leftTrack.position.set(-0.25, 0.02, 0);
    cameraRigGroup.add(leftTrack);

    const rightTrack = new THREE.Mesh(trackGeo, metalDarkMat);
    rightTrack.rotation.x = Math.PI / 2;
    rightTrack.position.set(0.25, 0.02, 0);
    cameraRigGroup.add(rightTrack);

    // Part 2: Wheeled dolly base
    const baseGeo = new THREE.BoxGeometry(0.65, 0.08, 0.5);
    const dollyBase = new THREE.Mesh(baseGeo, metalDarkMat);
    dollyBase.position.y = 0.06;
    dollyBase.castShadow = !isSoftwareGl;
    cameraRigGroup.add(dollyBase);

    // Part 3: Hydraulic pedestal column
    const colGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.8, 16);
    const column = new THREE.Mesh(colGeo, metalDarkMat);
    column.position.y = 0.5;
    column.castShadow = !isSoftwareGl;
    cameraRigGroup.add(column);

    // Part 4: Fluid pan/tilt head
    const headBaseGeo = new THREE.BoxGeometry(0.22, 0.12, 0.2);
    const headBase = new THREE.Mesh(headBaseGeo, metalDarkMat);
    headBase.position.y = 0.96;
    headBase.castShadow = !isSoftwareGl;
    cameraRigGroup.add(headBase);

    // Part 5: Hollywood Camera Body (Arri/Panavision style)
    const camBodyGeo = new THREE.BoxGeometry(0.24, 0.22, 0.38);
    const camBody = new THREE.Mesh(camBodyGeo, metalDarkMat);
    camBody.position.set(0, 1.12, 0);
    camBody.castShadow = !isSoftwareGl;
    cameraRigGroup.add(camBody);

    // Part 6: Matte Box (Lens sunshade)
    const matteGeo = new THREE.BoxGeometry(0.26, 0.2, 0.12);
    const matteBox = new THREE.Mesh(matteGeo, metalDarkMat);
    matteBox.position.set(0, 1.12, -0.25);
    cameraRigGroup.add(matteBox);

    // Part 7: Lens Barrel with gold focus ring
    const lensGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16);
    const lensMesh = new THREE.Mesh(lensGeo, metalDarkMat);
    lensMesh.rotation.x = Math.PI / 2;
    lensMesh.position.set(0, 1.12, -0.15);
    cameraRigGroup.add(lensMesh);

    const ringGeo = new THREE.TorusGeometry(0.072, 0.008, 8, 24);
    const focusRing = new THREE.Mesh(ringGeo, goldRingMat);
    focusRing.position.set(0, 1.12, -0.15);
    cameraRigGroup.add(focusRing);

    // Part 8: Operator monitor with red tally light
    const monitorGeo = new THREE.BoxGeometry(0.18, 0.14, 0.03);
    const monitor = new THREE.Mesh(monitorGeo, metalDarkMat);
    monitor.position.set(0.18, 1.25, 0.05);
    monitor.rotation.y = -0.4;
    cameraRigGroup.add(monitor);

    const tallyGeo = new THREE.BoxGeometry(0.04, 0.02, 0.02);
    const tally = new THREE.Mesh(tallyGeo, tallyLightMat);
    tally.position.set(0.18, 1.33, 0.05);
    cameraRigGroup.add(tally);

    // Part 9: Top handle & cheese plate
    const handleGeo = new THREE.BoxGeometry(0.04, 0.06, 0.24);
    const handle = new THREE.Mesh(handleGeo, metalDarkMat);
    handle.position.set(0, 1.26, 0);
    cameraRigGroup.add(handle);

    // Aim the camera rig toward the actor
    cameraRigGroup.lookAt(0, 1.2, 0);
    scene.add(cameraRigGroup);

    // 7. Store references
    sceneContextRef.current = {
      renderer,
      scene,
      camera,
      controls,
      keyLight,
      fillLight,
      rimLight,
      actorGroup,
      cameraRigGroup,
    };

    // 8. Render loop with software WebGL guard
    let frameId = 0;
    let isMounted = true;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (!isMounted) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (!isMounted) return;
      controls.update();

      // Subtle breath/idle animation for actor
      if (actorGroup) {
        const t = performance.now() * 0.0015;
        torso.position.y = 1.25 + Math.sin(t) * 0.01;
        head.position.y = 1.62 + Math.sin(t) * 0.01;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // 9. Resize observer
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      isMounted = false;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update focal length / FOV
  useEffect(() => {
    const { camera } = sceneContextRef.current;
    if (!camera) return;
    // Standard 35mm film sensor height: 24mm. FOV = 2 * atan(24 / (2 * focalLength))
    const fov = 2 * Math.atan(24 / (2 * focalLength)) * (180 / Math.PI);
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [focalLength]);

  // Handle camera presets (framing angles)
  const applyPreset = (presetName: string) => {
    const { camera, controls } = sceneContextRef.current;
    if (!camera || !controls) return;
    setCameraPreset(presetName);

    switch (presetName) {
      case 'Extreme Wide':
        camera.position.set(4.5, 2.2, 5.0);
        controls.target.set(0, 1.0, 0);
        setFocalLength(21);
        break;
      case 'Over-The-Shoulder':
        camera.position.set(1.4, 1.45, 1.7);
        controls.target.set(0, 1.35, 0);
        setFocalLength(40);
        break;
      case 'Hero Low-Angle':
        camera.position.set(0.9, 0.4, 1.6);
        controls.target.set(0, 1.4, 0);
        setFocalLength(28);
        break;
      case 'Close-Up Portrait':
        camera.position.set(0.6, 1.55, 1.1);
        controls.target.set(0, 1.55, 0);
        setFocalLength(75);
        break;
      case 'Dutch Angle':
        camera.position.set(1.2, 1.1, 1.8);
        controls.target.set(0, 1.3, 0);
        camera.rotation.z = 0.25;
        setFocalLength(35);
        break;
      case 'Bird\'s Eye View':
        camera.position.set(0.1, 4.8, 0.1);
        controls.target.set(0, 0, 0);
        setFocalLength(28);
        break;
      default:
        break;
    }
    controls.update();
  };

  // Handle lighting presets
  const applyLighting = (preset: 'dramatic' | 'noir' | 'scifi' | 'daylight') => {
    setLightingPreset(preset);
    const { keyLight, fillLight, rimLight, scene } = sceneContextRef.current;
    if (!keyLight || !fillLight || !rimLight || !scene) return;

    if (preset === 'noir') {
      keyLight.color.setHex(0xffffff);
      keyLight.intensity = 3.5;
      keyLight.position.set(3, 4, -2); // harsh side/back
      fillLight.intensity = 0.2; // deep shadows
      rimLight.intensity = 1.0;
      rimLight.color.setHex(0xfbbf24);
      scene.background = new THREE.Color(0x05070a);
    } else if (preset === 'scifi') {
      keyLight.color.setHex(0x38bdf8);
      keyLight.intensity = 2.2;
      fillLight.color.setHex(0xc084fc);
      fillLight.intensity = 1.4;
      rimLight.color.setHex(0x22c55e);
      rimLight.intensity = 4.0;
      scene.background = new THREE.Color(0x070b14);
    } else if (preset === 'daylight') {
      keyLight.color.setHex(0xfffaf0);
      keyLight.intensity = 2.8;
      keyLight.position.set(4, 7, 3);
      fillLight.color.setHex(0x93c5fd);
      fillLight.intensity = 1.6;
      rimLight.intensity = 0.5;
      scene.background = new THREE.Color(0x1e293b);
    } else {
      // dramatic (default)
      keyLight.color.setHex(0xffeedd);
      keyLight.intensity = 2.5;
      keyLight.position.set(4, 5, 3);
      fillLight.intensity = 1.2;
      rimLight.color.setHex(0x38bdf8);
      rimLight.intensity = 3.0;
      scene.background = new THREE.Color(0x0e1117);
    }
  };

  // Capture current 3D framing to apply to active storyboard shot
  const captureFraming = () => {
    if (!onApplyCameraToShot) return;
    const { camera } = sceneContextRef.current;
    let angleType = cameraPreset;
    if (camera && camera.position.y < 0.6) {
      angleType = 'LOW ANGLE HERO SHOT';
    } else if (camera && camera.position.y > 3.0) {
      angleType = 'HIGH BIRDS EYE ANGLE';
    }

    onApplyCameraToShot({
      shotType: angleType.toUpperCase(),
      focalLength: `${focalLength}mm Focal Length`,
      cameraMovement: 'Static 3D Blocked Framing',
      framingNotes: `Framed at ${focalLength}mm lens with ${lightingPreset} lighting rig. Camera positioned at (${camera?.position.x.toFixed(1)}, ${camera?.position.y.toFixed(1)}, ${camera?.position.z.toFixed(1)}).`,
    });

    setCapturedNotification(true);
    setTimeout(() => setCapturedNotification(false), 2400);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden bg-slate-950 flex flex-col select-none">
      {/* Top Spec Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3.5 py-2 shadow-lg backdrop-blur-none">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
          <Video className="w-3.5 h-3.5" />
          <span>3D Director's Viewfinder</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <span className="text-xs font-mono text-slate-300">
          Lens: <strong className="text-amber-400">{focalLength}mm</strong>
        </span>
        <div className="h-3 w-px bg-slate-700" />
        <span className="text-xs font-mono text-slate-400">
          Rig: <strong className="text-slate-200">{cameraPreset}</strong>
        </span>
      </div>

      {/* Top-Right Capture Action */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {capturedNotification && (
          <div className="flex items-center gap-1.5 bg-emerald-950/95 border border-emerald-500/50 text-emerald-300 text-xs px-3 py-1.5 rounded-lg shadow-md animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Framing applied to Shot!</span>
          </div>
        )}
        <button
          onClick={captureFraming}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-semibold text-xs px-3.5 py-2 rounded-lg shadow-lg shadow-orange-950/40 transition-transform active:scale-95"
          title="Attach current 3D framing and lens parameters to current storyboard shot"
        >
          <Crosshair className="w-4 h-4" />
          <span>Apply Framing to Shot</span>
        </button>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full flex-1 cursor-grab active:cursor-grabbing outline-none"
        title="Click and drag to orbit camera. Scroll to zoom. Right-click to pan."
      />

      {/* Collapsible Ergonomic Bottom Control Dock (Three.js Skill Directive: <= 15% viewport footprint, solid/rgba colors, no backdrop-filter over WebGL) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-4xl transition-all duration-300 ease-out">
        {/* Collapse / Expand Toggle Button */}
        <div className="flex justify-center -mb-2 relative z-30">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-[11px] font-medium px-3 py-1 rounded-t-md shadow-md transition-colors"
          >
            {isDockCollapsed ? (
              <>
                <Maximize2 className="w-3 h-3 text-cyan-400" />
                <span>Show Director Dock</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3 h-3 text-slate-400" />
                <span>Collapse Dock (Zen View)</span>
              </>
            )}
          </button>
        </div>

        {!isDockCollapsed && (
          <div className="bg-slate-900/98 border border-slate-800 rounded-xl p-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
            {/* Camera Presets Cluster */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
                <Camera className="w-3 h-3 text-cyan-400" />
                <span>Camera Angle Presets</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  'Over-The-Shoulder',
                  'Hero Low-Angle',
                  'Close-Up Portrait',
                  'Dutch Angle',
                  'Extreme Wide',
                  "Bird's Eye View",
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                      cameraPreset === preset
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Focal Length Slider */}
            <div className="flex flex-col gap-1.5 min-w-[160px]">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-amber-400" />
                  <span>Focal Length</span>
                </span>
                <span className="font-mono text-amber-300 text-xs">{focalLength}mm</span>
              </div>
              <input
                type="range"
                min="18"
                max="135"
                step="1"
                value={focalLength}
                onChange={(e) => setFocalLength(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>18mm (Wide)</span>
                <span>50mm (Norm)</span>
                <span>135mm (Tele)</span>
              </div>
            </div>

            {/* Lighting Mood Cluster */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
                <Sun className="w-3 h-3 text-yellow-400" />
                <span>Lighting Atmosphere</span>
              </span>
              <div className="flex gap-1">
                {(['dramatic', 'noir', 'scifi', 'daylight'] as const).map((mood) => (
                  <button
                    key={mood}
                    onClick={() => applyLighting(mood)}
                    className={`text-xs capitalize px-2.5 py-1 rounded-md font-medium transition-colors ${
                      lightingPreset === mood
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
