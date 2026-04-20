import { AnimatePresence, motion } from "framer-motion";
import GalaxyScene from "./components/Galaxy/GalaxyScene";
import IntroScreen from "./components/UI/IntroScreen";
import StarCard from "./components/UI/StarCard";
import FinalMessage from "./components/UI/FinalMessage";
import NavDots from "./components/UI/NavDots";
import TaurusBadge from "./components/UI/TaurusBadge";
import CursorGlow from "./components/UI/CursorGlow";
import AudioController from "./components/UI/AudioController";
import useStore from "./store/useStore";

function SceneHUD() {
  const currentScene = useStore((s) => s.currentScene);

  if (currentScene !== 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      style={{
        position: "fixed",
        bottom: 40,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <p
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 200,
          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#f4c97a",
          textShadow: "0 0 20px rgba(244,201,122,0.5)",
        }}
      >
        ✦ &nbsp; Bấm 5 ngôi sao để tạo chòm sao nhaaa &nbsp; ✦
      </p>
    </motion.div>
  );
}

export default function App() {
  const currentScene = useStore((s) => s.currentScene);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#050210",
      }}
    >
      {/* Always-present 3D galaxy canvas */}
      <GalaxyScene />

      {/* UI Layer — scene-conditional overlays */}
      <AnimatePresence mode="wait">
        {currentScene === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ position: "absolute", inset: 0, zIndex: 20 }}
          >
            <IntroScreen />
          </motion.div>
        )}

        {currentScene === 3 && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ position: "absolute", inset: 0, zIndex: 20 }}
          >
            <FinalMessage />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene 1 HUD hint */}
      <AnimatePresence>
        <SceneHUD />
      </AnimatePresence>

      {/* Memory card popup */}
      <StarCard />

      {/* Persistent UI */}
      {currentScene > 0 && (
        <>
          <NavDots />
          <TaurusBadge />
          <AudioController />
        </>
      )}

      {/* Custom cursor — always present */}
      <CursorGlow />
    </div>
  );
}
