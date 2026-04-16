import { useEffect, useRef } from "react";
 
const ParticlesBg = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
 
    let animId: number;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
 
    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
 
    // Stars
    const STAR_COUNT = 130;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.15 + 0.03,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));
 
    // Floating orbs
    const orbs = [
      { x: W * 0.15, y: H * 0.25, r: 220, color: "56,189,248", vx: 0.08, vy: 0.05 },
      { x: W * 0.8,  y: H * 0.6,  r: 280, color: "139,92,246", vx: -0.06, vy: 0.07 },
      { x: W * 0.5,  y: H * 0.85, r: 180, color: "34,211,238", vx: 0.05, vy: -0.08 },
      { x: W * 0.9,  y: H * 0.1,  r: 160, color: "168,85,247", vx: -0.07, vy: 0.06 },
    ];
 
    let t = 0;
 
    const draw = () => {
      t += 0.008;
 
      // Deep space background
      ctx.fillStyle = "#05040f";
      ctx.fillRect(0, 0, W, H);
 
      // Radial center glow
      const centerGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6);
      centerGrad.addColorStop(0, "rgba(30, 20, 70, 0.5)");
      centerGrad.addColorStop(1, "rgba(5, 4, 15, 0)");
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, W, H);
 
      // Floating soft orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.r) orb.x = W + orb.r;
        if (orb.x > W + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = H + orb.r;
        if (orb.y > H + orb.r) orb.y = -orb.r;
 
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        g.addColorStop(0, `rgba(${orb.color}, 0.13)`);
        g.addColorStop(0.5, `rgba(${orb.color}, 0.05)`);
        g.addColorStop(1, `rgba(${orb.color}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });
 
      // Twinkling stars
      stars.forEach((s) => {
        s.y -= s.speed;
        if (s.y < -2) {
          s.y = H + 2;
          s.x = Math.random() * W;
        }
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + s.twinkleOffset));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${s.alpha * twinkle})`;
        ctx.fill();
      });
 
      // Subtle aurora ribbon
      ctx.save();
      ctx.globalAlpha = 0.06;
      for (let i = 0; i < 3; i++) {
        const grad = ctx.createLinearGradient(0, H * 0.3 + i * 60, W, H * 0.5 + i * 60);
        grad.addColorStop(0, "rgba(56,189,248,0)");
        grad.addColorStop(0.3, "rgba(139,92,246,0.9)");
        grad.addColorStop(0.6, "rgba(34,211,238,0.9)");
        grad.addColorStop(1, "rgba(56,189,248,0)");
 
        ctx.beginPath();
        ctx.moveTo(0, H * 0.35 + i * 55 + Math.sin(t + i) * 18);
        for (let x = 0; x <= W; x += 40) {
          const y = H * 0.35 + i * 55 + Math.sin(t * 0.7 + x * 0.006 + i) * 22;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H * 0.35 + i * 55 + 30);
        ctx.lineTo(0, H * 0.35 + i * 55 + 30);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.restore();
 
      animId = requestAnimationFrame(draw);
    };
 
    draw();
 
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);
 
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
};
 
export default ParticlesBg;