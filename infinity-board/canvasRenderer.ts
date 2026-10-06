/**
 * Enhanced Canvas Renderer & Hit-Testing Engine for Infinity Board
 * Handles multiple pen styles (brush, glow, rainbow, dashed, pencil, highlighter),
 * element rotations, image filters, and rotation handles.
 */

import { 
  CanvasElement, 
  StrokeElement, 
  ShapeElement, 
  TextElement, 
  NoteElement, 
  ImageElement, 
  Viewport, 
  GridStyle, 
  Point 
} from './types';

// Image element cache to avoid recreating Image objects on every frame
const imageCache = new Map<string, HTMLImageElement>();

export const getCachedImage = (src: string): HTMLImageElement | null => {
  if (imageCache.has(src)) {
    const img = imageCache.get(src)!;
    return img.complete ? img : null;
  }
  const img = new Image();
  img.src = src;
  imageCache.set(src, img);
  return null;
};

// Coordinate transformations
export const worldToScreen = (wx: number, wy: number, viewport: Viewport): { x: number; y: number } => {
  return {
    x: wx * viewport.zoom + viewport.x,
    y: wy * viewport.zoom + viewport.y,
  };
};

export const screenToWorld = (sx: number, sy: number, viewport: Viewport): { x: number; y: number } => {
  return {
    x: (sx - viewport.x) / viewport.zoom,
    y: (sy - viewport.y) / viewport.zoom,
  };
};

// Compute bounding box of an element
export const getElementBounds = (element: CanvasElement): { x: number; y: number; width: number; height: number } => {
  if (element.type === 'stroke') {
    if (element.points.length === 0) {
      return { x: element.x, y: element.y, width: 1, height: 1 };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const pt of element.points) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }
    const pad = Math.max(element.strokeWidth / 2, 4);
    return {
      x: minX - pad,
      y: minY - pad,
      width: Math.max(maxX - minX + pad * 2, 8),
      height: Math.max(maxY - minY + pad * 2, 8),
    };
  }

  // Shapes, notes, text, images
  const x = Math.min(element.x, element.x + element.width);
  const y = Math.min(element.y, element.y + element.height);
  const width = Math.abs(element.width);
  const height = Math.abs(element.height);

  return { x, y, width: Math.max(width, 10), height: Math.max(height, 10) };
};

// Overall bounding box of multiple elements
export const getAllElementsBounds = (elements: CanvasElement[]): { x: number; y: number; width: number; height: number } | null => {
  if (elements.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    const b = getElementBounds(el);
    if (b.x < minX) minX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.x + b.width > maxX) maxX = b.x + b.width;
    if (b.y + b.height > maxY) maxY = b.y + b.height;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// Hit test for element at world coordinates (takes rotation into account)
export const hitTestElement = (el: CanvasElement, wx: number, wy: number, tolerance = 10): boolean => {
  // If element is rotated, transform test point into local unrotated coords
  let testX = wx;
  let testY = wy;

  if (el.rotation && el.rotation !== 0) {
    const bounds = getElementBounds(el);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const rad = (-el.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = wx - cx;
    const dy = wy - cy;
    testX = cx + (dx * cos - dy * sin);
    testY = cy + (dx * sin + dy * cos);
  }

  if (el.type === 'stroke') {
    const strokeTol = (el.strokeWidth / 2) + tolerance;
    for (let i = 0; i < el.points.length - 1; i++) {
      const p1 = el.points[i];
      const p2 = el.points[i + 1];
      const dist = distanceToSegment(testX, testY, p1.x, p1.y, p2.x, p2.y);
      if (dist <= strokeTol) return true;
    }
    if (el.points.length === 1) {
      const p = el.points[0];
      const dist = Math.hypot(testX - p.x, testY - p.y);
      if (dist <= strokeTol) return true;
    }
    return false;
  }

  const bounds = getElementBounds(el);
  return (
    testX >= bounds.x - tolerance &&
    testX <= bounds.x + bounds.width + tolerance &&
    testY >= bounds.y - tolerance &&
    testY <= bounds.y + bounds.height + tolerance
  );
};

function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

// Draw the infinite grid background
export const drawInfiniteGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  viewport: Viewport,
  gridStyle: GridStyle,
  isDark = false
) => {
  if (gridStyle === 'none') return;

  const baseSpacing = 30;
  let spacing = baseSpacing * viewport.zoom;

  while (spacing < 15) spacing *= 2;
  while (spacing > 120) spacing /= 2;

  const offsetX = viewport.x % spacing;
  const offsetY = viewport.y % spacing;

  ctx.save();

  if (gridStyle === 'dots') {
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.15)';
    const dotRadius = Math.max(1, Math.min(1.75 * (viewport.zoom < 0.5 ? 0.7 : 1), 2.5));

    for (let x = offsetX; x < width; x += spacing) {
      for (let y = offsetY; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (gridStyle === 'grid') {
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = offsetX; x < width; x += spacing) {
      ctx.moveTo(Math.round(x) + 0.5, 0);
      ctx.lineTo(Math.round(x) + 0.5, height);
    }
    for (let y = offsetY; y < height; y += spacing) {
      ctx.moveTo(0, Math.round(y) + 0.5);
      ctx.lineTo(width, Math.round(y) + 0.5);
    }
    ctx.stroke();
  } else if (gridStyle === 'lines') {
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let y = offsetY; y < height; y += spacing) {
      ctx.moveTo(0, Math.round(y) + 0.5);
      ctx.lineTo(width, Math.round(y) + 0.5);
    }
    ctx.stroke();
  }

  ctx.restore();
};

// Render Stroke with multiple tool types
export const renderStroke = (ctx: CanvasRenderingContext2D, el: StrokeElement) => {
  if (el.points.length === 0) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const pts = el.points;

  // 1. Rainbow Pen (dynamic hue along line segments)
  if (el.tool === 'rainbow') {
    ctx.lineWidth = el.strokeWidth;
    ctx.globalAlpha = el.opacity ?? 1;

    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const hue = (i * 12) % 360;
      ctx.strokeStyle = `hsl(${hue}, 95%, 55%)`;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // 2. Neon / Glow Pen
  if (el.tool === 'glow') {
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.strokeWidth;
    ctx.shadowColor = el.color;
    ctx.shadowBlur = Math.max(el.strokeWidth * 2.5, 12);
    ctx.globalAlpha = el.opacity ?? 1;
  }
  // 3. Highlighter
  else if (el.tool === 'highlighter') {
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.strokeWidth;
    ctx.globalAlpha = (el.opacity ?? 1) * 0.42;
    ctx.lineCap = 'butt';
  }
  // 4. Pencil
  else if (el.tool === 'pencil') {
    ctx.strokeStyle = el.color;
    ctx.lineWidth = Math.max(1, el.strokeWidth * 0.85);
    ctx.globalAlpha = (el.opacity ?? 1) * 0.72;
    // Add subtle pencil grain with dashed texture
    ctx.setLineDash([2, 1]);
  }
  // 5. Technical Dashed Line
  else if (el.tool === 'dashed') {
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.strokeWidth;
    ctx.globalAlpha = el.opacity ?? 1;
    ctx.setLineDash([Math.max(el.strokeWidth * 2.5, 8), Math.max(el.strokeWidth * 1.8, 6)]);
  }
  // 6. Fountain / Calligraphy Brush
  else if (el.tool === 'brush') {
    ctx.strokeStyle = el.color;
    ctx.globalAlpha = el.opacity ?? 1;
    ctx.lineCap = 'round';

    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      // Speed taper: faster strokes get thinner, slower get thicker
      const factor = Math.max(0.4, Math.min(1.6, 12 / (dist + 4)));
      ctx.lineWidth = el.strokeWidth * factor;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }
  // 7. Regular Smooth Pen
  else {
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.strokeWidth;
    ctx.globalAlpha = el.opacity ?? 1;
  }

  // Smooth quadratic curves through midpoints
  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, el.strokeWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = el.color;
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);

  if (pts.length === 2) {
    ctx.lineTo(pts[1].x, pts[1].y);
  } else {
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2;
      const yc = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  }

  ctx.stroke();
  ctx.restore();
};

// Render Shape
export const renderShape = (ctx: CanvasRenderingContext2D, el: ShapeElement) => {
  ctx.save();
  ctx.globalAlpha = el.opacity ?? 1;
  ctx.lineWidth = el.strokeWidth;
  ctx.strokeStyle = el.strokeColor;
  ctx.fillStyle = el.fillColor === 'none' ? 'transparent' : el.fillColor;

  if (el.strokeStyle === 'dashed') {
    ctx.setLineDash([8, 6]);
  } else {
    ctx.setLineDash([]);
  }

  const x = el.x;
  const y = el.y;
  const w = el.width;
  const h = el.height;

  switch (el.shapeType) {
    case 'rectangle': {
      const rx = Math.min(x, x + w);
      const ry = Math.min(y, y + h);
      const rw = Math.abs(w);
      const rh = Math.abs(h);
      const radius = Math.min(10, rw / 4, rh / 4);

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(rx, ry, rw, rh, radius);
      } else {
        ctx.rect(rx, ry, rw, rh);
      }
      if (el.fillColor !== 'none') ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
      break;
    }
    case 'ellipse': {
      const rx = Math.abs(w / 2);
      const ry = Math.abs(h / 2);
      const cx = x + w / 2;
      const cy = y + h / 2;

      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2);
      if (el.fillColor !== 'none') ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
      break;
    }
    case 'line': {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
      break;
    }
    case 'arrow': {
      const startX = x;
      const startY = y;
      const endX = x + w;
      const endY = y + h;

      const angle = Math.atan2(endY - startY, endX - startX);
      const headLength = Math.max(12, Math.min(24, el.strokeWidth * 4));

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = el.strokeColor;
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle - Math.PI / 6),
        endY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - headLength * Math.cos(angle + Math.PI / 6),
        endY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'triangle': {
      const rx = Math.min(x, x + w);
      const ry = Math.min(y, y + h);
      const rw = Math.abs(w);
      const rh = Math.abs(h);

      ctx.beginPath();
      ctx.moveTo(rx + rw / 2, ry);
      ctx.lineTo(rx + rw, ry + rh);
      ctx.lineTo(rx, ry + rh);
      ctx.closePath();
      if (el.fillColor !== 'none') ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
      break;
    }
    case 'diamond': {
      const rx = Math.min(x, x + w);
      const ry = Math.min(y, y + h);
      const rw = Math.abs(w);
      const rh = Math.abs(h);

      ctx.beginPath();
      ctx.moveTo(rx + rw / 2, ry);
      ctx.lineTo(rx + rw, ry + rh / 2);
      ctx.lineTo(rx + rw / 2, ry + rh);
      ctx.lineTo(rx, ry + rh / 2);
      ctx.closePath();
      if (el.fillColor !== 'none') ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
      break;
    }
    case 'star': {
      const rx = Math.min(x, x + w);
      const ry = Math.min(y, y + h);
      const rw = Math.abs(w);
      const rh = Math.abs(h);
      const cx = rx + rw / 2;
      const cy = ry + rh / 2;
      const outerR = Math.min(rw, rh) / 2;
      const innerR = outerR * 0.45;
      const points = 5;

      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (i * Math.PI) / points - Math.PI / 2;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      if (el.fillColor !== 'none') ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
      break;
    }
  }

  ctx.restore();
};

// Render Text with diverse font families and styling
export const renderText = (ctx: CanvasRenderingContext2D, el: TextElement) => {
  ctx.save();
  ctx.globalAlpha = el.opacity ?? 1;

  let fontStyle = '';
  if (el.italic) fontStyle += 'italic ';
  if (el.bold) fontStyle += 'bold ';

  const fontName = el.fontFamily || 'Inter';
  ctx.font = `${fontStyle}${el.fontSize}px "${fontName}", sans-serif`;
  ctx.fillStyle = el.color;
  ctx.textBaseline = 'top';
  ctx.textAlign = el.align || 'left';

  const lines = el.text.split('\n');
  const lineHeight = el.fontSize * 1.35;

  let textX = el.x;
  if (el.align === 'center') textX = el.x + el.width / 2;
  if (el.align === 'right') textX = el.x + el.width;

  // Background highlight if set
  if (el.backgroundColor && el.backgroundColor !== 'none') {
    ctx.fillStyle = el.backgroundColor;
    let totalHeight = lines.length * lineHeight;
    ctx.fillRect(el.x - 6, el.y - 4, el.width + 12, totalHeight + 8);
    ctx.fillStyle = el.color;
  }

  lines.forEach((line, index) => {
    const curY = el.y + index * lineHeight;
    ctx.fillText(line, textX, curY);

    // Underline
    if (el.underline) {
      const metrics = ctx.measureText(line);
      const lineY = curY + el.fontSize + 2;
      let startX = textX;
      if (el.align === 'center') startX = textX - metrics.width / 2;
      if (el.align === 'right') startX = textX - metrics.width;

      ctx.beginPath();
      ctx.strokeStyle = el.color;
      ctx.lineWidth = Math.max(1, el.fontSize / 16);
      ctx.moveTo(startX, lineY);
      ctx.lineTo(startX + metrics.width, lineY);
      ctx.stroke();
    }
  });

  ctx.restore();
};

// Note color theme maps
const NOTE_THEMES: Record<string, { bg: string; border: string; text: string; header: string }> = {
  yellow: { bg: '#fef9c3', border: '#fde047', text: '#713f12', header: '#eab308' },
  blue: { bg: '#e0f2fe', border: '#7dd3fc', text: '#0369a1', header: '#0ea5e9' },
  green: { bg: '#dcfce7', border: '#86efac', text: '#15803d', header: '#22c55e' },
  pink: { bg: '#fce7f3', border: '#f472b6', text: '#9d174d', header: '#ec4899' },
  purple: { bg: '#f3e8ff', border: '#d8b4fe', text: '#6b21a8', header: '#a855f7' },
  orange: { bg: '#ffedd5', border: '#fdba74', text: '#9a3412', header: '#f97316' },
  dark: { bg: '#1e293b', border: '#334155', text: '#f8fafc', header: '#475569' },
};

// Render Sticky Note
export const renderNote = (ctx: CanvasRenderingContext2D, el: NoteElement) => {
  ctx.save();
  ctx.globalAlpha = el.opacity ?? 1;

  const theme = NOTE_THEMES[el.theme || 'yellow'];

  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;

  ctx.fillStyle = theme.bg;
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 1.5;

  const radius = 8;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(el.x, el.y, el.width, el.height, radius);
  } else {
    ctx.rect(el.x, el.y, el.width, el.height);
  }
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Pin
  ctx.fillStyle = theme.header;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(el.x + 12, el.y + 8, Math.min(el.width - 24, 40), 4, 2);
  } else {
    ctx.rect(el.x + 12, el.y + 8, Math.min(el.width - 24, 40), 4);
  }
  ctx.fill();

  let textStartY = el.y + 20;

  if (el.title) {
    ctx.font = 'bold 14px "Caveat", "Inter", sans-serif';
    ctx.fillStyle = theme.text;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(el.title, el.x + 16, textStartY);
    textStartY += 24;
  }

  ctx.font = '14px "Patrick Hand", "Inter", sans-serif';
  ctx.fillStyle = theme.text;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  const maxTextWidth = el.width - 32;
  const lineHeight = 19;
  const paragraphs = el.text.split('\n');

  let currentY = textStartY;

  for (const para of paragraphs) {
    if (currentY > el.y + el.height - 20) break;

    const words = para.split(' ');
    let currentLine = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine + (currentLine ? ' ' : '') + words[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && n > 0) {
        ctx.fillText(currentLine, el.x + 16, currentY);
        currentLine = words[n];
        currentY += lineHeight;
        if (currentY > el.y + el.height - 20) break;
      } else {
        currentLine = testLine;
      }
    }
    if (currentY <= el.y + el.height - 20) {
      ctx.fillText(currentLine, el.x + 16, currentY);
      currentY += lineHeight;
    }
  }

  ctx.restore();
};

// Render Image with scale, flip, filter
export const renderImage = (ctx: CanvasRenderingContext2D, el: ImageElement) => {
  ctx.save();
  ctx.globalAlpha = el.opacity ?? 1;

  // Apply CSS filters if supported
  if (el.filter && el.filter !== 'none') {
    if (el.filter === 'grayscale') ctx.filter = 'grayscale(100%)';
    else if (el.filter === 'sepia') ctx.filter = 'sepia(80%)';
    else if (el.filter === 'invert') ctx.filter = 'invert(100%)';
    else if (el.filter === 'vintage') ctx.filter = 'contrast(120%) sepia(40%)';
  }

  const img = getCachedImage(el.dataUrl);

  if (img && img.complete && img.naturalWidth > 0) {
    // Handle Flip
    if (el.flipH || el.flipV) {
      ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
      ctx.scale(el.flipH ? -1 : 1, el.flipV ? -1 : 1);
      ctx.drawImage(img, -el.width / 2, -el.height / 2, el.width, el.height);
    } else {
      ctx.drawImage(img, el.x, el.y, el.width, el.height);
    }

    ctx.filter = 'none';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(el.x, el.y, el.width, el.height);
  } else {
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.fillRect(el.x, el.y, el.width, el.height);
    ctx.strokeRect(el.x, el.y, el.width, el.height);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Memuat gambar...', el.x + el.width / 2, el.y + el.height / 2);
  }

  ctx.restore();
};

// Main element renderer with rotation wrapper
export const renderElement = (ctx: CanvasRenderingContext2D, el: CanvasElement) => {
  const hasRotation = el.rotation && el.rotation !== 0;

  if (hasRotation) {
    const bounds = getElementBounds(el);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((el.rotation! * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  switch (el.type) {
    case 'stroke':
      renderStroke(ctx, el);
      break;
    case 'shape':
      renderShape(ctx, el);
      break;
    case 'text':
      renderText(ctx, el);
      break;
    case 'note':
      renderNote(ctx, el);
      break;
    case 'image':
      renderImage(ctx, el);
      break;
  }

  if (hasRotation) {
    ctx.restore();
  }
};

// Render Selection Box, Resize Handles, and Rotation Handle
export const renderSelectionBox = (
  ctx: CanvasRenderingContext2D,
  selectedElements: CanvasElement[],
  viewport: Viewport
) => {
  if (selectedElements.length === 0) return;

  const bounds = getAllElementsBounds(selectedElements);
  if (!bounds) return;

  // If a single element has rotation, rotate selection frame
  const singleElement = selectedElements.length === 1 ? selectedElements[0] : null;
  const rotation = singleElement?.rotation || 0;

  // Convert to screen space
  const sCenter = worldToScreen(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, viewport);
  const sWidth = bounds.width * viewport.zoom;
  const sHeight = bounds.height * viewport.zoom;

  ctx.save();
  ctx.translate(sCenter.x, sCenter.y);
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  // Draw bounding box
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(-sWidth / 2, -sHeight / 2, sWidth, sHeight);

  // Resize handles
  const handleSize = 8;
  const halfHandle = handleSize / 2;

  const handles = [
    { x: -sWidth / 2, y: -sHeight / 2 },          // TL
    { x: 0, y: -sHeight / 2 },                    // T
    { x: sWidth / 2, y: -sHeight / 2 },           // TR
    { x: sWidth / 2, y: 0 },                      // R
    { x: sWidth / 2, y: sHeight / 2 },            // BR
    { x: 0, y: sHeight / 2 },                     // B
    { x: -sWidth / 2, y: sHeight / 2 },           // BL
    { x: -sWidth / 2, y: 0 },                     // L
  ];

  ctx.setLineDash([]);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 1.5;

  for (const h of handles) {
    ctx.fillRect(h.x - halfHandle, h.y - halfHandle, handleSize, handleSize);
    ctx.strokeRect(h.x - halfHandle, h.y - halfHandle, handleSize, handleSize);
  }

  // ROTATION HANDLE: stalk and circle pin at top
  const rotateStalk = 24;
  ctx.beginPath();
  ctx.moveTo(0, -sHeight / 2);
  ctx.lineTo(0, -sHeight / 2 - rotateStalk);
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Circle knob
  ctx.beginPath();
  ctx.arc(0, -sHeight / 2 - rotateStalk, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.stroke();

  // Degree badge if rotated
  if (rotation !== 0) {
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    const degText = `${Math.round(rotation)}°`;
    const textW = ctx.measureText(degText).width;
    ctx.fillRect(-textW / 2 - 4, -sHeight / 2 - rotateStalk - 22, textW + 8, 16);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(degText, 0, -sHeight / 2 - rotateStalk - 14);
  }

  // Dimension badge at bottom
  ctx.font = '10px Inter, sans-serif';
  const sizeText = `${Math.round(bounds.width)} × ${Math.round(bounds.height)}`;
  const textW = ctx.measureText(sizeText).width;
  const badgeX = -textW / 2 - 8;
  const badgeY = sHeight / 2 + 8;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, textW + 16, 18, 4);
    ctx.fill();
  } else {
    ctx.fillRect(badgeX, badgeY, textW + 16, 18);
  }

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(sizeText, badgeX + 8, badgeY + 9);

  ctx.restore();
};

export type ResizeHandleType = 'tl' | 't' | 'tr' | 'r' | 'br' | 'b' | 'bl' | 'l' | 'rotate' | null;

export const getResizeHandleAtPoint = (
  bounds: { x: number; y: number; width: number; height: number },
  viewport: Viewport,
  screenX: number,
  screenY: number,
  rotation = 0,
  hitRadius = 12
): ResizeHandleType => {
  const sCenter = worldToScreen(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, viewport);
  const sWidth = bounds.width * viewport.zoom;
  const sHeight = bounds.height * viewport.zoom;

  // Un-rotate the screen point around center
  let testX = screenX - sCenter.x;
  let testY = screenY - sCenter.y;

  if (rotation !== 0) {
    const rad = (-rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rx = testX * cos - testY * sin;
    const ry = testX * sin + testY * cos;
    testX = rx;
    testY = ry;
  }

  // Check rotation knob
  const rotateStalk = 24;
  if (Math.hypot(testX - 0, testY - (-sHeight / 2 - rotateStalk)) <= hitRadius) {
    return 'rotate';
  }

  // Check 8 corner/edge handles
  const handles: { type: ResizeHandleType; x: number; y: number }[] = [
    { type: 'tl', x: -sWidth / 2, y: -sHeight / 2 },
    { type: 't', x: 0, y: -sHeight / 2 },
    { type: 'tr', x: sWidth / 2, y: -sHeight / 2 },
    { type: 'r', x: sWidth / 2, y: 0 },
    { type: 'br', x: sWidth / 2, y: sHeight / 2 },
    { type: 'b', x: 0, y: sHeight / 2 },
    { type: 'bl', x: -sWidth / 2, y: sHeight / 2 },
    { type: 'l', x: -sWidth / 2, y: 0 },
  ];

  for (const h of handles) {
    if (Math.hypot(testX - h.x, testY - h.y) <= hitRadius) {
      return h.type;
    }
  }

  return null;
};
