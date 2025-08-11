"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { VRM, VRMUtils } from "@pixiv/three-vrm";

/**
 * Props:
 *  - audioElement: HTMLAudioElement (optional) — used for lip-sync analysis
 *  - modelPath: string (defaults to '/avatar.glb' or '/avatar.vrm')
 */

function AvatarMesh({ modelPath, audioAnalyser }) {
  const group = useRef();
  const vrmRef = useRef(null);
  const { scene } = useGLTF(modelPath, true);
  const [isVRM, setIsVRM] = useState(false);

  useEffect(() => {
    // try VRM conversion if file is *.vrm
    try {
      VRM.from(scene)
        .then((vrm) => {
          VRMUtils.removeUnnecessaryJoints(vrm.scene);
          vrm.scene.rotation.y = Math.PI;
          vrmRef.current = vrm;
          setIsVRM(true);
        })
        .catch(() => {
          // not a VRM, treat as normal GLB
          scene.rotation.y = Math.PI;
          vrmRef.current = { scene };
          setIsVRM(false);
        });
    } catch (e) {
      scene.rotation.y = Math.PI;
      vrmRef.current = { scene };
      setIsVRM(false);
    }
  }, [scene]);

  // Lip-sync mouth level based on audio volume
  const mouthLevel = useRef(0);
  useEffect(() => {
    if (!audioAnalyser) {
      mouthLevel.current = 0;
      return;
    }
    const data = new Uint8Array(audioAnalyser.frequencyBinCount);
    let raf = null;
    const loop = () => {
      audioAnalyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length / 255; // 0..1 volume average
      const target = Math.max(0, (avg - 0.02) * 3); // sensitivity tweak
      mouthLevel.current += (target - mouthLevel.current) * 0.3;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [audioAnalyser]);

  // Animations: blink, breathe, head tilt, lip-sync
  const blinkTimer = useRef(0);
  useFrame((state, delta) => {
    if (!vrmRef.current) return;

    // breathing: subtle up/down motion
    const breath = Math.sin(state.clock.elapsedTime * 0.8) * 0.01;
    vrmRef.current.scene.position.y = breath;

    // head subtle movement (if VRM humanoid bone exists)
    const head = vrmRef.current.humanoid?.getBoneNode?.("head");
    if (head) {
      head.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
      head.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }

    // blinking every ~3-6 seconds
    blinkTimer.current += delta;
    if (blinkTimer.current > 3.0) {
      const doBlink = Math.random() > 0.5;
      const blinkVal = doBlink ? 1 : 0;
      try {
        if (vrmRef.current.blendShapeProxy) {
          vrmRef.current.blendShapeProxy.setValue("Blink", blinkVal);
          vrmRef.current.blendShapeProxy.update();
        }
      } catch (e) {
        // ignore errors
      }
      blinkTimer.current = 0;
    }

    // lip-sync mouth shapes based on audio volume
    const m = mouthLevel.current;
    try {
      if (vrmRef.current.blendShapeProxy) {
        vrmRef.current.blendShapeProxy.setValue("A", Math.min(1, m * 1.1));
        vrmRef.current.blendShapeProxy.setValue("mouthOpen", Math.min(1, m * 1.3));
        vrmRef.current.blendShapeProxy.update();
      } else {
        // fallback: morphTargetInfluences for GLB mesh
        vrmRef.current.scene.traverse((c) => {
          if (c.isMesh && c.morphTargetInfluences) {
            c.morphTargetInfluences[0] = m;
          }
        });
      }
    } catch (e) {}
  });

  return <primitive ref={group} object={vrmRef.current ? vrmRef.current.scene : scene} />;
}

export default function AIAvatar3D({ audioElement = null, modelPath = "/avatar.glb" }) {
  // Create audio analyser from audio element
  const [analyser, setAnalyser] = useState(null);

  useEffect(() => {
    if (!audioElement) {
      setAnalyser(null);
      return;
    }
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const src = audioCtx.createMediaElementSource(audioElement);
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 512;
      src.connect(analyserNode);
      analyserNode.connect(audioCtx.destination);
      setAnalyser(analyserNode);
    } catch (e) {
      console.warn("Audio analyser setup failed:", e);
      setAnalyser(null);
    }
  }, [audioElement]);

  return (
    <div
      style={{
        width: "100%",
        height: 420,
        borderRadius: 12,
        overflow: "hidden",
        background: "linear-gradient(180deg,#eaf2ff,#ffffff)",
      }}
    >
      <Canvas camera={{ position: [0, 1.4, 3] }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[0, 5, 5]} intensity={0.8} />
        <AIAvatarWrapper modelPath={modelPath} audioAnalyser={analyser} />
        <OrbitControls enablePan={false} minDistance={1.8} maxDistance={6} />
      </Canvas>
    </div>
    
  );
}

// Wrapper for using useGLTF hook inside Canvas tree
function AIAvatarWrapper({ modelPath, audioAnalyser }) {
  return <AvatarMesh modelPath={modelPath} audioAnalyser={audioAnalyser} />;
}
