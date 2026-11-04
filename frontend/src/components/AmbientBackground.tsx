import React, { useEffect, useState } from 'react';

export const AmbientBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. Cyber Matrix Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: `
            radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px, 36px 36px, 36px 36px',
        }}
      />

      {/* 2. Vibrant Atmospheric Glowing Orbs for Frosted Glass Refraction */}
      <div className="absolute -top-32 left-1/4 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px]" />
      <div className="absolute top-2/3 -left-32 w-[650px] h-[650px] bg-purple-500/[0.08] rounded-full blur-[180px]" />
      <div className="absolute bottom-10 right-1/4 w-[750px] h-[550px] bg-emerald-500/[0.09] rounded-full blur-[150px]" />

      {/* 3. Mouse Dynamic Radial Spotlight */}
      <div
        className="absolute w-[650px] h-[650px] rounded-full blur-3xl opacity-40 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(59, 130, 246, 0.12) 35%, transparent 70%)',
          transform: `translate(${mousePos.x - 325}px, ${mousePos.y - 325}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      />
    </div>
  );
};
