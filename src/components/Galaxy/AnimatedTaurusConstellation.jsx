import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useStore from "../../store/useStore";

// Taurus constellation represented by point coordinates + connecting segments
const TAURUS_STARS = [
  { pos: [-2.8, -0.25, -6], name: "Aldebaran" },
  { pos: [-2.15, 0.2, -6] },
  { pos: [-1.55, 0.72, -6] },
  { pos: [-0.95, 1.2, -6] },
  { pos: [-0.25, 1.55, -6], name: "Elnath" },
  { pos: [-1.45, -0.38, -6] },
  { pos: [-0.8, -0.82, -6] },
  { pos: [-0.12, -1.18, -6] },
  { pos: [0.42, -0.82, -6], name: "Alcyone" },
  { pos: [0.86, -0.52, -6] },
  { pos: [1.2, -0.16, -6] },
  { pos: [1.42, 0.2, -6] },
];

const TAURUS_LINES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [2, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [10, 11],
];

export default function AnimatedTaurusConstellation({
  isMobile = false,
  shake = false,
}) {
  const groupRef = useRef();
  const scale = isMobile ? 1.1 : 1.7;
  const starsRef = useRef([]);
  const linesRef = useRef([]);
  const [animationProgress, setAnimationProgress] = useState(0);
  const constellationAnimating = useStore((s) => s.constellationAnimating);
  const setConstellationAnimating = useStore(
    (s) => s.setConstellationAnimating,
  );
  const setConstellationComplete = useStore((s) => s.setConstellationComplete);

  // Trigger animation when scene changes
  useEffect(() => {
    if (!constellationAnimating) return;

    setAnimationProgress(0);
    const animationStart = Date.now();
    const totalDuration = 3500; // 3.5 seconds total

    const animate = () => {
      const elapsed = Date.now() - animationStart;
      const progress = Math.min(elapsed / totalDuration, 1);
      setAnimationProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setConstellationAnimating(false);
        setConstellationComplete(true);
      }
    };

    animate();
  }, [
    constellationAnimating,
    setConstellationAnimating,
    setConstellationComplete,
  ]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (shake) {
      groupRef.current.rotation.z += 0.18;
    } else {
      groupRef.current.rotation.z = Math.sin(Date.now() * 0.00008) * 0.04;
    }

    // Phase 1: Fade in stars (0 - 0.4 of progress)
    if (animationProgress < 0.4) {
      const phaseProgress = animationProgress / 0.4;
      starsRef.current.forEach((star, i) => {
        if (star) {
          const delay = (i / TAURUS_STARS.length) * 0.3;
          const starProgress = Math.max(0, phaseProgress - delay);

          star.material.opacity = Math.min(starProgress * 1.5, 1);

          const pulse = 0.08 + Math.sin(clock.elapsedTime * 2 + i) * 0.03;
          star.scale.setScalar(1 + pulse * starProgress);

          star.material.emissiveIntensity = 0.7 + starProgress * 0.5;
        }
      });
    } else {
      starsRef.current.forEach((star, i) => {
        if (star) {
          const pulse = 0.08 + Math.sin(clock.elapsedTime * 2 + i) * 0.03;
          star.material.opacity = 1;
          star.scale.setScalar(1 + pulse);
          star.material.emissiveIntensity = 1.2;
        }
      });
    }

    // Phase 2: Draw lines (0.4 - 0.9 of progress)
    if (animationProgress >= 0.4) {
      const linePhaseProgress = (animationProgress - 0.4) / 0.5;
      linesRef.current.forEach((line, i) => {
        if (line) {
          const delay = (i / TAURUS_LINES.length) * 0.4;
          const lineProgress = Math.max(0, linePhaseProgress - delay);

          line.material.opacity = Math.min(lineProgress * 1.2, 1);
          line.material.linewidth = 2 + lineProgress * 2;
        }
      });
    }

    // Phase 3: Final glow (0.9 - 1.0 of progress)
    if (animationProgress >= 0.9) {
      const finalProgress = (animationProgress - 0.9) / 0.1;
      const glow = Math.sin(finalProgress * Math.PI) * 0.2;

      linesRef.current.forEach((line) => {
        if (line) {
          line.material.opacity = 1 + glow;
        }
      });

      starsRef.current.forEach((star) => {
        if (star) {
          star.material.emissiveIntensity = 1.2 + glow * 0.5;
        }
      });
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} position={[0, 0.3, 0]}>
      {/* Constellation lines */}
      {TAURUS_LINES.map(([a, b], i) => {
        const start = new THREE.Vector3(...TAURUS_STARS[a].pos);
        const end = new THREE.Vector3(...TAURUS_STARS[b].pos);
        const points = [start, end];
        const geo = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <line
            key={`line-${i}`}
            ref={(ref) => {
              if (ref) linesRef.current[i] = ref;
            }}
            geometry={geo}
          >
            <lineBasicMaterial
              color="#f4c97a"
              transparent
              opacity={0}
              linewidth={2}
              blending={THREE.AdditiveBlending}
            />
          </line>
        );
      })}

      {/* Star points */}
      {TAURUS_STARS.map((star, i) => (
        <mesh
          key={`star-${i}`}
          ref={(ref) => {
            if (ref) starsRef.current[i] = ref;
          }}
          position={star.pos}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial
            color="#f4c97a"
            transparent
            opacity={0}
            emissive="#f4c97a"
            emissiveIntensity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}
