import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { STAR_POSITIONS } from "../../config/starPositions";

// Shared Taurus star positions
const TAURUS_STARS = STAR_POSITIONS.map((pos, i) => ({ pos, name: undefined }));
TAURUS_STARS[0].name = "Aldebaran";
TAURUS_STARS[4].name = "Elnath";
TAURUS_STARS[7].name = "Alcyone";

const TAURUS_LINES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [2, 5],
  [5, 6],
  [6, 7],
];

export default function TaurusConstellation({
  isMobile = false,
  shake = false,
}) {
  const groupRef = useRef();
  // Không scale group nữa, scale trực tiếp từng điểm
  let scaleX = 1.0,
    scaleY = 1.0;
  if (isMobile && typeof window !== "undefined") {
    // Tỉ lệ chuẩn trên PC là 16:9, trên mobile thường là 9:16 hoặc 9:19
    const baseRatio = 16 / 9;
    const currentRatio = window.innerWidth / window.innerHeight;
    scaleX = 0.7 * (currentRatio / baseRatio);
    scaleY = 0.7;
  }
  useFrame(() => {
    if (groupRef.current) {
      if (shake) {
        // Rotate quickly when shake
        groupRef.current.rotation.z += 0.18;
      } else {
        // Normal idle drift
        groupRef.current.rotation.z = Math.sin(Date.now() * 0.00008) * 0.04;
      }
    }
  });

  const lineOpacity = 0.12;

  return (
    <group ref={groupRef}>
      {/* Constellation lines */}
      {TAURUS_LINES.map(([a, b], i) => {
        // Scale từng điểm
        const [x1, y1, z1] = TAURUS_STARS[a].pos;
        const [x2, y2, z2] = TAURUS_STARS[b].pos;
        const start = new THREE.Vector3(x1 * scaleX, y1 * scaleY, z1);
        const end = new THREE.Vector3(x2 * scaleX, y2 * scaleY, z2);
        const points = [start, end];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={i} geometry={geo}>
            <lineBasicMaterial
              color="#9b72cf"
              transparent
              opacity={lineOpacity}
            />
          </line>
        );
      })}

      {/* Star points */}
      {TAURUS_STARS.map((star, i) => {
        const [x, y, z] = star.pos;
        return (
          <mesh key={i} position={[x * scaleX, y * scaleY, z]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#c8b0ff" transparent opacity={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}
