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
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `
            radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px),
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px, 40px 40px, 40px 40px',
        }}
      />

      {/* 2. Mouse Dynamic Radial Spotlight */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-35 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.08) 40%, transparent 70%)',
          transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* 3. Deep Atmospheric Corner Flares */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-white/[0.04] to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[140px]" />
      <div className="absolute bottom-10 -right-40 w-[600px] h-[600px] bg-cyan-500/[0.025] rounded-full blur-[160px]" />
    </div>
  );
};
