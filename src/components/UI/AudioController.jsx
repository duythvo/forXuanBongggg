import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import useStore from "../../store/useStore";
import birthdaySong from "../../assets/soundgallerybydmitrytaras-nostalgic-emotional-piano-119764.mp3";

export function initAudio() {
  const audioEl = document.getElementById("bg-audio");
  if (!audioEl) return;

  // Tiêu diệt mọi luồng chạy ngầm của GSAP liên quan đến audioEl để tránh lỗi ghi đè volume = 0
  gsap.killTweensOf(audioEl);
  
  // Mở khóa audio context một cách im lặng tuyệt đối
  audioEl.volume = 0;
  const playPromise = audioEl.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        audioEl.pause();
        audioEl.currentTime = 0;
      })
      .catch((err) => console.log("Audio unlock deferred", err));
  }
}

export function playAmbient() {
  // Not used
}

export function stopAmbient() {
  // Not used
}

export function playBirthday() {
  const audioEl = document.getElementById("bg-audio");
  if (!audioEl) return;
  
  gsap.killTweensOf(audioEl);
  audioEl.volume = 0;
  const playPromise = audioEl.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        gsap.to(audioEl, { volume: 0.45, duration: 1.2 });
      })
      .catch((err) => console.log("Play failed", err));
  } else {
    gsap.to(audioEl, { volume: 0.45, duration: 1.2 });
  }
}

export function stopBirthday() {
  const audioEl = document.getElementById("bg-audio");
  if (!audioEl) return;
  
  gsap.killTweensOf(audioEl);
  gsap.to(audioEl, {
    volume: 0,
    duration: 0.7,
    onComplete: () => {
      audioEl.pause();
    },
  });
}

export default function AudioController() {
  const isMuted = useStore((s) => s.isMuted);
  const toggleMute = useStore((s) => s.toggleMute);
  const currentScene = useStore((s) => s.currentScene);
  const btnRef = useRef();
  const initialized = useRef(false);

  // Only play music in final scene.
  useEffect(() => {
    if (currentScene === 3 && !isMuted) {
      playBirthday(); // Chơi nhạc khi bắt đầu màn cuối
    } else {
      stopBirthday();
      stopAmbient();
    }
  }, [currentScene, isMuted]);

  useEffect(() => {
    const audioEl = document.getElementById("bg-audio");
    if (!audioEl) return;
    
    if (isMuted) {
      audioEl.volume = 0;
    } else {
      if (currentScene === 3 && !audioEl.paused) {
        audioEl.volume = 0.45;
      }
    }
  }, [isMuted, currentScene]);

  return (
    <>
      <audio id="bg-audio" src={birthdaySong} loop preload="auto" />
      {currentScene > 0 && (
      <button
      ref={btnRef}
      onClick={toggleMute}
      style={{
        position: "fixed",
        bottom: "max(24px, env(safe-area-inset-bottom, 24px))",
        right: 24,
        background: "rgba(10,6,20,0.5)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "50%",
        width: 42,
        height: 42,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.1rem",
        cursor: "pointer",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        transition: "all 0.3s",
        zIndex: 50,
        touchAction: "manipulation",
      }}
      onMouseEnter={(e) =>
        gsap.to(e.currentTarget, {
          borderColor: "rgba(244,201,122,0.4)",
          duration: 0.2,
        })
      }
      onMouseLeave={(e) =>
        gsap.to(e.currentTarget, {
          borderColor: "rgba(255,255,255,0.1)",
          duration: 0.2,
        })
      }
    >
      {isMuted ? "🔇" : "🔊"}
    </button>
    )}
    </>
  );
}
