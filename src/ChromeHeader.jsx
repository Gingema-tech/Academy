import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Preload, useGLTF, Center } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";

useGLTF.preload("/models/logo.glb");

function ChromeModel({ url }) {
  const group = useRef();
  const { scene } = useGLTF(url);

  const chromeMat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#eaf6ff"),
      metalness: 0.95,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      iridescence: 0.35,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [120, 420],
      emissive: new THREE.Color("#3ad3ff"),
      emissiveIntensity: 0.06,
      flatShading: false,
    });
    m.envMapIntensity = 1.45;
    return m;
  }, []);

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        if (obj.geometry) {
          obj.geometry.computeVertexNormals();
          obj.geometry.normalizeNormals();
        }
        obj.material = chromeMat;
        obj.castShadow = false;
        obj.receiveShadow = false;
      }
    });
  }, [scene, chromeMat]);

  useFrame((state, delta) => {
    const mx = state.pointer.x;
    const my = state.pointer.y;

    const targetY = mx * 0.7;
    const targetX = -my * 0.35;

    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 6, delta);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 6, delta);
    }
  });

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene} scale={5} />
      </Center>
    </group>
  );
}

function RendererSetup() {
  const { gl } = useThree();

  useEffect(() => {
    gl.setClearColor(0x000000, 0);
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 1.18;
  }, [gl]);

  return null;
}

export default function ChromeHeader({ modelUrl }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 35, near: 0.3, far: 20 }}
      dpr={[1, 2]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <RendererSetup />

      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 6, 4]} intensity={0.95} color="#cfe6ff" />
      <pointLight position={[0, -1.8, 2.2]} intensity={3.2} distance={12} color="#39ffd0" />
      <pointLight position={[-4, 1.5, 2]} intensity={1.8} distance={10} color="#2ab1ff" />

      <Suspense fallback={null}>
        <Environment preset="city" />
        <ChromeModel url={modelUrl} />
        <Preload all />
      </Suspense>

      <EffectComposer multisampling={8}>
        <Bloom mipmapBlur intensity={0.5} luminanceThreshold={0.4} luminanceSmoothing={0.72} />
        <Vignette eskil={false} offset={0.2} darkness={0.78} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
