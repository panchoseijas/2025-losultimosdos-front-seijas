"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type TrainingMascotProps = {
  visible?: boolean;
};

export function TrainingMascot({ visible = true }: TrainingMascotProps) {
  const [position, setPosition] = useState({ top: 55, left: 50 });
  const [isDesktop, setIsDesktop] = useState(true);

  const playSound = () => {
    const audio = new Audio("/mono.mp3");
    audio.volume = 0.8;
    audio.currentTime = 0;
    audio.play();
  };

  useEffect(() => {
    if (!visible) return;

    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        playSound();
      }, 60000);
    };

    resetTimer();

    window.addEventListener("mousemove", resetTimer);

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      clearTimeout(timer);
    };
  }, [visible]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!visible || !isDesktop) return;

    moveMascot();
    const id = setInterval(() => moveMascot(), 9000);

    return () => clearInterval(id);
  }, [visible, isDesktop]);

  const randomBetween = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const moveMascot = () => {
    setPosition({
      top: randomBetween(30, 70),
      left: randomBetween(25, 75),
    });
  };

  if (!visible) return null;

  // Mobile: static mascot in corner
  if (!isDesktop) {
    return (
      <div
        className="pointer-events-none absolute top-2 right-2 z-30"
        aria-hidden="true"
      >
        <Image
          src="/gorila-legendario.png"
          alt="Gorila legendario"
          width={80}
          height={80}
          className="object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] opacity-80"
        />
      </div>
    );
  }

  // Desktop: floating mascot
  return (
    <div
      className="pointer-events-none absolute inset-0 z-30"
      aria-hidden="true"
    >
      <div
        className="
          pointer-events-auto absolute
          transition-all duration-[1200ms] ease-out
        "
        style={{
          top: `${position.top}%`,
          left: `${position.left}%`,
          transform: "translate(-50%, -50%)",
        }}
        onMouseEnter={moveMascot}
      >
        <Image
          src="/gorila-legendario.png"
          alt="Gorila legendario"
          width={320}
          height={320}
          className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-pulse"
        />
      </div>
    </div>
  );
}
