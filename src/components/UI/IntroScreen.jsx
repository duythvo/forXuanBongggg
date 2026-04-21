import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import useStore from "../../store/useStore";
import { CONFIG } from "../../config/messages";
import { initAudio } from "./AudioController";

export default function IntroScreen() {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const containerRef = useRef();
  const headingRef = useRef();
  const subtitleRef = useRef();
  const btnRef = useRef();
  const setScene = useStore((s) => s.setScene);

  useEffect(() => {
    const tl = gsap.timeline();

    gsap.set([headingRef.current, subtitleRef.current, btnRef.current], {
      opacity: 0,
      y: 20,
    });
    gsap.set(containerRef.current, { opacity: 0 });

    tl.to(
      containerRef.current,
      { opacity: 1, duration: 1.5, ease: "power2.out" },
      0,
    )
      .to(
        headingRef.current,
        { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
        2.5,
      )
      .to(
        subtitleRef.current,
        { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" },
        3.5,
      )
      .to(
        btnRef.current,
        { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.2)" },
        4.5,
      );

    return () => tl.kill();
  }, []);

  const handleEnter = () => {
    // Unlock audio context by user gesture, but do not play music yet.
    initAudio();
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => setScene(1),
    });
  };

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 sm:px-6"
      style={{
        zIndex: 20,
        background:
          "radial-gradient(ellipse at center, rgba(26,8,69,0.3) 0%, rgba(5,2,16,0.7) 100%)",
        paddingTop: "max(8vh, 2rem)",
        paddingBottom: "max(8vh, 2rem)",
      }}
      initial={{ opacity: 0 }}
    >
      {/* Top banner */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "0.6rem",
          letterSpacing: "0.55em",
          textTransform: "uppercase",
          color: "rgba(155,114,207,0.6)",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 200,
          whiteSpace: "nowrap",
        }}
      ></div>

      {/* Main Heading */}
      <h1
        ref={headingRef}
        style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontWeight: 400,
          color: "#f5f0ff",
          textShadow:
            "0 0 80px rgba(155,114,207,0.8), 0 2px 30px rgba(155,114,207,0.4)",
          lineHeight: 1.5,
          maxWidth: isMobile ? "95vw" : 900,
          marginBottom: "1.2rem",
          marginLeft: "auto",
          marginRight: "auto",
          whiteSpace: "normal",
          overflow: "visible",
          textOverflow: "clip",
          display: "-webkit-box",
          WebkitLineClamp: isMobile ? "unset" : 2,
          WebkitBoxOrient: "vertical",
          fontSize: "clamp(1.45rem, 3.8vw, 2.1rem)",
        }}
      >
        {isMobile ? (
          <>
            Ở đâu đó trong vũ trụ này... <br />{" "}
            <span
              style={{
                color: "#f4c97a",
                textShadow: "0 0 60px rgba(244,201,122,0.5)",
              }}
            >
              có câu chuyện dành riêng cho B aaaa
            </span>
          </>
        ) : (
          <>
            Ở đâu đó trong vũ trụ này...<br />{" "}
            <span
              style={{
                color: "#f4c97a",
                textShadow: "0 0 60px rgba(244,201,122,0.5)",
              }}
            >
              có câu chuyện dành riêng cho B aaaa
            </span>
          </>
        )}
      </h1>

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 200,
          fontSize: "clamp(1rem, 3vw, 1.25rem)",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          marginBottom: "2.2rem",
          maxWidth: 340,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      ></p>

      {/* CTA Button */}
      <button
        ref={btnRef}
        onClick={handleEnter}
        style={{
          background: "transparent",
          border: "2px solid rgba(244,201,122,0.6)",
          borderRadius: 40,
          padding: "14px 32px",
          color: "#f4c97a",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 400,
          fontSize: "clamp(0.82rem, 2vw, 1.05rem)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          cursor: isMobile ? "pointer" : "none",
          touchAction: "manipulation",
          transition: "all 0.4s ease",
          textShadow: "0 0 10px rgba(244,201,122,0.3)",
          marginBottom: "1.5rem",
        }}
        onMouseEnter={(e) => {
          gsap.to(e.currentTarget, {
            boxShadow:
              "0 0 30px rgba(244,201,122,0.3), inset 0 0 30px rgba(244,201,122,0.05)",
            duration: 0.3,
          });
        }}
        onMouseLeave={(e) => {
          gsap.to(e.currentTarget, {
            boxShadow: "none",
            duration: 0.3,
          });
        }}
      >
        Bước vào vũ trụ của B tại đâyyyyy
      </button>

      {/* Bottom decorative */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          fontSize: "clamp(0.65rem, 1.6vw, 0.85rem)",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "rgba(244,201,122,0.25)",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 200,
        }}
      ></div>
    </motion.div>
  );
}
