import React, { useEffect, useRef } from 'react';

export const StarrySky: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth * window.devicePixelRatio);
    let height = (canvas.height = window.innerHeight * window.devicePixelRatio);

    const resize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth * window.devicePixelRatio;
      height = canvas.height = window.innerHeight * window.devicePixelRatio;
    };

    window.addEventListener('resize', resize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: (Math.random() * 1.4 + 0.4) * window.devicePixelRatio,
      speed: Math.random() * 0.18 + 0.04,
      phase: Math.random() * 6,
      color:
        Math.random() < 0.65
          ? '#8C6D3B' // Antique Gold Foil
          : Math.random() < 0.85
          ? '#7A1C1C' // Subtle Crimson Accent
          : '#2B2927', // Charcoal Slate
    }));

    let animationFrameId: number;

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        const alpha = 0.15 + 0.35 * Math.abs(Math.sin((time / 1600) * star.speed * 2.5 + star.phase));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();

        if (!prefersReducedMotion) {
          star.y += star.speed * window.devicePixelRatio * 0.18;
          if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="sky"
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
    />
  );
};
