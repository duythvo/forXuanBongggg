import { useEffect, useRef } from "react";
import { Howl } from "howler";
import { gsap } from "gsap";
import useStore from "../../store/useStore";
import birthdaySong from "../../assets/soundgallerybydmitrytaras-nostalgic-emotional-piano-119764.mp3";

let ambient = null;
let chime = null;
let birthday = null;

export function initAudio() {
  // Only init once
  if (ambient && birthday) return;

  ambient = new Howl({
    src: [birthdaySong],
    loop: false,
    volume: 0,
    autoplay: false,
  });

  birthday = new Howl({
    src: [birthdaySong],
    loop: false,
    volume: 0,
    autoplay: false,
  });

  // Explicitly unlock AudioContext on iOS by playing silently during initial click handling
  ambient.play();
  ambient.pause();
  birthday.play();
  birthday.pause();
}

export function playAmbient() {
  if (!ambient) initAudio();
  if (ambient && !ambient.playing()) {
    ambient.play();
    ambient.fade(0, 0.25, 3000);
  }
}

export function swellAmbient() {
  if (ambient) {
    ambient.fade(ambient.volume(), 0.45, 2000);
  }
}

export function playBirthday() {
  if (!birthday) initAudio();
  if (!birthday) return;

  if (birthday.playing()) {
    birthday.stop();
  }

  birthday.play();
  birthday.fade(0, 0.45, 1200);
}

export function stopBirthday() {
  if (birthday && birthday.playing()) {
    birthday.fade(birthday.volume(), 0, 700);
    setTimeout(() => {
      if (birthday) birthday.stop();
    }, 750);
  }
}

export function stopAmbient() {
  if (ambient) ambient.fade(ambient.volume(), 0, 1000);
}

export function playChime() {
  // Soft "ding" tone: lower pitch, filtered, and quieter.
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const oscHarm = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, ctx.currentTime);
    filter.Q.setValueAtTime(0.7, ctx.currentTime);

    osc.connect(gain);
    oscHarm.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc.type = "sine";
    oscHarm.type = "triangle";

    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(329.63, ctx.currentTime + 0.2);
    oscHarm.frequency.setValueAtTime(660, ctx.currentTime);
    oscHarm.frequency.exponentialRampToValueAtTime(
      523.25,
      ctx.currentTime + 0.2,
    );

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.028, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);

    osc.start();
    oscHarm.start();
    osc.stop(ctx.currentTime + 0.42);
    oscHarm.stop(ctx.currentTime + 0.42);
  } catch (e) {
    /* silent */
  }
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
    if (isMuted) {
      if (ambient) ambient.volume(0);
      if (birthday) birthday.volume(0);
    } else {
      if (ambient) ambient.volume(0);
      if (currentScene === 3 && birthday && birthday.playing()) {
        birthday.volume(0.45);
      }
    }
  }, [isMuted, currentScene]);

  return (
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
  );
}
