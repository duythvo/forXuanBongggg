import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";
import useStore from "../../store/useStore";
import { getMobilePosition } from "../../utils/mobileCoords";

export default function ClickableStar({ star }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  // Nhấp đôi kích thước trên cả mobile lẫn PC
  let position = star.position;
  if (isMobile) {
    position = getMobilePosition(star.id, star.position);
  }
  
  // Tỉ lệ gốc: PC là 1.0 (nhỏ, thanh lịch), Mobile là 1.5 (bự dễ bấm)
  const baseScale = isMobile ? 1.5 : 1.0;
  
  const meshRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);
  const setOpenCard = useStore((s) => s.setOpenCard);
  const setCursorState = useStore((s) => s.setCursorState);
  const addClickedStar = useStore((s) => s.addClickedStar);
  const clickedStars = useStore((s) => s.clickedStars);
  const setPendingFinalTransition = useStore(
    (s) => s.setPendingFinalTransition,
  );
  const pulseOffset = useRef(Math.random() * Math.PI * 2);

  const [isClicked, setIsClicked] = useState(false);
  const isHighlighted = hovered || isClicked;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    const pulse = Math.sin(t * 1.2 + pulseOffset.current) * 0.08 + 1.0;

    if (!hovered) {
      meshRef.current.scale.setScalar(pulse);
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(
        (hovered ? 2.4 : 1.8) + Math.sin(t * 2 + pulseOffset.current) * 0.15,
      );
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    setCursorState("hover-star");
    gsap.to(meshRef.current.scale, {
      x: baseScale * 1.2,
      y: baseScale * 1.2,
      z: baseScale * 1.2,
      duration: 0.3,
      ease: "back.out(2)",
    });
    gsap.to(meshRef.current.material, {
      emissiveIntensity: 1.5,
      duration: 0.3,
    });
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    setCursorState("default");
    
    // Nếu đã click thì giữ to, nếu chưa thì trả về gốc
    const targetScale = isClicked ? baseScale * 1.4 : baseScale;
    
    gsap.to(meshRef.current.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: 0.4,
      ease: "power2.out",
    });
    gsap.to(meshRef.current.material, {
      emissiveIntensity: isClicked ? 1.5 : 0.6,
      duration: 0.4,
    });
  };

  const handleClick = (e) => {
    e.stopPropagation();

    if (isClicked) {
      setOpenCard(star);
      return;
    }

    // Spike animation
    gsap
      .timeline()
      .to(meshRef.current.scale, {
        x: baseScale * 2.5,
        y: baseScale * 2.5,
        z: baseScale * 2.5,
        duration: 0.1,
        ease: "power2.out",
      })
      .to(meshRef.current.scale, {
        x: baseScale * 1.4,
        y: baseScale * 1.4,
        z: baseScale * 1.4,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)",
      });

    addClickedStar(star.id);

    // Lock this star to the same golden tone as hover state
    gsap.to(meshRef.current.material, {
      emissive: new THREE.Color("#f4c97a"),
      emissiveIntensity: 1.5,
      duration: 0.4,
      ease: "power2.out",
    });

    setIsClicked(true);

    // Mark final transition to run after the last star modal countdown ends.
    if (clickedStars.length >= 4) {
      setPendingFinalTransition(true);
    }

    setOpenCard(star);
  };

  return (
    <group position={position}>
      {/* Outer glow ring (additive, luminous) */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[isMobile ? 0.45 : 0.28, 16, 16]} />
        <meshBasicMaterial
          color={isHighlighted ? "#f4c97a" : "#9b72cf"}
          transparent
          opacity={isHighlighted ? 0.25 : 0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Core star */}
      <mesh ref={meshRef} scale={[baseScale, baseScale, baseScale]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color={isHighlighted ? "#ffe8b0" : "#d4b8ff"}
          emissive={isHighlighted ? "#f4c97a" : "#7b52af"}
          emissiveIntensity={isHighlighted ? 2.5 : 1.2}
          roughness={0}
          metalness={0.1}
        />
      </mesh>

      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={handleClick}
      >
        <sphereGeometry args={[isMobile ? 0.7 : 0.4, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Sparkle rays on hover */}
      {hovered && (
        <Html center style={{ pointerEvents: "none" }}>
          <div
            style={{
              width: 40,
              height: 40,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {[0, 90, 180, 270].map((deg) => (
              <div
                key={deg}
                style={{
                  position: "absolute",
                  width: 1,
                  height: 16,
                  background:
                    "linear-gradient(to top, transparent, rgba(244,201,122,0.8))",
                  transform: `rotate(${deg}deg) translateY(-8px)`,
                  borderRadius: 1,
                }}
              />
            ))}
          </div>
        </Html>
      )}
    </group>
  );
}
