import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Preload, useGLTF, Center } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

useGLTF.preload("/models/logo.glb");

function ChromeModel({ url }) {
  const group = useRef();
  const { scene } = useGLTF(url);

  const chromeMat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#ffffff"),
      metalness: 1,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      flatShading: false,
    });
    m.envMapIntensity = 1.6;
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
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
  }, [gl]);

  return null;
}

export default function ChromeHeader({ modelUrl }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 35, near: 0.1, far: 30 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <RendererSetup />

      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 6, 4]} intensity={1.2} />

      <Suspense fallback={null}>
        <Environment preset="studio" />
        <ChromeModel url={modelUrl} />
        <Preload all />
      </Suspense>

      <EffectComposer multisampling={4}>
        <Bloom intensity={0.18} luminanceThreshold={0.75} luminanceSmoothing={0.3} />
        <Vignette eskil={false} offset={0.25} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  );
}
