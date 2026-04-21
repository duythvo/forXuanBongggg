import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useStore from "../../store/useStore";
import { CONFIG } from "../../config/messages";

export default function ConstellationLines() {
  const lineRef = useRef();
  const clickedStars = useStore((s) => s.clickedStars);

  const { positions, colors } = useMemo(() => {
    const positions = [];
    const colors = [];

    if (clickedStars.length < 2) {
      return { positions: new Float32Array(0), colors: new Float32Array(0) };
    }

    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

    // Get star positions from CONFIG
    const starMap = {};
    CONFIG.stars.forEach((star) => {
      if (isMobile) {
        const [x, y, z] = star.position;
        starMap[star.id] = [x * 0.68, y * 0.68, z];
      } else {
        starMap[star.id] = star.position;
      }
    });

    // Draw lines between consecutive clicked stars
    for (let i = 0; i < clickedStars.length - 1; i++) {
      const id1 = clickedStars[i];
      const id2 = clickedStars[i + 1];

      const pos1 = starMap[id1];
      const pos2 = starMap[id2];

      if (pos1 && pos2) {
        positions.push(...pos1, ...pos2);

        // Gradient color effect
        colors.push(0.98, 0.78, 0.48, 0.98, 0.78, 0.48); // Gold color
      }
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    };
  }, [clickedStars]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    if (positions.length > 0) {
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    }
    return geo;
  }, [positions]);

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0xf4c97a,
      linewidth: 3,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame(({ clock }) => {
    if (lineRef.current && clickedStars.length > 0) {
      // Pulsing effect
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.2 + 0.8;
      lineRef.current.material.opacity = pulse;
    }
  });

  return <line ref={lineRef} geometry={geometry} material={material} />;
}
