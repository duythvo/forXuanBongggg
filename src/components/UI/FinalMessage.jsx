import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import useStore from "../../store/useStore";
import { CONFIG } from "../../config/messages";

function ParticleBurst() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#f4c97a", "#e8a4c0", "#9b72cf", "#c8d8ff", "#ffffff"];
    const particles = Array.from({ length: 120 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 2,
      life: 1,
      decay: 0.008 + Math.random() * 0.015,
      size: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let alive = true;
    const loop = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.life -= p.decay;
        if (p.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });
      if (particles.some((p) => p.life > 0)) {
        requestAnimationFrame(loop);
      }
    };
    loop();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
}

export default function FinalMessage() {
  const setScene = useStore((s) => s.setScene);
  const resetClickedStars = useStore((s) => s.resetClickedStars);
  const setConstellationAnimating = useStore(
    (s) => s.setConstellationAnimating,
  );
  const setConstellationComplete = useStore((s) => s.setConstellationComplete);
  const setPendingFinalTransition = useStore(
    (s) => s.setPendingFinalTransition,
  );
  const setOpenCard = useStore((s) => s.setOpenCard);
  const emojiRef = useRef();
  const line1Ref = useRef();
  const nameRef = useRef();
  const line2Ref = useRef();
  const line3Ref = useRef();
  const dateRef = useRef();
  const btnRef = useRef();
  const [showParticles, setShowParticles] = useState(false);
  const currentScene = useStore((s) => s.currentScene);

  useEffect(() => {
    if (currentScene !== 3) return;

    gsap.set(
      [
        emojiRef.current,
        line1Ref.current,
        nameRef.current,
        line2Ref.current,
        line3Ref.current,
        dateRef.current,
        btnRef.current,
      ],
      {
        opacity: 0,
        y: 20,
      },
    );
    gsap.set(emojiRef.current, { y: -30 });

    const tl = gsap.timeline({ delay: 0.5 });
    tl.to(
      emojiRef.current,
      { opacity: 1, y: 0, duration: 0.8, ease: "bounce.out" },
      0,
    )
      .to(
        line1Ref.current,
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        0.5,
      )
      .to(
        nameRef.current,
        { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
        1.0,
      )
      .to(
        line2Ref.current,
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        1.5,
      )
      .to(
        line3Ref.current,
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        1.9,
      )
      .to(
        dateRef.current,
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        2.4,
      )
      .call(() => setShowParticles(true), null, 2.8)
      .to(
        btnRef.current,
        { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.2)" },
        3.5,
      );

    return () => tl.kill();
  }, [currentScene]);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
      style={{
        zIndex: 20,
        background:
          "radial-gradient(ellipse at center, rgba(10,6,20,0.22) 0%, rgba(5,2,12,0.58) 100%)",
      }}
    >
      {showParticles && <ParticleBurst />}

      {/* Emoji */}
      <div
        ref={emojiRef}
        style={{
          fontSize: "3.5rem",
          marginBottom: "1.2rem",
          filter: "drop-shadow(0 0 20px rgba(244,201,122,0.5))",
        }}
      >
        🎂
      </div>

      {/* Chúc mừng sinh nhật */}
      <p
        ref={line1Ref}
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 300,
          fontSize: "clamp(2rem, 5.4vw, 3rem)",
          color: "#f4c97a",
          marginBottom: "0.25rem",
          letterSpacing: "0.05em",
          textShadow: "0 0 15px rgba(244,201,122,0.4)",
        }}
      >
        Happy Birthdayyy,
      </p>

      {/* Name */}
      <h1
        ref={nameRef}
        style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: "clamp(2.8rem, 9vw, 5rem)",
          color: "#f4c97a",
          textShadow:
            "0 0 100px rgba(244,201,122,0.5), 0 0 40px rgba(244,201,122,0.3)",
          marginBottom: "2rem",
          letterSpacing: "0.04em",
          lineHeight: 1.1,
        }}
      >
        {CONFIG.name}
      </h1>

      {/* Sub messages */}
      <p
        ref={line2Ref}
        style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(1.45rem, 3.8vw, 2.1rem)",
          color: "#e8a4c0",
          marginBottom: "0.5rem",
          maxWidth: 580,
          lineHeight: 1.65,
        }}
      >
        Hope you have a magical day filled with stardust and dreams come true.
      </p>
      <p
        ref={line3Ref}
        style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
          color: "rgba(232,164,192,0.65)",
          marginBottom: "2.5rem",
          maxWidth: 520,
          lineHeight: 1.7,
        }}
      ></p>

      {/* Date line */}
      <p
        ref={dateRef}
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 200,
          fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(244,201,122,0.5)",
          marginBottom: "3rem",
        }}
      ></p>

      {/* Begin again */}
      <button
        ref={btnRef}
        onClick={() => {
          resetClickedStars();
          setConstellationAnimating(false);
          setConstellationComplete(false);
          setPendingFinalTransition(false);
          setOpenCard(null);
          setScene(0);
        }}
        style={{
          background: "transparent",
          border: "2px solid rgba(244,201,122,0.6)",
          borderRadius: 40,
          padding: "14px 40px",
          color: "#f4c97a",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 400,
          fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          cursor: "none",
          transition: "all 0.4s ease",
          textShadow: "0 0 10px rgba(244,201,122,0.3)",
        }}
        onMouseEnter={(e) => {
          gsap.to(e.currentTarget, {
            boxShadow: "0 0 25px rgba(155,114,207,0.3)",
            borderColor: "rgba(155,114,207,0.9)",
            duration: 0.3,
          });
        }}
        onMouseLeave={(e) => {
          gsap.to(e.currentTarget, {
            boxShadow: "none",
            borderColor: "rgba(155,114,207,0.5)",
            duration: 0.3,
          });
        }}
      >
        Hehe muốn coi lại từ đầu thì bấm vô đâyy
      </button>
    </div>
  );
}
