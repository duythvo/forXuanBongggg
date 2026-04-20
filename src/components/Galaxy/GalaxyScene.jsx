import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveEvents, Preload } from "@react-three/drei";
import * as THREE from "three";
import StarField from "./StarField";
import Nebula from "./Nebula";
import ClickableStar from "./ClickableStar";
import ConstellationLines from "./ConstellationLines";
import TaurusConstellation from "./TaurusConstellation";
import { CONFIG } from "../../config/messages";
import AnimatedTaurusConstellation from "./AnimatedTaurusConstellation";
import { useMouseParallax } from "../../hooks/useMouseParallax";
import useStore from "../../store/useStore";

const isMobile = window.innerWidth <= 768;

function CameraController() {
  const { camera } = useThree();
  const { target, current } = useMouseParallax(0.8);
  const currentScene = useStore((s) => s.currentScene);
  const setCameraRef = useStore((s) => s.setCameraRef);
  const baseZ = useRef(8);

  useEffect(() => {
    setCameraRef(camera);
  }, [camera, setCameraRef]);

  // Scene-based Z targets
  useEffect(() => {
    const zMap = { 0: 14, 1: 8, 2: 8, 3: 14 };
    const target = zMap[currentScene] ?? 8;
    baseZ.current = target;
  }, [currentScene]);

  useFrame(({ clock }) => {
    // Lerp toward mouse parallax target
    current.current.x += (target.current.x - current.current.x) * 0.05;
    current.current.y += (target.current.y - current.current.y) * 0.05;

    // Idle drift (subtle sine wave)
    const drift = Math.sin(clock.elapsedTime * 0.125) * 0.1;

    camera.position.x = current.current.x;
    camera.position.y = current.current.y + drift;
    // Smooth Z toward scene target
    camera.position.z += (baseZ.current - camera.position.z) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function GalaxyScene() {
  const currentScene = useStore((s) => s.currentScene);
  const constellationAnimating = useStore((s) => s.constellationAnimating);
  const constellationComplete = useStore((s) => s.constellationComplete);
  const showAnimatedTaurus =
    currentScene === 2 && (constellationAnimating || constellationComplete);

  // Shake detection state
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!isMobile) return;
    let lastShake = 0;
    let shakeTimeout;
    function handleMotion(e) {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const magnitude = Math.sqrt(
        (acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2,
      );
      // Threshold: shake if magnitude > 18 (tune as needed)
      if (magnitude > 18 && Date.now() - lastShake > 1200) {
        setShake(true);
        lastShake = Date.now();
        clearTimeout(shakeTimeout);
        shakeTimeout = setTimeout(() => setShake(false), 900);
      }
    }
    window.addEventListener("devicemotion", handleMotion);
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      clearTimeout(shakeTimeout);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="absolute inset-0" style={{ zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 0, 14], fov: 75, near: 0.1, far: 200 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: "#050210" }}
      >
        <CameraController />

        {/* Ambient light - minimal, we rely on emissive/additive blending */}
        <ambientLight intensity={0.1} />
        <pointLight
          position={[0, 0, 0]}
          intensity={0.5}
          color="#9b72cf"
          distance={20}
        />

        <StarField count={isMobile ? 800 : 3000} />
        <Nebula count={isMobile ? 2 : 4} />
        {!showAnimatedTaurus && (
          <TaurusConstellation isMobile={isMobile} shake={shake} />
        )}

        {/* Constellation lines connecting clicked stars */}
        {currentScene === 1 && !showAnimatedTaurus && <ConstellationLines />}

        {/* Animated Taurus constellation - render trên cùng nền vũ trụ hiện tại */}
        {showAnimatedTaurus && (
          <AnimatedTaurusConstellation isMobile={isMobile} shake={shake} />
        )}

        {/* Clickable memory stars — only visible in scene 1 */}
        {currentScene >= 1 &&
          currentScene < 3 &&
          !showAnimatedTaurus &&
          CONFIG.stars.map((star) => (
            <ClickableStar key={star.id} star={star} />
          ))}

        <Preload all />
        <AdaptiveEvents />
      </Canvas>
    </div>
  );
}
