/**
 * Infinity Board - Interactive On-Screen Ruler (Penggaris Interaktif)
 * Rotatable, draggable, with centimeter / millimeter markings and straight line tracing.
 */

import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, X, ArrowUpDown, Compass, Move, Minus, Plus } from 'lucide-react';

interface InteractiveRulerProps {
  visible: boolean;
  onClose: () => void;
  onDrawLineAlongRuler: (startX: number, startY: number, endX: number, endY: number) => void;
}

export const InteractiveRuler: React.FC<InteractiveRulerProps> = ({
  visible,
  onClose,
  onDrawLineAlongRuler,
}) => {
  const [posX, setPosX] = useState(150);
  const [posY, setPosY] = useState(250);
  const [angle, setAngle] = useState(0); // in degrees
  const [length, setLength] = useState(450); // in pixels (~15cm)

  const isDraggingRef = useRef(false);
  const isRotatingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const centerRef = useRef({ x: 0, y: 0 });

  if (!visible) return null;

  // Handle Dragging Ruler
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

  // Handle Rotating Ruler
  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    isRotatingRef.current = true;

    // Calculate center of ruler
    const rad = (angle * Math.PI) / 180;
    const cx = posX + (length / 2) * Math.cos(rad);
    const cy = posY + (length / 2) * Math.sin(rad);
    centerRef.current = { x: cx, y: cy };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isRotatingRef.current) {
        const dx = moveEvent.clientX - centerRef.current.x;
        const dy = moveEvent.clientY - centerRef.current.y;
        let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
        // Snap to 15 degrees if shift held
        if (moveEvent.shiftKey) {
          deg = Math.round(deg / 15) * 15;
        }
        setAngle(Math.round(deg));
      }
    };

    const handleMouseUp = () => {
      isRotatingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Draw straight line along ruler top edge onto canvas
  const handleTraceLine = () => {
    const rad = (angle * Math.PI) / 180;
    const startX = posX;
    const startY = posY;
    const endX = posX + length * Math.cos(rad);
    const endY = posY + length * Math.sin(rad);
    onDrawLineAlongRuler(startX, startY, endX, endY);
  };

  // Generate tick marks (1cm ≈ 30px)
  const cmCount = Math.floor(length / 30);
  const ticks = [];
  for (let i = 0; i <= cmCount * 10; i++) {
    const isCm = i % 10 === 0;
    const isHalfCm = i % 5 === 0 && !isCm;
    const tickHeight = isCm ? 18 : isHalfCm ? 12 : 7;
    const left = i * 3;
    ticks.push(
      <div
        key={i}
        className="absolute top-0 flex flex-col items-center pointer-events-none"
        style={{ left: `${left}px` }}
      >
        <div
          className={`w-[1px] ${isCm ? 'bg-slate-800 dark:bg-slate-200' : 'bg-slate-400'}`}
          style={{ height: `${tickHeight}px` }}
        />
        {isCm && (
          <span className="text-[9px] font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 select-none">
            {i / 10}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="absolute z-30 select-none shadow-2xl rounded-sm transition-shadow pointer-events-auto"
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        width: `${length}px`,
        height: '64px',
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 0',
      }}
    >
      {/* Acrylic Glass Ruler Body */}
      <div
        onMouseDown={handleDragStart}
        className="relative w-full h-full bg-amber-50/85 dark:bg-slate-900/85 backdrop-blur-md border-2 border-amber-300/70 dark:border-slate-700 cursor-move flex flex-col justify-between overflow-hidden shadow-xl ring-1 ring-black/10 group"
      >
        {/* Top Edge Tick Marks (Centimeters / Millimeters) */}
        <div className="relative w-full h-8 border-b border-amber-200/50 dark:border-slate-800">
          {ticks}
        </div>

        {/* Center Guide & Info Controls */}
        <div className="flex items-center justify-between px-3 pb-1 text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-2xs">
            <Compass size={12} className="text-blue-600" />
            <span>{((angle % 360 + 360) % 360)}°</span>
            <span className="text-slate-400 font-normal">| {cmCount} cm</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleTraceLine}
              onMouseDown={e => e.stopPropagation()}
              className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded hover:bg-blue-700 shadow-2xs"
              title="Tarik Garis Lurus Mengikuti Penggaris"
            >
              Tarik Garis
            </button>

            {/* Quick Angle Presets */}
            <button
              onClick={e => { e.stopPropagation(); setAngle(0); }}
              className="px-1.5 py-0.5 text-[9px] font-mono bg-white/80 dark:bg-slate-800 rounded hover:bg-slate-200"
              title="Rata Horizontal (0°)"
            >
              0°
            </button>
            <button
              onClick={e => { e.stopPropagation(); setAngle(45); }}
              className="px-1.5 py-0.5 text-[9px] font-mono bg-white/80 dark:bg-slate-800 rounded hover:bg-slate-200"
              title="Sudut 45°"
            >
              45°
            </button>
            <button
              onClick={e => { e.stopPropagation(); setAngle(90); }}
              className="px-1.5 py-0.5 text-[9px] font-mono bg-white/80 dark:bg-slate-800 rounded hover:bg-slate-200"
              title="Tegak Lurus (90°)"
            >
              90°
            </button>

            {/* Close Ruler */}
            <button
              onClick={e => { e.stopPropagation(); onClose(); }}
              className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50"
              title="Tutup Penggaris"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Rotate Knob at right tip */}
        <div
          onMouseDown={handleRotateStart}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md hover:scale-110 transition-transform"
          title="Tahan & Drag untuk Putar / Rotate Penggaris"
        >
          <RotateCw size={13} />
        </div>
      </div>
    </div>
  );
};
