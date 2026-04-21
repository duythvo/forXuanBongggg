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
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      const deltaX = touchStartX - e.changedTouches[0].clientX;
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      // Only horizontal swipe (ignore vertical scrolling intent)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        deltaX > 0
          ? useStore.getState().nextScene()
          : useStore.getState().prevScene();
      }
    };
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  if (isMobile) {
    // Mobile: horizontal dots at bottom center with large touch targets
    return (
      <div
        style={{
          position: "fixed",
          bottom: "max(16px, env(safe-area-inset-bottom, 16px))",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "row",
          gap: 8,
          zIndex: 50,
          alignItems: "center",
          background: "rgba(10,6,20,0.35)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 30,
          padding: "6px 14px",
        }}
      >
        {SCENES.map(({ label, scene }) => (
          <button
            key={scene}
            onClick={() => setScene(scene)}
            aria-label={label}
            style={{
              minWidth: 44,
              height: 36,
              borderRadius: 18,
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: "0 6px",
              gap: 6,
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                width: currentScene === scene ? 8 : 5,
                height: currentScene === scene ? 8 : 5,
                borderRadius: "50%",
                background:
                  currentScene === scene ? "#f4c97a" : "rgba(255,255,255,0.35)",
                boxShadow:
                  currentScene === scene
                    ? "0 0 8px rgba(244,201,122,0.9), 0 0 20px rgba(244,201,122,0.4)"
                    : "none",
                transition: "all 0.3s ease",
                flexShrink: 0,
              }}
            />
            {currentScene === scene && (
              <span
                style={{
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  fontWeight: 300,
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(244,201,122,0.8)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

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
