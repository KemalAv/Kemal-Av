/**
 * Infinity Board - Minimap / Radar Component
 */

import React, { useRef, useEffect } from 'react';
import { Viewport, CanvasElement } from '../types';
import { getAllElementsBounds, getElementBounds } from '../canvasRenderer';

interface MinimapProps {
  elements: CanvasElement[];
  viewport: Viewport;
  onNavigate: (worldX: number, worldY: number) => void;
}

export const Minimap: React.FC<MinimapProps> = ({ elements, viewport, onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = 'rgba(241, 245, 249, 0.95)';
    ctx.fillRect(0, 0, width, height);

    // Compute bounding box including elements and current viewport
    const elemBounds = getAllElementsBounds(elements) || { x: 0, y: 0, width: 800, height: 600 };
    const vpWorldLeft = -viewport.x / viewport.zoom;
    const vpWorldTop = -viewport.y / viewport.zoom;
    const vpWorldWidth = window.innerWidth / viewport.zoom;
    const vpWorldHeight = window.innerHeight / viewport.zoom;

    const minX = Math.min(elemBounds.x - 200, vpWorldLeft - 100);
    const minY = Math.min(elemBounds.y - 200, vpWorldTop - 100);
    const maxX = Math.max(elemBounds.x + elemBounds.width + 200, vpWorldLeft + vpWorldWidth + 100);
    const maxY = Math.max(elemBounds.y + elemBounds.height + 200, vpWorldTop + vpWorldHeight + 100);

    const totalWorldW = Math.max(maxX - minX, 1000);
    const totalWorldH = Math.max(maxY - minY, 800);

    const scale = Math.min(width / totalWorldW, height / totalWorldH);
    const offsetX = (width - totalWorldW * scale) / 2;
    const offsetY = (height - totalWorldH * scale) / 2;

    const toMini = (wx: number, wy: number) => ({
      x: offsetX + (wx - minX) * scale,
      y: offsetY + (wy - minY) * scale,
    });

    // Draw elements representation
    ctx.fillStyle = '#94a3b8';
    for (const el of elements) {
      const b = getElementBounds(el);
      const m = toMini(b.x, b.y);
      const mw = Math.max(b.width * scale, 2);
      const mh = Math.max(b.height * scale, 2);
      ctx.fillRect(m.x, m.y, mw, mh);
    }

    // Draw current viewport indicator rectangle
    const vpMini = toMini(vpWorldLeft, vpWorldTop);
    const vpMiniW = vpWorldWidth * scale;
    const vpMiniH = vpWorldHeight * scale;

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
    ctx.fillRect(vpMini.x, vpMini.y, vpMiniW, vpMiniH);
    ctx.strokeRect(vpMini.x, vpMini.y, vpMiniW, vpMiniH);
  }, [elements, viewport]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    const elemBounds = getAllElementsBounds(elements) || { x: 0, y: 0, width: 800, height: 600 };
    const vpWorldLeft = -viewport.x / viewport.zoom;
    const vpWorldTop = -viewport.y / viewport.zoom;
    const vpWorldWidth = window.innerWidth / viewport.zoom;
    const vpWorldHeight = window.innerHeight / viewport.zoom;

    const minX = Math.min(elemBounds.x - 200, vpWorldLeft - 100);
    const minY = Math.min(elemBounds.y - 200, vpWorldTop - 100);
    const maxX = Math.max(elemBounds.x + elemBounds.width + 200, vpWorldLeft + vpWorldWidth + 100);
    const maxY = Math.max(elemBounds.y + elemBounds.height + 200, vpWorldTop + vpWorldHeight + 100);

    const totalWorldW = Math.max(maxX - minX, 1000);
    const totalWorldH = Math.max(maxY - minY, 800);

    const scale = Math.min(width / totalWorldW, height / totalWorldH);
    const offsetX = (width - totalWorldW * scale) / 2;
    const offsetY = (height - totalWorldH * scale) / 2;

    const targetWorldX = minX + (clickX - offsetX) / scale;
    const targetWorldY = minY + (clickY - offsetY) / scale;

    onNavigate(targetWorldX, targetWorldY);
  };

  return (
    <div className="absolute bottom-5 right-4 z-20 hidden md:block">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-800">
        <canvas
          ref={canvasRef}
          width={130}
          height={85}
          onClick={handleClick}
          className="rounded-lg cursor-crosshair border border-slate-200/50 dark:border-slate-700/50"
          title="Radar Kanvas - Klik untuk lompat ke area"
        />
      </div>
    </div>
  );
};
