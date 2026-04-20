import { useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import useStore from "../../store/useStore";

export default function StarCard() {
  const openCard = useStore((s) => s.openCard);
  const closeCard = useStore((s) => s.closeCard);
  const setScene = useStore((s) => s.setScene);
  const cameraRef = useStore((s) => s.cameraRef);
  const pendingFinalTransition = useStore((s) => s.pendingFinalTransition);
  const setPendingFinalTransition = useStore(
    (s) => s.setPendingFinalTransition,
  );
  const timerRef = useRef(null);
  const finalDelayRef = useRef(null);

  const readingMeta = useMemo(() => {
    if (!openCard) {
      return { readSeconds: 8 };
    }

    const fullText = `${openCard.title || ""} ${openCard.message || ""}`.trim();
    const words = fullText.match(/\S+/g) || [];
    const wordCount = words.length;

    // Vietnamese reading speed baseline: ~180 words/minute.
    const secondsByWords = (wordCount / 180) * 60;
    const readSeconds = Math.max(
      8,
      Math.min(24, Math.round(secondsByWords + 4)),
    );

    return {
      readSeconds,
    };
  }, [openCard]);

  const scheduleFinalTransition = () => {
    if (!pendingFinalTransition) return;

    if (finalDelayRef.current) {
      clearTimeout(finalDelayRef.current);
    }

    finalDelayRef.current = setTimeout(() => {
      setPendingFinalTransition(false);
      setScene(3);
    }, 2000);
  };

  const handleCloseCard = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    closeCard();
    scheduleFinalTransition();
  };

  const cardPosition = useMemo(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 14;
    const cardWidth = Math.min(520, vw - margin * 2);
    const cardHeight = Math.min(500, vh - margin * 2);

    const fallback = {
      left: Math.max((vw - cardWidth) / 2, margin),
      top: Math.max((vh - cardHeight) / 2, margin),
      width: cardWidth,
      maxHeight: cardHeight,
    };

    if (!openCard || !cameraRef) {
      return fallback;
    }

    const projected = new THREE.Vector3(...openCard.position).project(
      cameraRef,
    );
    const starX = (projected.x * 0.5 + 0.5) * vw;
    const starY = (-projected.y * 0.5 + 0.5) * vh;

    // Pull the card a bit toward the viewport center so it stays readable,
    // while still staying anchored near the selected star.
    const centerBias = 0.3;
    const preferredCenterX = starX + (vw / 2 - starX) * centerBias;
    const preferredCenterY = starY + (vh / 2 - starY) * centerBias;

    const left = Math.min(
      Math.max(preferredCenterX - cardWidth / 2, margin),
      vw - cardWidth - margin,
    );
    const top = Math.min(
      Math.max(preferredCenterY - cardHeight / 2, margin),
      vh - cardHeight - margin,
    );

    return {
      left,
      top,
      width: cardWidth,
      maxHeight: cardHeight,
    };
  }, [openCard, cameraRef]);

  useEffect(() => {
    if (openCard) {
      timerRef.current = setTimeout(
        handleCloseCard,
        readingMeta.readSeconds * 1000,
      );
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [openCard, readingMeta.readSeconds]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (finalDelayRef.current) clearTimeout(finalDelayRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {openCard && (
        <motion.div
          key={openCard.id}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{
            position: "fixed",
            ...cardPosition,
            background: "rgba(10, 6, 20, 0.92)",
            border: "1px solid rgba(155,114,207,0.4)",
            borderRadius: 18,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow:
              "0 0 60px rgba(155,114,207,0.15), 0 20px 60px rgba(0,0,0,0.6)",
            padding: "2.6rem 2.5rem 2.8rem",
            overflowY: "auto",
            zIndex: 100,
          }}
        >
          {/* Close button */}
          <button
            onClick={handleCloseCard}
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.5)",
              fontSize: 15,
              cursor: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f4c97a")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
            }
          >
            ✕
          </button>

          {/* Emoji */}
          <div style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>
            {openCard.emoji}
          </div>

          {/* Title */}
          <h3
            style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: "1.9rem",
              color: "#f4c97a",
              textShadow: "0 0 20px rgba(244,201,122,0.3)",
              marginBottom: "1rem",
              lineHeight: 1.5,
            }}
          >
            {openCard.title}
          </h3>

          {/* Message */}
          <p
            style={{
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontWeight: 500,
              fontSize: "1.22rem",
              lineHeight: 2,
              letterSpacing: "0.008em",
              color: "rgba(245,240,255,0.94)",
            }}
          >
            {openCard.message}
          </p>

          {/* Auto-close progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: readingMeta.readSeconds, ease: "linear" }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 2,
              width: "100%",
              borderRadius: "0 0 18px 18px",
              background: "linear-gradient(to right, #9b72cf, #f4c97a)",
              transformOrigin: "left",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
