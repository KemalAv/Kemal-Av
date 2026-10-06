/**
 * Infinity Board - Interactive Protractor (Busur Derajat Interaktif)
 * Measure angles, rotate baseline, and draw precision geometric angles.
 */

import React, { useState, useRef } from 'react';
import { RotateCw, X, Compass } from 'lucide-react';

interface InteractiveProtractorProps {
  visible: boolean;
  onClose: () => void;
  onDrawAngle: (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => void;
}

export const InteractiveProtractor: React.FC<InteractiveProtractorProps> = ({
  visible,
  onClose,
  onDrawAngle,
}) => {
  const [posX, setPosX] = useState(250);
  const [posY, setPosY] = useState(250);
  const [baseAngle, setBaseAngle] = useState(0); // in degrees
  const [targetAngle, setTargetAngle] = useState(60); // in degrees
  const radius = 140; // px

  const isDraggingRef = useRef(false);
  const isRotatingBaseRef = useRef(false);
  const isAdjustingAngleRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  if (!visible) return null;

  // Drag Entire Protractor
  const handleDragStart = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - posX,
      y: e.clientY - posY,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isDraggingRef.current) {
        setPosX(moveEvent.clientX - dragOffsetRef.current.x);
        setPosY(moveEvent.clientY - dragOffsetRef.current.y);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Rotate Base
  const handleRotateBaseStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    isRotatingBaseRef.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isRotatingBaseRef.current) {
        const dx = moveEvent.clientX - posX;
        const dy = moveEvent.clientY - posY;
        const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
        setBaseAngle(Math.round(deg));
      }
    };

    const handleMouseUp = () => {
      isRotatingBaseRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Adjust Target Angle Needle
  const handleAngleNeedleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    isAdjustingAngleRef.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isAdjustingAngleRef.current) {
        const dx = moveEvent.clientX - posX;
        const dy = moveEvent.clientY - posY;
        let deg = (Math.atan2(dy, dx) * 180) / Math.PI - baseAngle;
        deg = (deg % 360 + 360) % 360;
        if (deg > 180) deg = 360 - deg;
        if (moveEvent.shiftKey) {
          deg = Math.round(deg / 15) * 15;
        }
        setTargetAngle(Math.round(deg));
      }
    };

    const handleMouseUp = () => {
      isAdjustingAngleRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Draw angle arc onto canvas
  const handleDrawAngleClick = () => {
    const startRad = (baseAngle * Math.PI) / 180;
    const endRad = ((baseAngle - targetAngle) * Math.PI) / 180;
    onDrawAngle(posX, posY, radius, startRad, endRad);
  };

  // Generate degree ticks along 180-degree arc
  const ticks = [];
  for (let d = 0; d <= 180; d += 5) {
    const isMajor = d % 10 === 0;
    const isSpecial = d === 0 || d === 45 || d === 90 || d === 135 || d === 180;
    const tickLen = isMajor ? 14 : 8;
    const rad = (-d * Math.PI) / 180;
    const x1 = radius * Math.cos(rad);
    const y1 = radius * Math.sin(rad);
    const x2 = (radius - tickLen) * Math.cos(rad);
    const y2 = (radius - tickLen) * Math.sin(rad);

    ticks.push(
      <line
        key={d}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isSpecial ? '#2563eb' : '#475569'}
        strokeWidth={isMajor ? 1.5 : 1}
      />
    );

    if (isMajor && d % 30 === 0) {
      const tx = (radius - 22) * Math.cos(rad);
      const ty = (radius - 22) * Math.sin(rad);
      ticks.push(
        <text
          key={`t-${d}`}
          x={tx}
          y={ty}
          fontSize="9"
          fontFamily="monospace"
          fontWeight="bold"
          fill="#334155"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {d}°
        </text>
      );
    }
  }

  // Needle position
  const needleRad = (-targetAngle * Math.PI) / 180;
  const needleX = (radius - 2) * Math.cos(needleRad);
  const needleY = (radius - 2) * Math.sin(needleRad);

  return (
    <div
      className="absolute z-30 select-none pointer-events-auto"
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        transform: `translate(-50%, -50%) rotate(${baseAngle}deg)`,
        transformOrigin: '50% 50%',
      }}
    >
      <div
        onMouseDown={handleDragStart}
        className="relative cursor-move p-2 rounded-full"
      >
        <svg
          width={radius * 2 + 40}
          height={radius + 50}
          viewBox={`${-radius - 20} ${-radius - 20} ${radius * 2 + 40} ${radius + 50}`}
          className="overflow-visible drop-shadow-2xl"
        >
          {/* Protractor Semi-Circle Acrylic Body */}
          <path
            d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0 Z`}
            fill="rgba(240, 249, 255, 0.88)"
            stroke="#0ea5e9"
            strokeWidth="2"
            className="backdrop-blur-md"
          />

          {/* Inner cutout semi-circle */}
          <path
            d={`M ${-radius * 0.4} 0 A ${radius * 0.4} ${radius * 0.4} 0 0 1 ${radius * 0.4} 0 Z`}
            fill="rgba(255, 255, 255, 0.4)"
            stroke="#94a3b8"
            strokeWidth="1"
          />

          {/* Center Origin Crosshair */}
          <circle cx="0" cy="0" r="3.5" fill="#2563eb" />
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#2563eb" strokeWidth="1.5" />
          <line x1="0" y1="-12" x2="0" y2="0" stroke="#2563eb" strokeWidth="1.5" />

          {/* Ticks */}
          {ticks}

          {/* Interactive Target Angle Needle */}
          <line
            x1="0"
            y1="0"
            x2={needleX}
            y2={needleY}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <circle
            cx={needleX}
            cy={needleY}
            r="7"
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth="2"
            className="cursor-pointer hover:scale-125 transition-transform"
            onMouseDown={handleAngleNeedleStart}
          />
        </svg>

        {/* Floating Controls Bar */}
        <div
          onMouseDown={e => e.stopPropagation()}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs"
        >
          <div className="flex items-center gap-1 font-mono font-bold text-blue-600">
            <Compass size={13} />
            <span>{targetAngle}°</span>
          </div>

          <button
            onClick={handleDrawAngleClick}
            className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded hover:bg-blue-700 shadow-2xs"
            title="Terapkan Gambar Busur Sudut"
          >
            Gambar Sudut
          </button>

          {/* Rotate Base Knob */}
          <button
            onMouseDown={handleRotateBaseStart}
            className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
            title="Drag untuk Putar Orientasi Busur"
          >
            <RotateCw size={13} />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50"
            title="Tutup Busur"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
