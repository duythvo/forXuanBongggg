import { useEffect } from "react";
import { motion } from "framer-motion";
import useStore from "../../store/useStore";

export default function NameConstellation() {
  const currentScene = useStore((s) => s.currentScene);
  const constellationComplete = useStore((s) => s.constellationComplete);
  const setScene = useStore((s) => s.setScene);

  useEffect(() => {
    if (currentScene !== 2 || !constellationComplete) return;

    const timer = setTimeout(() => {
      setScene(3);
    }, 5000);

    return () => clearTimeout(timer);
  }, [constellationComplete, currentScene, setScene]);

  return (
    <div
      className="absolute inset-0 flex items-end justify-center px-6 pb-16"
      style={{ zIndex: 20, pointerEvents: "none" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{
          opacity: constellationComplete ? 1 : 0,
          y: constellationComplete ? 0 : 24,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          maxWidth: 720,
          textAlign: "center",
          color: "#f5f0ff",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          textShadow: "0 0 28px rgba(244,201,122,0.35)",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            fontSize: "clamp(1.05rem, 2.4vw, 1.4rem)",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "#f4c97a",
            marginBottom: "0.7rem",
          }}
        >
          ✨ Chòm Sao Kim Ngưu ✨
        </div>
        <div
          style={{
            fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
            fontWeight: 400,
            lineHeight: 1.7,
            letterSpacing: "0.02em",
          }}
        >
          Em là chòm sao bền bỉ và ấm áp nhất trong bầu trời của anh,
          <br />
          càng nhìn càng thấy rực rỡ và dịu dàng.
        </div>
      </motion.div>
    </div>
  );
}
