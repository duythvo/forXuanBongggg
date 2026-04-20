import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import useStore from "../../store/useStore";

const SCENES = [
  { label: "Ngân Hà", scene: 0 },
  { label: "Ký Ức", scene: 1 },
  { label: "Sinh Nhật", scene: 3 },
];

export default function NavDots() {
  const currentScene = useStore((s) => s.currentScene);
  const setScene = useStore((s) => s.setScene);
  const tooltipRefs = useRef([]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        useStore.getState().nextScene();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        useStore.getState().prevScene();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Touch swipe support
  useEffect(() => {
    let touchStartX = 0;
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 50) {
        delta > 0
          ? useStore.getState().nextScene()
          : useStore.getState().prevScene();
      }
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        right: 28,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        zIndex: 50,
      }}
    >
      {SCENES.map(({ label, scene }, i) => (
        <div
          key={scene}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={() => {
            if (tooltipRefs.current[i]) {
              gsap.to(tooltipRefs.current[i], {
                opacity: 1,
                x: 0,
                duration: 0.25,
              });
            }
          }}
          onMouseLeave={() => {
            if (tooltipRefs.current[i]) {
              gsap.to(tooltipRefs.current[i], {
                opacity: 0,
                x: 6,
                duration: 0.2,
              });
            }
          }}
        >
          {/* Tooltip */}
          <div
            ref={(el) => (tooltipRefs.current[i] = el)}
            style={{
              position: "absolute",
              right: "100%",
              marginRight: 12,
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontWeight: 200,
              fontSize: "0.68rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
              whiteSpace: "nowrap",
              opacity: 0,
              transform: "translateX(6px)",
              pointerEvents: "none",
            }}
          >
            {label}
          </div>

          {/* Dot */}
          <button
            onClick={() => setScene(scene)}
            style={{
              width: currentScene === scene ? 8 : 6,
              height: currentScene === scene ? 8 : 6,
              borderRadius: "50%",
              border: "none",
              background:
                currentScene === scene ? "#f4c97a" : "rgba(255,255,255,0.2)",
              boxShadow:
                currentScene === scene
                  ? "0 0 8px rgba(244,201,122,0.8), 0 0 20px rgba(244,201,122,0.3)"
                  : "none",
              cursor: "none",
              transition: "all 0.3s ease",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              if (currentScene !== scene) {
                e.currentTarget.style.background = "rgba(255,255,255,0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentScene !== scene) {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }
            }}
          />
        </div>
      ))}
    </div>
  );
}
