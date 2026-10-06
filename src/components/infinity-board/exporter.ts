/**
 * Export and Import utilities for Infinity Board
 * Supports PNG, JPEG, SVG, JSON (.infboard), and Image insertion
 */

import { Project, CanvasElement, ImageElement } from './types';
import { getAllElementsBounds, renderElement } from './canvasRenderer';
import { generateId } from './storage';

// Helper to trigger download
export const downloadFile = (dataUrlOrBlob: string | Blob, filename: string) => {
  const link = document.createElement('a');
  if (typeof dataUrlOrBlob === 'string') {
    link.href = dataUrlOrBlob;
  } else {
    link.href = URL.createObjectURL(dataUrlOrBlob);
  }
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (typeof dataUrlOrBlob !== 'string') {
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
};

interface ExportImageOptions {
  format: 'png' | 'jpeg';
  transparentBg?: boolean;
  cropToContent?: boolean;
  scale?: number; // retina scale factor, e.g. 2 for crystal sharpness
}

// Export canvas elements to PNG or JPEG
export const exportProjectToImage = async (
  project: Project,
  options: ExportImageOptions
): Promise<void> => {
  const { format, transparentBg = false, cropToContent = true, scale = 2 } = options;

  let exportX = 0;
  let exportY = 0;
  let exportWidth = window.innerWidth;
  let exportHeight = window.innerHeight;

  if (cropToContent && project.elements.length > 0) {
    const bounds = getAllElementsBounds(project.elements);
    if (bounds) {
      const padding = 60; // 60px breathing room around content
      exportX = bounds.x - padding;
      exportY = bounds.y - padding;
      exportWidth = bounds.width + padding * 2;
      exportHeight = bounds.height + padding * 2;
    }
  } else {
    // Current viewport in world coords
    exportX = -project.viewport.x / project.viewport.zoom;
    exportY = -project.viewport.y / project.viewport.zoom;
    exportWidth = window.innerWidth / project.viewport.zoom;
    exportHeight = window.innerHeight / project.viewport.zoom;
  }

  // Ensure minimum dimensions
  exportWidth = Math.max(exportWidth, 400);
  exportHeight = Math.max(exportHeight, 300);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(exportWidth * scale);
  canvas.height = Math.round(exportHeight * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create export canvas context');

  // Scale context
  ctx.scale(scale, scale);

  // Background
  if (!transparentBg || format === 'jpeg') {
    ctx.fillStyle = project.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, exportWidth, exportHeight);
  }

  // Translate to export origin
  ctx.translate(-exportX, -exportY);

  // Pre-load all images if any
  const imageElements = project.elements.filter((el): el is ImageElement => el.type === 'image');
  await Promise.all(
    imageElements.map(
      imgEl =>
        new Promise<void>(resolve => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = imgEl.dataUrl;
        })
    )
  );

  // Sort and render elements
  const sorted = [...project.elements].sort((a, b) => a.zIndex - b.zIndex);
  for (const el of sorted) {
    renderElement(ctx, el);
  }

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpeg' ? 0.92 : 1;
  const safeTitle = (project.title || 'infinity-board').toLowerCase().replace(/\s+/g, '-');
  const filename = `${safeTitle}.${format === 'jpeg' ? 'jpg' : 'png'}`;

  canvas.toBlob(
    blob => {
      if (blob) downloadFile(blob, filename);
    },
    mimeType,
    quality
  );
};

// Export project to SVG
export const exportProjectToSVG = (project: Project): void => {
  const bounds = getAllElementsBounds(project.elements);
  const padding = 50;

  const minX = bounds ? bounds.x - padding : 0;
  const minY = bounds ? bounds.y - padding : 0;
  const width = bounds ? bounds.width + padding * 2 : 800;
  const height = bounds ? bounds.height + padding * 2 : 600;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">\n`;
  svgContent += `  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="${project.backgroundColor || '#ffffff'}" />\n`;

  const sorted = [...project.elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sorted) {
    if (el.type === 'stroke') {
      if (el.points.length < 2) continue;
      let d = `M ${el.points[0].x} ${el.points[0].y}`;
      for (let i = 1; i < el.points.length - 1; i++) {
        const xc = (el.points[i].x + el.points[i + 1].x) / 2;
        const yc = (el.points[i].y + el.points[i + 1].y) / 2;
        d += ` Q ${el.points[i].x} ${el.points[i].y}, ${xc} ${yc}`;
      }
      d += ` L ${el.points[el.points.length - 1].x} ${el.points[el.points.length - 1].y}`;
      
      const alpha = el.tool === 'highlighter' ? 0.45 : el.tool === 'pencil' ? 0.75 : (el.opacity ?? 1);
      svgContent += `  <path d="${d}" fill="none" stroke="${el.color}" stroke-width="${el.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="${alpha}" />\n`;
    } else if (el.type === 'shape') {
      const fill = el.fillColor === 'none' ? 'none' : el.fillColor;
      const dash = el.strokeStyle === 'dashed' ? 'stroke-dasharray="8,6"' : '';
      if (el.shapeType === 'rectangle') {
        svgContent += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="8" fill="${fill}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" ${dash} opacity="${el.opacity ?? 1}" />\n`;
      } else if (el.shapeType === 'ellipse') {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        svgContent += `  <ellipse cx="${cx}" cy="${cy}" rx="${Math.abs(el.width / 2)}" ry="${Math.abs(el.height / 2)}" fill="${fill}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" ${dash} opacity="${el.opacity ?? 1}" />\n`;
      } else if (el.shapeType === 'line' || el.shapeType === 'arrow') {
        svgContent += `  <line x1="${el.x}" y1="${el.y}" x2="${el.x + el.width}" y2="${el.y + el.height}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" stroke-linecap="round" opacity="${el.opacity ?? 1}" />\n`;
      }
    } else if (el.type === 'text') {
      const lines = el.text.split('\n');
      const fontSize = el.fontSize || 18;
      const lineHeight = fontSize * 1.3;
      lines.forEach((line, idx) => {
        svgContent += `  <text x="${el.x}" y="${el.y + idx * lineHeight + fontSize}" font-size="${fontSize}" font-family="Inter, sans-serif" fill="${el.color}" font-weight="${el.bold ? 'bold' : 'normal'}">${escapeXml(line)}</text>\n`;
      });
    } else if (el.type === 'image') {
      svgContent += `  <image href="${el.dataUrl}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" opacity="${el.opacity ?? 1}" />\n`;
    }
  }

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const safeTitle = (project.title || 'infinity-board').toLowerCase().replace(/\s+/g, '-');
  downloadFile(blob, `${safeTitle}.svg`);
};

// XML escape helper for SVG
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Export Project as JSON (.infboard file)
export const exportProjectToJSON = (project: Project): void => {
  const exportPayload = {
    version: '1.0',
    app: 'InfinityBoard',
    timestamp: Date.now(),
    project,
  };
  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const safeTitle = (project.title || 'infinity-board').toLowerCase().replace(/\s+/g, '-');
  downloadFile(blob, `${safeTitle}.infboard`);
};

// Import project from JSON file content
export const parseProjectFromJSON = (content: string): Project => {
  const data = JSON.parse(content);
  // Support both direct project object and wrapped exportPayload
  const project: Project = data.project || data;

  if (!project || !Array.isArray(project.elements)) {
    throw new Error('Format file proyek tidak valid.');
  }

  return {
    ...project,
    id: generateId(), // fresh ID so it won't overwrite existing
    title: project.title ? `${project.title} (Impor)` : 'Proyek Impor',
    updatedAt: Date.now(),
  };
};

// Convert file to Base64 ImageElement
export const createImageElementFromFile = (
  file: File,
  worldX: number,
  worldY: number,
  maxDimension = 600
): Promise<ImageElement> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File yang dipilih bukan gambar yang didukung.'));
    }

    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        const aspectRatio = width / height;

        // Scale down if oversized
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            width = maxDimension;
            height = maxDimension / aspectRatio;
          } else {
            height = maxDimension;
            width = maxDimension * aspectRatio;
          }
        }

        const imageEl: ImageElement = {
          id: generateId(),
          type: 'image',
          x: worldX - width / 2,
          y: worldY - height / 2,
          width,
          height,
          dataUrl,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          aspectRatio,
          opacity: 1,
          zIndex: Date.now(),
        };

        resolve(imageEl);
      };
      img.onerror = () => reject(new Error('Gagal memproses file gambar.'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
};
