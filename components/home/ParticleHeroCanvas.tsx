'use client';
import { useEffect, useRef } from 'react';

export default function ParticleHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 300);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = canvas.parentElement?.clientHeight || 300;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#3b82f6', '#8b5cf6', '#d946ef', '#06b6d4', '#6366f1'];
    const particleCount = 50;

    interface Particle {
      startX: number;
      startY: number;
      targetX: number;
      targetY: number;
      x: number;
      y: number;
      size: number;
      color: string;
      alpha: number;
      delay: number;
    }

    const centerX = width / 2;
    const centerY = height / 2 - 20;

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 180 + Math.random() * 220;
      const startX = centerX + Math.cos(angle) * distance;
      const startY = centerY + Math.sin(angle) * distance;

      // Target cluster around text title center
      const targetX = centerX + (Math.random() - 0.5) * 360;
      const targetY = centerY + (Math.random() - 0.5) * 80;

      particles.push({
        startX,
        startY,
        targetX,
        targetY,
        x: startX,
        y: startY,
        size: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3,
        delay: Math.random() * 0.3,
      });
    }

    const startTime = performance.now();
    const duration = 1400; // ms to assemble

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      const elapsed = now - startTime;

      particles.forEach((p) => {
        const effectiveElapsed = Math.max(0, elapsed - p.delay * 1000);
        const progress = Math.min(1, effectiveElapsed / duration);

        // Exponential ease-out
        const ease = 1 - Math.pow(1 - progress, 3);

        p.x = p.startX + (p.targetX - p.startX) * ease;
        p.y = p.startY + (p.targetY - p.startY) * ease;

        // Subtle ambient floating after convergence
        if (progress >= 1) {
          p.x += Math.sin(now * 0.002 + p.delay * 10) * 0.4;
          p.y += Math.cos(now * 0.002 + p.delay * 10) * 0.4;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha * (0.3 + ease * 0.7);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
