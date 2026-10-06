/**
 * Infinity Board Mini App (Ultra-Enhanced)
 * Infinite canvas sketch whiteboard with:
 * - Multiple Pen styles: Pen, Brush, Pencil, Highlighter, Neon Glow, Dashed, Rainbow
 * - Interactive On-Screen Ruler & Protractor (Rotatable, measurable, straight-line tracing)
 * - Canvas Lock (Screen freeze mode to prevent unwanted movement while sketching)
 * - Pinch-to-zoom on touchscreen & trackpad + zoom slider
 * - Snipping Tool & Region marking (crop, stamp, copy, or select)
 * - Rich typography (8 Google Fonts, bold, italic, underline, align, background highlight)
 * - Image upload, scaling, rotation, flip, and filters
 * - Complete multi-project manager & export/import
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { 
  CanvasElement, 
  ToolType, 
  ShapeType, 
  StrokeTool, 
  Viewport, 
  Project, 
  ProjectMetadata, 
  NoteTheme, 
  StrokeElement, 
  ShapeElement, 
  TextElement, 
  NoteElement, 
  ImageElement,
  Point,
  FontFamilyId,
  EraserMode,
  ImageFilter,
  SnippingRegion,
  CanvasLayer
} from './types';
import { 
  getOrInitCurrentProject, 
  getProjectsIndex, 
  saveProject, 
  createNewProject, 
  duplicateProject, 
  deleteProject, 
  loadProject, 
  setActiveProjectId, 
  generateId,
  createDefaultLayers
} from './storage';
import { 
  drawInfiniteGrid, 
  renderElement, 
  renderSelectionBox, 
  screenToWorld, 
  worldToScreen, 
  hitTestElement, 
  getElementBounds, 
  getAllElementsBounds,
  getResizeHandleAtPoint,
  ResizeHandleType,
  getCachedImage
} from './canvasRenderer';
import { 
  exportProjectToJSON, 
  parseProjectFromJSON, 
  createImageElementFromFile,
  downloadFile
} from './exporter';
import { BoardHeader } from './components/BoardHeader';
import { ToolbarDock } from './components/ToolbarDock';
import { PropertyPanel } from './components/PropertyPanel';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { ExportModal } from './components/ExportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { Minimap } from './components/Minimap';
import { InteractiveRuler } from './components/InteractiveRuler';
import { InteractiveProtractor } from './components/InteractiveProtractor';
import { SnippingOverlay } from './components/SnippingOverlay';
import { LayersPanel } from './components/LayersPanel';

interface InfinityBoardAppProps {
  onBackToHome?: () => void;
}

export const InfinityBoardApp: React.FC<InfinityBoardAppProps> = ({ onBackToHome = () => {} }) => {
  // Current Active Project
  const [project, setProject] = useState<Project>(() => getOrInitCurrentProject());
  const [projectsList, setProjectsList] = useState<ProjectMetadata[]>(() => getProjectsIndex());

  // Tools & Drawing State
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [previousTool, setPreviousTool] = useState<ToolType>('pen');
  const [activeStrokeTool, setActiveStrokeTool] = useState<StrokeTool>('pen');
  const [activeShapeType, setActiveShapeType] = useState<ShapeType>('rectangle');
  const [eraserMode, setEraserMode] = useState<EraserMode>('stroke');
  const [eraserSize, setEraserSize] = useState(30); // px

  // Properties State
  const [color, setColor] = useState('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [fillColor, setFillColor] = useState('none');
  const [opacity, setOpacity] = useState(1);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState<FontFamilyId>('Inter');
  const [noteTheme, setNoteTheme] = useState<NoteTheme>('yellow');

  // Canvas Lock State
  const [isCanvasLocked, setIsCanvasLocked] = useState(false);

  // Ruler & Protractor Visibility
  const [isRulerActive, setIsRulerActive] = useState(false);
  const [isProtractorActive, setIsProtractorActive] = useState(false);

  // Snipping Region State
  const [snippingRegion, setSnippingRegion] = useState<SnippingRegion | null>(null);

  // Selection & Transform State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedElements = project.elements.filter(el => selectedIds.includes(el.id));

  // Synchronize global active properties with selected element
  useEffect(() => {
    if (selectedIds.length === 1) {
      const selected = project.elements.find(el => el.id === selectedIds[0]);
      if (selected) {
        if ('color' in selected) setColor(selected.color);
        else if ('strokeColor' in selected) setColor(selected.strokeColor);
        
        if ('strokeWidth' in selected) setStrokeWidth(selected.strokeWidth);
        if ('fillColor' in selected) setFillColor(selected.fillColor);
        if ('opacity' in selected) setOpacity(selected.opacity);
        if ('fontSize' in selected) setFontSize(selected.fontSize);
        if ('fontFamily' in selected) setFontFamily(selected.fontFamily);
        if ('theme' in selected) setNoteTheme(selected.theme);
      }
    }
  }, [selectedIds, project.elements]);

  // History State (Undo / Redo)
  const [undoStack, setUndoStack] = useState<CanvasElement[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasElement[][]>([]);

  // Modals & Panels State
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isClearCanvasModalOpen, setIsClearCanvasModalOpen] = useState(false);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>(() => [project.activeLayerId || 'layer_1']);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inline Text/Note Editing State
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Refs for Canvas & Interactions
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const projectInputRef = useRef<HTMLInputElement | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pinch-to-zoom touch state
  const touchStateRef = useRef<{
    initialDist: number;
    initialZoom: number;
    initialVpX: number;
    initialVpY: number;
    midX: number;
    midY: number;
  } | null>(null);

  // Active interaction tracking
  const interactionRef = useRef<{
    isInteracting: boolean;
    mode: 'none' | 'pan' | 'draw' | 'shape' | 'drag' | 'resize' | 'rotate' | 'erase' | 'snipping';
    startScreenX: number;
    startScreenY: number;
    startWorldX: number;
    startWorldY: number;
    currentStroke: StrokeElement | null;
    currentShape: ShapeElement | null;
    dragOffsets: Map<string, { ox: number; oy: number }>;
    resizeHandle: ResizeHandleType;
    initialBounds: { x: number; y: number; width: number; height: number } | null;
    initialRotation: number;
    rotationCenter: { x: number; y: number } | null;
    isSpacePressed: boolean;
  }>({
    isInteracting: false,
    mode: 'none',
    startScreenX: 0,
    startScreenY: 0,
    startWorldX: 0,
    startWorldY: 0,
    currentStroke: null,
    currentShape: null,
    dragOffsets: new Map(),
    resizeHandle: null,
    initialBounds: null,
    initialRotation: 0,
    rotationCenter: null,
    isSpacePressed: false,
  });

  // Push current elements state to undo stack
  const pushHistory = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-40), project.elements]);
    setRedoStack([]);
  }, [project.elements]);

  // Undo action
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, project.elements]);
    setUndoStack(prev => prev.slice(0, -1));
    setProject(prev => ({
      ...prev,
      elements: previous,
      updatedAt: Date.now(),
    }));
    setSelectedIds([]);
  }, [undoStack, project.elements]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, project.elements]);
    setRedoStack(prev => prev.slice(0, -1));
    setProject(prev => ({
      ...prev,
      elements: next,
      updatedAt: Date.now(),
    }));
    setSelectedIds([]);
  }, [redoStack, project.elements]);

  // Auto-clear toast messages
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Auto-save project debounced (highly resilient, respects project deletion)
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      saveProject(project);
      setProjectsList(getProjectsIndex());
      autoSaveTimerRef.current = null;
    }, 600);
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [project]);

  // Redraw canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const isDark = project.backgroundColor === '#0f172a' || project.backgroundColor === '#020617';

    // 1. Clear background
    ctx.fillStyle = project.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw infinite grid
    drawInfiniteGrid(ctx, width, height, project.viewport, project.gridStyle, isDark);

    // 3. World space transformations
    ctx.save();
    ctx.translate(project.viewport.x, project.viewport.y);
    ctx.scale(project.viewport.zoom, project.viewport.zoom);

    // 3b. Render Custom Background Image Template if present (underneath drawings)
    if (project.backgroundImage) {
      const bgImg = getCachedImage(project.backgroundImage);
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = project.backgroundImageOpacity ?? 0.5;
        const bgW = bgImg.naturalWidth;
        const bgH = bgImg.naturalHeight;
        // Center around (500, 350) world space coordinates
        ctx.drawImage(bgImg, -bgW / 2 + 500, -bgH / 2 + 350, bgW, bgH);
        ctx.restore();
      }
    }

    // 4. Map layers for order & visibility
    const currentLayers = project.layers || createDefaultLayers();
    const layersMap = new Map(currentLayers.map((l, idx) => [l.id, { layer: l, order: idx }]));

    // Elements belonging to visible layers only
    const visibleElements = project.elements.filter(el => {
      const lid = el.layerId || 'layer_1';
      const lInfo = layersMap.get(lid);
      return !lInfo || lInfo.layer.visible;
    });

    // Sort by layer order first, then element zIndex
    const sorted = [...visibleElements].sort((a, b) => {
      const aLid = a.layerId || 'layer_1';
      const bLid = b.layerId || 'layer_1';
      const aOrder = layersMap.get(aLid)?.order ?? 1;
      const bOrder = layersMap.get(bLid)?.order ?? 1;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.zIndex - b.zIndex;
    });

    for (const el of sorted) {
      const lid = el.layerId || 'layer_1';
      const lInfo = layersMap.get(lid);
      const layerOpacity = lInfo ? lInfo.layer.opacity : 1;

      if (layerOpacity < 1) {
        ctx.save();
        ctx.globalAlpha = (el.opacity ?? 1) * layerOpacity;
        renderElement(ctx, el);
        ctx.restore();
      } else {
        renderElement(ctx, el);
      }
    }

    // 5. Render active stroke / shape preview in progress
    if (interactionRef.current.currentStroke) {
      renderElement(ctx, interactionRef.current.currentStroke);
    }
    if (interactionRef.current.currentShape) {
      renderElement(ctx, interactionRef.current.currentShape);
    }

    ctx.restore();

    // 6. Render Selection Bounding Box & Handles (Screen Space)
    if (selectedElements.length > 0) {
      renderSelectionBox(ctx, selectedElements, project.viewport);
    }

    // 7. Render Snipping Drag Box if snipping in progress
    if (interactionRef.current.mode === 'snipping') {
      const sx = interactionRef.current.startScreenX;
      const sy = interactionRef.current.startScreenY;
      const curX = interactionRef.current.startWorldX; // used as currentScreenX during snip
      const curY = interactionRef.current.startWorldY;

      ctx.save();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.fillStyle = 'rgba(14, 165, 233, 0.1)';
      const rx = Math.min(sx, curX);
      const ry = Math.min(sy, curY);
      const rw = Math.abs(curX - sx);
      const rh = Math.abs(curY - sy);
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.restore();
    }
  }, [project, selectedElements]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          handleDeleteSelected();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleResetZoom();
        return;
      }

      if (e.shiftKey && e.key === '!') {
        e.preventDefault();
        handleFitContent();
        return;
      }

      // Spacebar hold for quick hand pan (only if canvas not locked)
      if (e.code === 'Space' && !e.repeat && !interactionRef.current.isSpacePressed && !isCanvasLocked) {
        interactionRef.current.isSpacePressed = true;
        setPreviousTool(activeTool);
        setActiveTool('hand');
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case 'v': setActiveTool('select'); break;
        case 'h': if (!isCanvasLocked) setActiveTool('hand'); break;
        case 'p': setActiveTool('pen'); break;
        case 'b': setActiveTool('pencil'); break;
        case 'm': setActiveTool('highlighter'); break;
        case 'e': setActiveTool('eraser'); break;
        case 'r': setActiveTool('shape'); break;
        case 't': setActiveTool('text'); break;
        case 'n': setActiveTool('note'); break;
        case 's': setActiveTool('snipping'); break;
        case 'i': handleUploadImageClick(); break;
        case 'l': setIsCanvasLocked(prev => !prev); break;
        case 'escape':
          setSelectedIds([]);
          setEditingElementId(null);
          setSnippingRegion(null);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && interactionRef.current.isSpacePressed) {
        interactionRef.current.isSpacePressed = false;
        setActiveTool(previousTool);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTool, previousTool, isCanvasLocked, handleUndo, handleRedo, selectedIds]);

  // Handle Clipboard Paste for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const centerWorld = screenToWorld(
              window.innerWidth / 2,
              window.innerHeight / 2,
              project.viewport
            );
            try {
              const imageEl = await createImageElementFromFile(
                file,
                centerWorld.x,
                centerWorld.y
              );
              pushHistory();
              setProject(prev => ({
                ...prev,
                elements: [...prev.elements, imageEl],
                updatedAt: Date.now(),
              }));
              setSelectedIds([imageEl.id]);
              setActiveTool('select');
            } catch (err) {
              console.error('Failed to paste image', err);
            }
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [project.viewport, pushHistory]);

  // Zoom Handler at cursor anchor
  const zoomAtPoint = (factor: number, clientX: number, clientY: number) => {
    if (isCanvasLocked) return; // Cannot zoom if canvas locked

    setProject(prev => {
      const newZoom = Math.min(Math.max(prev.viewport.zoom * factor, 0.1), 5);
      const wx = (clientX - prev.viewport.x) / prev.viewport.zoom;
      const wy = (clientY - prev.viewport.y) / prev.viewport.zoom;

      const newViewportX = clientX - wx * newZoom;
      const newViewportY = clientY - wy * newZoom;

      return {
        ...prev,
        viewport: {
          x: newViewportX,
          y: newViewportY,
          zoom: newZoom,
        },
      };
    });
  };

  // Direct zoom percentage
  const handleZoomToPercent = (percent: number) => {
    if (isCanvasLocked) return;
    const targetZoom = percent / 100;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    setProject(prev => {
      const wx = (centerX - prev.viewport.x) / prev.viewport.zoom;
      const wy = (centerY - prev.viewport.y) / prev.viewport.zoom;

      return {
        ...prev,
        viewport: {
          x: centerX - wx * targetZoom,
          y: centerY - wy * targetZoom,
          zoom: targetZoom,
        },
      };
    });
  };

  // Mouse Wheel (Zoom or Pan)
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isCanvasLocked) return; // Frozen when locked

    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      zoomAtPoint(zoomFactor, e.clientX, e.clientY);
    } else {
      setProject(prev => ({
        ...prev,
        viewport: {
          ...prev.viewport,
          x: prev.viewport.x - e.deltaX,
          y: prev.viewport.y - e.deltaY,
        },
      }));
    }
  };
  // TOUCH EVENTS (Pinch-to-zoom, Two-finger Pan & Single-touch Draw)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2 && !isCanvasLocked) {
      // Pinch to zoom initiation
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      touchStateRef.current = {
        initialDist: dist,
        initialZoom: project.viewport.zoom,
        initialVpX: project.viewport.x,
        initialVpY: project.viewport.y,
        midX,
        midY,
      };
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      handleMouseDown({
        clientX: t.clientX,
        clientY: t.clientY,
        button: 0,
        shiftKey: e.shiftKey,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2 && touchStateRef.current && !isCanvasLocked) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const currentMidX = (t1.clientX + t2.clientX) / 2;
      const currentMidY = (t1.clientY + t2.clientY) / 2;

      const { initialDist, initialZoom, midX, midY } = touchStateRef.current;
      const scale = dist / initialDist;
      const newZoom = Math.min(Math.max(initialZoom * scale, 0.15), 4.5);

      const wx = (midX - project.viewport.x) / project.viewport.zoom;
      const wy = (midY - project.viewport.y) / project.viewport.zoom;

      const panDeltaX = currentMidX - midX;
      const panDeltaY = currentMidY - midY;

      setProject(prev => ({
        ...prev,
        viewport: {
          x: currentMidX - wx * newZoom + panDeltaX,
          y: currentMidY - wy * newZoom + panDeltaY,
          zoom: newZoom,
        },
      }));
    } else if (e.touches.length === 1) {
      e.preventDefault(); // Prevents page bouncing / scrolling while drawing
      const t = e.touches[0];
      handleMouseMove({
        clientX: t.clientX,
        clientY: t.clientY,
        shiftKey: e.shiftKey,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    touchStateRef.current = null;
    handleMouseUp();
  };

  // MOUSE DOWN HANDLER
  const handleMouseDown = (originalEvent: React.MouseEvent<HTMLCanvasElement> | { clientX: number; clientY: number; button?: number; shiftKey?: boolean }) => {
    const e = {
      clientX: originalEvent.clientX,
      clientY: originalEvent.clientY,
      button: 'button' in originalEvent ? originalEvent.button : 0,
      shiftKey: !!originalEvent.shiftKey,
    };
    const clientX = e.clientX;
    const clientY = e.clientY;
    const worldPos = screenToWorld(clientX, clientY, project.viewport);

    // Pan with Middle Click or Hand Tool (only if canvas not locked)
    if ((e.button === 1 || activeTool === 'hand') && !isCanvasLocked) {
      interactionRef.current = {
        ...interactionRef.current,
        isInteracting: true,
        mode: 'pan',
        startScreenX: clientX,
        startScreenY: clientY,
      };
      return;
    }

    if (e.button !== 0) return;

    // SNIPPING TOOL
    if (activeTool === 'snipping') {
      setSnippingRegion(null);
      interactionRef.current = {
        ...interactionRef.current,
        isInteracting: true,
        mode: 'snipping',
        startScreenX: clientX,
        startScreenY: clientY,
        startWorldX: clientX,
        startWorldY: clientY,
      };
      return;
    }

    // SELECT TOOL
    if (activeTool === 'select') {
      // 1. Check if clicked a handle of current selection (Resize or Rotate)
      if (selectedElements.length > 0) {
        const bounds = getAllElementsBounds(selectedElements);
        if (bounds) {
          const singleRotation = selectedElements.length === 1 ? selectedElements[0].rotation || 0 : 0;
          const handle = getResizeHandleAtPoint(bounds, project.viewport, clientX, clientY, singleRotation);

          if (handle === 'rotate') {
            const sCenter = worldToScreen(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, project.viewport);
            interactionRef.current = {
              ...interactionRef.current,
              isInteracting: true,
              mode: 'rotate',
              rotationCenter: sCenter,
              initialRotation: singleRotation,
              startScreenX: clientX,
              startScreenY: clientY,
            };
            return;
          }

          if (handle) {
            interactionRef.current = {
              ...interactionRef.current,
              isInteracting: true,
              mode: 'resize',
              resizeHandle: handle,
              startWorldX: worldPos.x,
              startWorldY: worldPos.y,
              initialBounds: { ...bounds },
            };
            return;
          }
        }
      }

      // 2. Hit test elements (top to bottom), skipping locked or hidden layers
      const lockedLayerIds = new Set(
        (project.layers || [])
          .filter(l => l.locked || !l.visible)
          .map(l => l.id)
      );
      const reversed = [...project.elements].sort((a, b) => b.zIndex - a.zIndex);
      const clicked = reversed.find(el => 
        !lockedLayerIds.has(el.layerId || 'layer_1') && hitTestElement(el, worldPos.x, worldPos.y)
      );

      if (clicked) {
        if (e.shiftKey) {
          setSelectedIds(prev =>
            prev.includes(clicked.id) ? prev.filter(id => id !== clicked.id) : [...prev, clicked.id]
          );
        } else {
          if (!selectedIds.includes(clicked.id)) {
            setSelectedIds([clicked.id]);
          }
        }

        const dragOffsets = new Map<string, { ox: number; oy: number }>();
        const targetIds = selectedIds.includes(clicked.id) ? selectedIds : [clicked.id];
        for (const id of targetIds) {
          const el = project.elements.find(item => item.id === id);
          if (el) {
            dragOffsets.set(id, { ox: worldPos.x - el.x, oy: worldPos.y - el.y });
          }
        }

        interactionRef.current = {
          ...interactionRef.current,
          isInteracting: true,
          mode: 'drag',
          startWorldX: worldPos.x,
          startWorldY: worldPos.y,
          dragOffsets,
        };
      } else {
        if (!e.shiftKey) {
          setSelectedIds([]);
        }
      }
      return;
    }

    // ERASER TOOL (Only erases elements on the active layer!)
    if (activeTool === 'eraser') {
      const activeLayerId = project.activeLayerId || 'layer_1';
      const activeLayerInfo = (project.layers || []).find(l => l.id === activeLayerId);
      if (activeLayerInfo?.locked || activeLayerInfo?.visible === false) {
        setToastMessage(`Layer "${activeLayerInfo?.name}" sedang dikunci atau disembunyikan.`);
        return;
      }

      if (eraserMode === 'stroke') {
        const reversed = [...project.elements].sort((a, b) => b.zIndex - a.zIndex);
        const hit = reversed.find(el => 
          (el.layerId || 'layer_1') === activeLayerId && hitTestElement(el, worldPos.x, worldPos.y, eraserSize)
        );
        if (hit) {
          pushHistory();
          setProject(prev => ({
            ...prev,
            elements: prev.elements.filter(item => item.id !== hit.id),
            updatedAt: Date.now(),
          }));
        }
      } else {
        // Brush eraser: remove points inside radius on the active layer
        erasePointsInRadius(worldPos.x, worldPos.y, eraserSize / project.viewport.zoom);
      }

      interactionRef.current = {
        ...interactionRef.current,
        isInteracting: true,
        mode: 'erase',
      };
      return;
    }

    // LAYER ENFORCEMENT FOR CREATION TOOLS
    // Block drawing, shapes, text, or notes if the active layer is locked or hidden
    const isCreationTool = ['pen', 'brush', 'pencil', 'highlighter', 'glow', 'dashed', 'rainbow', 'shape', 'text', 'note'].includes(activeTool);
    if (isCreationTool) {
      const activeLayerId = project.activeLayerId || 'layer_1';
      const activeLayerInfo = (project.layers || []).find(l => l.id === activeLayerId);
      if (activeLayerInfo?.locked || activeLayerInfo?.visible === false) {
        setToastMessage(`Layer "${activeLayerInfo?.name || 'Utama'}" sedang dikunci atau disembunyikan. Aktifkan di panel Layer & BG.`);
        return;
      }
    }

    // DRAWING TOOLS (Pen, Brush, Pencil, Highlighter, Glow, Dashed, Rainbow)
    const isPenLike = ['pen', 'brush', 'pencil', 'highlighter', 'glow', 'dashed', 'rainbow'].includes(activeTool);
    if (isPenLike) {
      const toolType = activeTool as StrokeTool;
      const initialPoint: Point = { x: worldPos.x, y: worldPos.y };
      const newStroke: StrokeElement = {
        id: generateId(),
        type: 'stroke',
        tool: toolType,
        points: [initialPoint],
        color,
        strokeWidth: toolType === 'highlighter' ? Math.max(strokeWidth * 3.5, 22) : strokeWidth,
        opacity,
        x: worldPos.x,
        y: worldPos.y,
        width: 1,
        height: 1,
        zIndex: Date.now(),
        layerId: project.activeLayerId || 'layer_1',
      };

      interactionRef.current = {
        ...interactionRef.current,
        isInteracting: true,
        mode: 'draw',
        currentStroke: newStroke,
        startWorldX: worldPos.x,
        startWorldY: worldPos.y,
      };
      return;
    }

    // SHAPE TOOL
    if (activeTool === 'shape') {
      const newShape: ShapeElement = {
        id: generateId(),
        type: 'shape',
        shapeType: activeShapeType,
        x: worldPos.x,
        y: worldPos.y,
        width: 0,
        height: 0,
        strokeColor: color,
        fillColor: fillColor,
        strokeWidth,
        strokeStyle: 'solid',
        opacity,
        zIndex: Date.now(),
        layerId: project.activeLayerId || 'layer_1',
      };

      interactionRef.current = {
        ...interactionRef.current,
        isInteracting: true,
        mode: 'shape',
        currentShape: newShape,
        startWorldX: worldPos.x,
        startWorldY: worldPos.y,
      };
      return;
    }

    // TEXT TOOL
    if (activeTool === 'text') {
      const newId = generateId();
      const newText: TextElement = {
        id: newId,
        type: 'text',
        x: worldPos.x,
        y: worldPos.y,
        width: 220,
        height: 45,
        text: 'Ketik tulisan di sini...',
        fontSize,
        fontFamily,
        color,
        bold: false,
        italic: false,
        opacity,
        zIndex: Date.now(),
        layerId: project.activeLayerId || 'layer_1',
      };

      pushHistory();
      setProject(prev => ({
        ...prev,
        elements: [...prev.elements, newText],
        updatedAt: Date.now(),
      }));

      setSelectedIds([newId]);
      setEditingElementId(newId);
      setEditingText('Ketik tulisan di sini...');
      setActiveTool('select');
      return;
    }

    // STICKY NOTE TOOL
    if (activeTool === 'note') {
      const newId = generateId();
      const newNote: NoteElement = {
        id: newId,
        type: 'note',
        x: worldPos.x - 110,
        y: worldPos.y - 80,
        width: 220,
        height: 160,
        text: 'Tulis ide di sini...',
        theme: noteTheme,
        title: 'Catatan',
        opacity: 1,
        zIndex: Date.now(),
        layerId: project.activeLayerId || 'layer_1',
      };

      pushHistory();
      setProject(prev => ({
        ...prev,
        elements: [...prev.elements, newNote],
        updatedAt: Date.now(),
      }));

      setSelectedIds([newId]);
      setEditingElementId(newId);
      setEditingText('Tulis ide di sini...');
      setActiveTool('select');
      return;
    }
  };

  // Erase points inside radius (ONLY affecting elements on the currently active layer)
  const erasePointsInRadius = (wx: number, wy: number, r: number) => {
    const activeLayerId = project.activeLayerId || 'layer_1';
    
    // Check if the active layer is locked or hidden
    const activeLayerInfo = (project.layers || []).find(l => l.id === activeLayerId);
    if (activeLayerInfo?.locked || activeLayerInfo?.visible === false) {
      return;
    }

    setProject(prev => {
      let changed = false;
      const updated = prev.elements
        .map(el => {
          // Skip if NOT on the active layer
          if ((el.layerId || 'layer_1') !== activeLayerId) {
            return el;
          }

          if (el.type === 'stroke') {
            const remainingPoints = el.points.filter(pt => Math.hypot(pt.x - wx, pt.y - wy) > r);
            if (remainingPoints.length !== el.points.length) {
              changed = true;
              if (remainingPoints.length <= 1) return null;
              return { ...el, points: remainingPoints };
            }
          } else {
            if (hitTestElement(el, wx, wy, r)) {
              changed = true;
              return null;
            }
          }
          return el;
        })
        .filter(Boolean) as CanvasElement[];

      return changed ? { ...prev, elements: updated, updatedAt: Date.now() } : prev;
    });
  };

  // MOUSE MOVE HANDLER
  const handleMouseMove = (originalEvent: React.MouseEvent<HTMLCanvasElement> | { clientX: number; clientY: number; shiftKey?: boolean }) => {
    const e = {
      clientX: originalEvent.clientX,
      clientY: originalEvent.clientY,
      shiftKey: !!originalEvent.shiftKey,
    };
    const clientX = e.clientX;
    const clientY = e.clientY;
    const worldPos = screenToWorld(clientX, clientY, project.viewport);
    const { isInteracting, mode } = interactionRef.current;

    if (!isInteracting) {
      if (activeTool === 'select' && selectedElements.length > 0) {
        const bounds = getAllElementsBounds(selectedElements);
        if (bounds) {
          const singleRot = selectedElements.length === 1 ? selectedElements[0].rotation || 0 : 0;
          const handle = getResizeHandleAtPoint(bounds, project.viewport, clientX, clientY, singleRot);
          if (handle === 'rotate') {
            canvasRef.current!.style.cursor = 'crosshair';
            return;
          }
          if (handle) {
            if (handle === 'tl' || handle === 'br') canvasRef.current!.style.cursor = 'nwse-resize';
            else if (handle === 'tr' || handle === 'bl') canvasRef.current!.style.cursor = 'nesw-resize';
            else if (handle === 't' || handle === 'b') canvasRef.current!.style.cursor = 'ns-resize';
            else canvasRef.current!.style.cursor = 'ew-resize';
            return;
          }
        }
      }
      return;
    }

    // Mode: PAN
    if (mode === 'pan' && !isCanvasLocked) {
      const dx = clientX - interactionRef.current.startScreenX;
      const dy = clientY - interactionRef.current.startScreenY;
      interactionRef.current.startScreenX = clientX;
      interactionRef.current.startScreenY = clientY;

      setProject(prev => ({
        ...prev,
        viewport: {
          ...prev.viewport,
          x: prev.viewport.x + dx,
          y: prev.viewport.y + dy,
        },
      }));
      return;
    }

    // Mode: SNIPPING DRAG
    if (mode === 'snipping') {
      interactionRef.current.startWorldX = clientX;
      interactionRef.current.startWorldY = clientY;
      renderCanvas();
      return;
    }

    // Mode: ROTATE
    if (mode === 'rotate' && interactionRef.current.rotationCenter) {
      const center = interactionRef.current.rotationCenter;
      const angleRad = Math.atan2(clientY - center.y, clientX - center.x);
      let deg = (angleRad * 180) / Math.PI + 90; // offset so top is 0°
      if (e.shiftKey) {
        deg = Math.round(deg / 15) * 15; // snap to 15 degrees
      }

      setProject(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (selectedIds.includes(el.id)) {
            return { ...el, rotation: Math.round(deg) };
          }
          return el;
        }),
      }));
      return;
    }

    // Mode: DRAW (Stroke)
    if (mode === 'draw' && interactionRef.current.currentStroke) {
      const stroke = interactionRef.current.currentStroke;
      const pts = stroke.points;
      const lastPt = pts[pts.length - 1];

      if (Math.hypot(worldPos.x - lastPt.x, worldPos.y - lastPt.y) > 2) {
        stroke.points.push({ x: worldPos.x, y: worldPos.y });
        renderCanvas();
      }
      return;
    }

    // Mode: SHAPE
    if (mode === 'shape' && interactionRef.current.currentShape) {
      const shape = interactionRef.current.currentShape;
      const sx = interactionRef.current.startWorldX;
      const sy = interactionRef.current.startWorldY;

      if (shape.shapeType === 'line' || shape.shapeType === 'arrow') {
        shape.x = sx;
        shape.y = sy;
        shape.width = worldPos.x - sx;
        shape.height = worldPos.y - sy;
      } else {
        shape.x = Math.min(sx, worldPos.x);
        shape.y = Math.min(sy, worldPos.y);
        shape.width = Math.abs(worldPos.x - sx);
        shape.height = Math.abs(worldPos.y - sy);
      }
      renderCanvas();
      return;
    }

    // Mode: DRAG SELECTED ELEMENTS
    if (mode === 'drag') {
      const { dragOffsets } = interactionRef.current;
      setProject(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (dragOffsets.has(el.id)) {
            const offset = dragOffsets.get(el.id)!;
            const newX = worldPos.x - offset.ox;
            const newY = worldPos.y - offset.oy;
            const dx = newX - el.x;
            const dy = newY - el.y;

            if (el.type === 'stroke') {
              return {
                ...el,
                x: newX,
                y: newY,
                points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy })),
              };
            }
            return {
              ...el,
              x: newX,
              y: newY,
            };
          }
          return el;
        }),
      }));
      return;
    }

    // Mode: RESIZE
    if (mode === 'resize' && interactionRef.current.initialBounds) {
      const { resizeHandle, initialBounds, startWorldX, startWorldY } = interactionRef.current;
      const dx = worldPos.x - startWorldX;
      const dy = worldPos.y - startWorldY;

      let newX = initialBounds.x;
      let newY = initialBounds.y;
      let newW = initialBounds.width;
      let newH = initialBounds.height;

      if (resizeHandle?.includes('r')) newW = Math.max(initialBounds.width + dx, 15);
      if (resizeHandle?.includes('b')) newH = Math.max(initialBounds.height + dy, 15);
      if (resizeHandle?.includes('l')) {
        newW = Math.max(initialBounds.width - dx, 15);
        newX = initialBounds.x + initialBounds.width - newW;
      }
      if (resizeHandle?.includes('t')) {
        newH = Math.max(initialBounds.height - dy, 15);
        newY = initialBounds.y + initialBounds.height - newH;
      }

      const scaleX = newW / initialBounds.width;
      const scaleY = newH / initialBounds.height;

      setProject(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (selectedIds.includes(el.id)) {
            if (el.type === 'stroke') {
              return {
                ...el,
                points: el.points.map(p => ({
                  x: newX + (p.x - initialBounds.x) * scaleX,
                  y: newY + (p.y - initialBounds.y) * scaleY,
                })),
                x: newX + (el.x - initialBounds.x) * scaleX,
                y: newY + (el.y - initialBounds.y) * scaleY,
                width: el.width * scaleX,
                height: el.height * scaleY,
              };
            }
            return {
              ...el,
              x: newX + (el.x - initialBounds.x) * scaleX,
              y: newY + (el.y - initialBounds.y) * scaleY,
              width: el.width * scaleX,
              height: el.height * scaleY,
            };
          }
          return el;
        }),
      }));
      return;
    }

    // Mode: ERASE SWIPE (Only erases elements on the active layer!)
    if (mode === 'erase') {
      const activeLayerId = project.activeLayerId || 'layer_1';
      const activeLayerInfo = (project.layers || []).find(l => l.id === activeLayerId);
      if (activeLayerInfo?.locked || activeLayerInfo?.visible === false) {
        return;
      }

      if (eraserMode === 'stroke') {
        setProject(prev => {
          const hit = prev.elements.find(el => 
            (el.layerId || 'layer_1') === activeLayerId && hitTestElement(el, worldPos.x, worldPos.y, eraserSize)
          );
          if (hit) {
            return {
              ...prev,
              elements: prev.elements.filter(item => item.id !== hit.id),
              updatedAt: Date.now(),
            };
          }
          return prev;
        });
      } else {
        erasePointsInRadius(worldPos.x, worldPos.y, eraserSize / project.viewport.zoom);
      }
      return;
    }
  };

  // MOUSE UP HANDLER
  const handleMouseUp = () => {
    const { isInteracting, mode, currentStroke, currentShape } = interactionRef.current;
    if (!isInteracting) return;

    if (mode === 'snipping') {
      const sx = interactionRef.current.startScreenX;
      const sy = interactionRef.current.startScreenY;
      const ex = interactionRef.current.startWorldX;
      const ey = interactionRef.current.startWorldY;

      const rw = Math.abs(ex - sx);
      const rh = Math.abs(ey - sy);

      if (rw > 15 && rh > 15) {
        setSnippingRegion({
          x: Math.min(sx, ex),
          y: Math.min(sy, ey),
          width: rw,
          height: rh,
        });
      }
    } else if (mode === 'draw' && currentStroke) {
      if (currentStroke.points.length > 0) {
        pushHistory();
        const b = getElementBounds(currentStroke);
        currentStroke.x = b.x;
        currentStroke.y = b.y;
        currentStroke.width = b.width;
        currentStroke.height = b.height;

        setProject(prev => ({
          ...prev,
          elements: [...prev.elements, currentStroke],
          updatedAt: Date.now(),
        }));
      }
    } else if (mode === 'shape' && currentShape) {
      if (Math.abs(currentShape.width) > 5 || Math.abs(currentShape.height) > 5) {
        pushHistory();
        setProject(prev => ({
          ...prev,
          elements: [...prev.elements, currentShape],
          updatedAt: Date.now(),
        }));
        setSelectedIds([currentShape.id]);
        setActiveTool('select');
      }
    } else if (mode === 'drag' || mode === 'resize' || mode === 'rotate') {
      pushHistory();
    }

    interactionRef.current = {
      ...interactionRef.current,
      isInteracting: false,
      mode: 'none',
      currentStroke: null,
      currentShape: null,
      dragOffsets: new Map(),
      resizeHandle: null,
      initialBounds: null,
      rotationCenter: null,
    };

    renderCanvas();
  };

  // Double click element to edit text/note
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const worldPos = screenToWorld(e.clientX, e.clientY, project.viewport);
    const reversed = [...project.elements].sort((a, b) => b.zIndex - a.zIndex);
    const hit = reversed.find(el => hitTestElement(el, worldPos.x, worldPos.y));

    if (hit && (hit.type === 'text' || hit.type === 'note')) {
      setEditingElementId(hit.id);
      setEditingText(hit.text);
    }
  };

  // Save inline text / note edits
  const handleSaveInlineText = () => {
    if (!editingElementId) return;
    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (el.id === editingElementId) {
          return {
            ...el,
            text: editingText,
          };
        }
        return el;
      }),
      updatedAt: Date.now(),
    }));
    setEditingElementId(null);
  };

  // Selection actions
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.filter(el => !selectedIds.includes(el.id)),
      updatedAt: Date.now(),
    }));
    setSelectedIds([]);
  };

  const handleDuplicateSelected = () => {
    if (selectedIds.length === 0) return;
    pushHistory();
    const newElements: CanvasElement[] = [];
    const newSelectedIds: string[] = [];

    for (const id of selectedIds) {
      const el = project.elements.find(item => item.id === id);
      if (el) {
        const newId = generateId();
        newSelectedIds.push(newId);
        const offset = 30;

        if (el.type === 'stroke') {
          newElements.push({
            ...el,
            id: newId,
            x: el.x + offset,
            y: el.y + offset,
            points: el.points.map(p => ({ x: p.x + offset, y: p.y + offset })),
            zIndex: Date.now(),
          });
        } else {
          newElements.push({
            ...el,
            id: newId,
            x: el.x + offset,
            y: el.y + offset,
            zIndex: Date.now(),
          });
        }
      }
    }

    setProject(prev => ({
      ...prev,
      elements: [...prev.elements, ...newElements],
      updatedAt: Date.now(),
    }));
    setSelectedIds(newSelectedIds);
  };

  const handleBringToFront = () => {
    if (selectedIds.length === 0) return;
    pushHistory();
    const maxZ = Math.max(...project.elements.map(el => el.zIndex), 0);
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (selectedIds.includes(el.id)) {
          return { ...el, zIndex: maxZ + 1 };
        }
        return el;
      }),
    }));
  };

  const handleSendToBack = () => {
    if (selectedIds.length === 0) return;
    pushHistory();
    const minZ = Math.min(...project.elements.map(el => el.zIndex), 0);
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (selectedIds.includes(el.id)) {
          return { ...el, zIndex: minZ - 1 };
        }
        return el;
      }),
    }));
  };

  // Rotation & Flipping Actions
  const handleRotateSelectedBy = (degrees: number) => {
    if (selectedIds.length === 0) return;
    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (selectedIds.includes(el.id)) {
          const current = el.rotation || 0;
          return { ...el, rotation: (current + degrees) % 360 };
        }
        return el;
      }),
    }));
  };

  const handleSetRotationSelected = (degrees: number) => {
    if (selectedIds.length === 0) return;
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (selectedIds.includes(el.id)) {
          return { ...el, rotation: degrees };
        }
        return el;
      }),
    }));
  };

  const handleFlipHorizontalSelected = () => {
    if (selectedIds.length === 0) return;
    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (selectedIds.includes(el.id) && el.type === 'image') {
          return { ...el, flipH: !el.flipH };
        }
        return el;
      }),
    }));
  };

  const handleFlipVerticalSelected = () => {
    if (selectedIds.length === 0) return;
    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (selectedIds.includes(el.id) && el.type === 'image') {
          return { ...el, flipV: !el.flipV };
        }
        return el;
      }),
    }));
  };

  const handleChangeImageFilter = (flt: ImageFilter) => {
    if (selectedIds.length === 0) return;
    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (selectedIds.includes(el.id) && el.type === 'image') {
          return { ...el, filter: flt };
        }
        return el;
      }),
    }));
  };

  // Typography toggles for selected text
  const handleToggleBold = () => {
    if (selectedIds.length === 0) return;
    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (selectedIds.includes(el.id) && el.type === 'text') {
          return { ...el, bold: !el.bold };
        }
        return el;
      }),
    }));
  };

  const handleToggleItalic = () => {
    if (selectedIds.length === 0) return;
    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (selectedIds.includes(el.id) && el.type === 'text') {
          return { ...el, italic: !el.italic };
        }
        return el;
      }),
    }));
  };

  const handleToggleUnderline = () => {
    if (selectedIds.length === 0) return;
    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (selectedIds.includes(el.id) && el.type === 'text') {
          return { ...el, underline: !el.underline };
        }
        return el;
      }),
    }));
  };

  const handleChangeTextAlign = (align: 'left' | 'center' | 'right') => {
    if (selectedIds.length === 0) return;
    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (selectedIds.includes(el.id) && el.type === 'text') {
          return { ...el, align };
        }
        return el;
      }),
    }));
  };

  // Draw straight line along ruler top edge
  const handleDrawLineAlongRuler = (startX: number, startY: number, endX: number, endY: number) => {
    const wStart = screenToWorld(startX, startY, project.viewport);
    const wEnd = screenToWorld(endX, endY, project.viewport);

    const newLine: ShapeElement = {
      id: generateId(),
      type: 'shape',
      shapeType: 'line',
      x: wStart.x,
      y: wStart.y,
      width: wEnd.x - wStart.x,
      height: wEnd.y - wStart.y,
      strokeColor: color,
      fillColor: 'none',
      strokeWidth,
      strokeStyle: 'solid',
      opacity,
      zIndex: Date.now(),
    };

    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: [...prev.elements, newLine],
      updatedAt: Date.now(),
    }));
  };

  // Draw angle arc from protractor
  const handleDrawAngle = (cx: number, cy: number, r: number, startRad: number, endRad: number) => {
    const wCenter = screenToWorld(cx, cy, project.viewport);
    const wRadius = r / project.viewport.zoom;

    // Generate arc points
    const points: Point[] = [];
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const a = startRad + (endRad - startRad) * (i / steps);
      points.push({
        x: wCenter.x + wRadius * Math.cos(a),
        y: wCenter.y + wRadius * Math.sin(a),
      });
    }

    const arcStroke: StrokeElement = {
      id: generateId(),
      type: 'stroke',
      tool: 'pen',
      points,
      color,
      strokeWidth,
      opacity,
      x: wCenter.x - wRadius,
      y: wCenter.y - wRadius,
      width: wRadius * 2,
      height: wRadius * 2,
      zIndex: Date.now(),
    };

    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: [...prev.elements, arcStroke],
      updatedAt: Date.now(),
    }));
  };

  // SNIPPING ACTIONS
  const getSnippedCanvas = (): HTMLCanvasElement | null => {
    if (!snippingRegion || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const off = document.createElement('canvas');
    off.width = snippingRegion.width;
    off.height = snippingRegion.height;
    const ctx = off.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(
      canvas,
      snippingRegion.x,
      snippingRegion.y,
      snippingRegion.width,
      snippingRegion.height,
      0,
      0,
      snippingRegion.width,
      snippingRegion.height
    );
    return off;
  };

  const handleCopyRegion = () => {
    const off = getSnippedCanvas();
    if (!off) return;
    off.toBlob(blob => {
      if (blob && navigator.clipboard && (window as any).ClipboardItem) {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        alert('Potongan wilayah berhasil disalin ke Clipboard!');
      }
    });
    setSnippingRegion(null);
  };

  const handleDownloadRegion = () => {
    const off = getSnippedCanvas();
    if (!off) return;
    off.toBlob(blob => {
      if (blob) downloadFile(blob, `snipping-${Date.now()}.png`);
    });
    setSnippingRegion(null);
  };

  const handleStampRegionToCanvas = () => {
    const off = getSnippedCanvas();
    if (!off || !snippingRegion) return;
    const dataUrl = off.toDataURL('image/png');
    const centerWorld = screenToWorld(
      snippingRegion.x + snippingRegion.width / 2 + 50,
      snippingRegion.y + snippingRegion.height / 2 + 50,
      project.viewport
    );

    const stampedImg: ImageElement = {
      id: generateId(),
      type: 'image',
      dataUrl,
      naturalWidth: snippingRegion.width,
      naturalHeight: snippingRegion.height,
      aspectRatio: snippingRegion.width / snippingRegion.height,
      x: centerWorld.x - (snippingRegion.width / project.viewport.zoom) / 2,
      y: centerWorld.y - (snippingRegion.height / project.viewport.zoom) / 2,
      width: snippingRegion.width / project.viewport.zoom,
      height: snippingRegion.height / project.viewport.zoom,
      opacity: 1,
      zIndex: Date.now(),
    };

    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: [...prev.elements, stampedImg],
      updatedAt: Date.now(),
    }));
    setSelectedIds([stampedImg.id]);
    setActiveTool('select');
    setSnippingRegion(null);
  };

  const handleSelectElementsInRegion = () => {
    if (!snippingRegion) return;
    const wTL = screenToWorld(snippingRegion.x, snippingRegion.y, project.viewport);
    const wBR = screenToWorld(
      snippingRegion.x + snippingRegion.width,
      snippingRegion.y + snippingRegion.height,
      project.viewport
    );

    const regX = Math.min(wTL.x, wBR.x);
    const regY = Math.min(wTL.y, wBR.y);
    const regW = Math.abs(wBR.x - wTL.x);
    const regH = Math.abs(wBR.y - wTL.y);

    const inside = project.elements.filter(el => {
      const b = getElementBounds(el);
      return (
        b.x >= regX &&
        b.y >= regY &&
        b.x + b.width <= regX + regW &&
        b.y + b.height <= regY + regH
      );
    });

    if (inside.length > 0) {
      setSelectedIds(inside.map(el => el.id));
      setActiveTool('select');
    } else {
      alert('Tidak ada objek utuh di dalam wilayah yang ditandai.');
    }
    setSnippingRegion(null);
  };

  // Zoom to fit content
  const handleFitContent = () => {
    if (project.elements.length === 0) {
      handleResetZoom();
      return;
    }
    const bounds = getAllElementsBounds(project.elements);
    if (!bounds) return;

    const padding = 80;
    const availW = window.innerWidth - padding * 2;
    const availH = window.innerHeight - padding * 2;

    const scaleX = availW / bounds.width;
    const scaleY = availH / bounds.height;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.15), 2);

    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    setProject(prev => ({
      ...prev,
      viewport: {
        x: window.innerWidth / 2 - centerX * newZoom,
        y: window.innerHeight / 2 - centerY * newZoom,
        zoom: newZoom,
      },
    }));
  };

  const handleResetZoom = () => {
    setProject(prev => ({
      ...prev,
      viewport: {
        x: window.innerWidth / 2 - 400,
        y: window.innerHeight / 2 - 300,
        zoom: 1,
      },
    }));
  };

  const handleClearCanvas = () => {
    if (project.elements.length === 0) return;
    if (confirm('Yakin ingin membersihkan semua coretan dan elemen di papan ini?')) {
      pushHistory();
      setProject(prev => ({
        ...prev,
        elements: [],
        updatedAt: Date.now(),
      }));
      setSelectedIds([]);
    }
  };

  // Image Upload Button Trigger
  const handleUploadImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const centerWorld = screenToWorld(
      window.innerWidth / 2,
      window.innerHeight / 2,
      project.viewport
    );

    try {
      const imageEl = await createImageElementFromFile(file, centerWorld.x, centerWorld.y);
      pushHistory();
      setProject(prev => ({
        ...prev,
        elements: [...prev.elements, imageEl],
        updatedAt: Date.now(),
      }));
      setSelectedIds([imageEl.id]);
      setActiveTool('select');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal mengunggah gambar');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Drag and Drop files onto canvas directly
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const worldPos = screenToWorld(e.clientX, e.clientY, project.viewport);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.name.endsWith('.json') || file.name.endsWith('.infboard')) {
        const text = await file.text();
        try {
          const imported = parseProjectFromJSON(text);
          saveProject(imported);
          setActiveProjectId(imported.id);
          setProject(imported);
          setProjectsList(getProjectsIndex());
          alert(`Berhasil mengimpor proyek "${imported.title}"!`);
        } catch (err) {
          alert('Gagal mengimpor file proyek: ' + (err instanceof Error ? err.message : ''));
        }
        return;
      }

      if (file.type.startsWith('image/')) {
        try {
          const imageEl = await createImageElementFromFile(
            file,
            worldPos.x + i * 40,
            worldPos.y + i * 40
          );
          pushHistory();
          setProject(prev => ({
            ...prev,
            elements: [...prev.elements, imageEl],
            updatedAt: Date.now(),
          }));
          setSelectedIds([imageEl.id]);
          setActiveTool('select');
        } catch (err) {
          console.error('Failed to import dropped image', err);
        }
      }
    }
  };

  // Import JSON Project
  const handleImportProjectClick = () => {
    projectInputRef.current?.click();
  };

  const handleProjectInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      const text = await file.text();
      const imported = parseProjectFromJSON(text);
      saveProject(imported);
      setActiveProjectId(imported.id);
      setProject(imported);
      setProjectsList(getProjectsIndex());
      setIsProjectsModalOpen(false);
      alert(`Proyek "${imported.title}" berhasil diimpor!`);
    } catch (err) {
      alert('Gagal membaca file proyek: ' + (err instanceof Error ? err.message : 'Format tidak dikenal'));
    } finally {
      if (projectInputRef.current) projectInputRef.current.value = '';
    }
  };

  // Project Switch / Management Actions
  const handleSelectProject = (id: string, saveCurrent = true) => {
    if (saveCurrent) {
      saveProject(project);
    }
    const target = loadProject(id);
    if (target) {
      setActiveProjectId(id);
      setProject(target);
      setSelectedLayerIds([target.activeLayerId || 'layer_1']);
      setUndoStack([]);
      setRedoStack([]);
      setSelectedIds([]);
    }
  };

  const handleCreateNewProject = (title?: string) => {
    saveProject(project);
    const created = createNewProject(title);
    setProject(created);
    setProjectsList(getProjectsIndex());
    setSelectedLayerIds([created.activeLayerId || 'layer_1']);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedIds([]);
  };

  const handleDuplicateProject = (id: string) => {
    const duplicated = duplicateProject(id);
    if (duplicated) {
      setProjectsList(getProjectsIndex());
    }
  };

  // Project Swapping & Deletion
  const handleDeleteProject = (id: string) => {
    // 1. Cancel any active auto-save timeout to prevent resurrection
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    const targetProject = projectsList.find(p => p.id === id);
    const deletedTitle = targetProject?.title || 'Proyek';

    // 2. Perform raw delete from localStorage Index
    deleteProject(id);
    const updatedList = getProjectsIndex();
    setProjectsList(updatedList);

    // 3. Switch project if active project was deleted
    if (project.id === id) {
      if (updatedList.length > 0) {
        handleSelectProject(updatedList[0].id, false);
      } else {
        const created = createNewProject('Proyek Sketsa Baru');
        setProject(created);
        setProjectsList(getProjectsIndex());
        setSelectedLayerIds([created.activeLayerId || 'layer_1']);
        setUndoStack([]);
        setRedoStack([]);
        setSelectedIds([]);
      }
    }

    setToastMessage(`Proyek "${deletedTitle}" berhasil dihapus.`);
  };

  const handleRenameProject = (id: string, newTitle: string) => {
    if (project.id === id) {
      setProject(prev => ({ ...prev, title: newTitle }));
    }
    const target = loadProject(id);
    if (target) {
      target.title = newTitle;
      saveProject(target);
      setProjectsList(getProjectsIndex());
    }
  };

  const handleExportProjectById = (id: string) => {
    const target = id === project.id ? project : loadProject(id);
    if (target) {
      exportProjectToJSON(target);
    }
  };

  // ==========================================
  // LAYER MANAGEMENT CALLBACKS
  // ==========================================
  const handleSelectActiveLayer = (layerId: string) => {
    setProject(prev => ({ ...prev, activeLayerId: layerId }));
    setSelectedLayerIds([layerId]);
  };

  const handleAddLayer = () => {
    pushHistory();
    const newLayerId = 'layer_' + Math.random().toString(36).substring(2, 9);
    const currentL = project.layers || createDefaultLayers();
    const newLayer: CanvasLayer = {
      id: newLayerId,
      name: `Layer ${currentL.length}`,
      visible: true,
      locked: false,
      opacity: 1,
    };
    setProject(prev => ({
      ...prev,
      layers: [...(prev.layers || createDefaultLayers()), newLayer],
      activeLayerId: newLayerId,
      updatedAt: Date.now(),
    }));
    setSelectedLayerIds([newLayerId]);
    setToastMessage(`Layer "${newLayer.name}" berhasil dibuat.`);
  };

  const handleDeleteLayer = (layerId: string) => {
    const currentL = project.layers || createDefaultLayers();
    if (currentL.length <= 1) return;
    const target = currentL.find(l => l.id === layerId);
    if (target?.isBackground) {
      alert('Layer Latar Belakang (BG) tidak dapat dihapus.');
      return;
    }
    pushHistory();
    const remaining = currentL.filter(l => l.id !== layerId);
    const fallbackId = remaining.find(l => !l.isBackground)?.id || remaining[0].id;

    // Reassign elements on this layer to fallback layer
    setProject(prev => ({
      ...prev,
      layers: remaining,
      activeLayerId: prev.activeLayerId === layerId ? fallbackId : prev.activeLayerId,
      elements: prev.elements.map(el => (el.layerId === layerId ? { ...el, layerId: fallbackId } : el)),
      updatedAt: Date.now(),
    }));
    setSelectedLayerIds(prev => {
      const filtered = prev.filter(id => id !== layerId);
      return filtered.length > 0 ? filtered : [fallbackId];
    });
    setToastMessage(`Layer "${target?.name || 'tersebut'}" telah dihapus.`);
  };

  const handleDuplicateLayer = (layerId: string) => {
    const currentL = project.layers || createDefaultLayers();
    const source = currentL.find(l => l.id === layerId);
    if (!source) return;

    pushHistory();
    const newLayerId = 'layer_' + Math.random().toString(36).substring(2, 9);
    const newLayer: CanvasLayer = {
      ...source,
      id: newLayerId,
      name: `${source.name} (Salinan)`,
      isBackground: false,
    };

    // Duplicate all elements on this layer
    const duplicatedElements = project.elements
      .filter(el => (el.layerId || 'layer_1') === layerId)
      .map(el => ({
        ...el,
        id: generateId(),
        layerId: newLayerId,
        x: el.x + 30,
        y: el.y + 30,
      }));

    setProject(prev => ({
      ...prev,
      layers: [...(prev.layers || createDefaultLayers()), newLayer],
      elements: [...prev.elements, ...duplicatedElements],
      activeLayerId: newLayerId,
      updatedAt: Date.now(),
    }));
    setToastMessage(`Layer "${newLayer.name}" berhasil diduplikasi.`);
  };

  const handleRenameLayer = (layerId: string, newName: string) => {
    setProject(prev => ({
      ...prev,
      layers: (prev.layers || createDefaultLayers()).map(l =>
        l.id === layerId ? { ...l, name: newName } : l
      ),
      updatedAt: Date.now(),
    }));
  };

  const handleToggleLayerVisibility = (layerId: string) => {
    setProject(prev => ({
      ...prev,
      layers: (prev.layers || createDefaultLayers()).map(l =>
        l.id === layerId ? { ...l, visible: !l.visible } : l
      ),
      updatedAt: Date.now(),
    }));
  };

  const handleToggleLayerLock = (layerId: string) => {
    setProject(prev => ({
      ...prev,
      layers: (prev.layers || createDefaultLayers()).map(l =>
        l.id === layerId ? { ...l, locked: !l.locked } : l
      ),
      updatedAt: Date.now(),
    }));
  };

  const handleChangeLayerOpacity = (layerId: string, opacity: number) => {
    setProject(prev => ({
      ...prev,
      layers: (prev.layers || createDefaultLayers()).map(l =>
        l.id === layerId ? { ...l, opacity } : l
      ),
      updatedAt: Date.now(),
    }));
  };

  const handleMoveLayerOrder = (layerId: string, direction: 'up' | 'down') => {
    const currentL = [...(project.layers || createDefaultLayers())];
    const idx = currentL.findIndex(l => l.id === layerId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= currentL.length) return;

    // Swap
    const temp = currentL[idx];
    currentL[idx] = currentL[targetIdx];
    currentL[targetIdx] = temp;

    pushHistory();
    setProject(prev => ({
      ...prev,
      layers: currentL,
      updatedAt: Date.now(),
    }));
  };

  const handleMoveSelectedToLayer = (targetLayerId: string) => {
    if (selectedIds.length === 0) return;
    pushHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        selectedIds.includes(el.id) ? { ...el, layerId: targetLayerId } : el
      ),
      updatedAt: Date.now(),
    }));
    const targetLayer = (project.layers || []).find(l => l.id === targetLayerId);
    setToastMessage(`${selectedIds.length} elemen dipindahkan ke ${targetLayer?.name || targetLayerId}.`);
  };

  const handleUploadBackgroundImage = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          pushHistory();
          setProject(prev => ({
            ...prev,
            backgroundImage: reader.result as string,
            backgroundImageOpacity: 0.5,
            updatedAt: Date.now(),
          }));
          setToastMessage('Template gambar latar berhasil dipasang di Layer BG.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Gagal membaca gambar latar: ' + (err instanceof Error ? err.message : ''));
    }
  };

  const handleRemoveBackgroundImage = () => {
    pushHistory();
    setProject(prev => ({
      ...prev,
      backgroundImage: undefined,
      updatedAt: Date.now(),
    }));
    setToastMessage('Template gambar latar dihapus.');
  };

  const handleChangeBackgroundImageOpacity = (opacity: number) => {
    setProject(prev => ({
      ...prev,
      backgroundImageOpacity: opacity,
      updatedAt: Date.now(),
    }));
  };

  // ==========================================
  // PROPERTY PANEL WRAPPER FUNCTIONS (Updates selected elements instantly + sets tool settings)
  // ==========================================
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (selectedIds.length > 0) {
      pushHistory();
      setProject(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (selectedIds.includes(el.id)) {
            if (el.type === 'stroke') return { ...el, color: newColor };
            if (el.type === 'shape') return { ...el, strokeColor: newColor };
            if (el.type === 'text') return { ...el, color: newColor };
          }
          return el;
        }),
        updatedAt: Date.now(),
      }));
    }
  };

  const handleStrokeWidthChange = (newWidth: number) => {
    setStrokeWidth(newWidth);
    if (selectedIds.length > 0) {
      pushHistory();
      setProject(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (selectedIds.includes(el.id)) {
            if (el.type === 'stroke' || el.type === 'shape') {
              return { ...el, strokeWidth: newWidth };
            }
          }
          return el;
        }),
        updatedAt: Date.now(),
      }));
    }
  };

  const handleFillColorChange = (newFill: string) => {
    setFillColor(newFill);
    if (selectedIds.length > 0) {
      pushHistory();
      setProject(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (selectedIds.includes(el.id) && el.type === 'shape') {
            return { ...el, fillColor: newFill };
          }
          return el;
        }),
        updatedAt: Date.now(),
      }));
    }
  };

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    if (selectedIds.length > 0) {
      pushHistory();
      setProject(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (selectedIds.includes(el.id)) {
            return { ...el, opacity: newOpacity };
          }
          return el;
        }),
        updatedAt: Date.now(),
      }));
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    if (selectedIds.length > 0) {
      pushHistory();
      setProject(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (selectedIds.includes(el.id) && el.type === 'text') {
            return { ...el, fontSize: newSize };
          }
          return el;
        }),
        updatedAt: Date.now(),
      }));
    }
  };

  const handleFontFamilyChange = (newFont: FontFamilyId) => {
    setFontFamily(newFont);
    if (selectedIds.length > 0) {
      pushHistory();
      setProject(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (selectedIds.includes(el.id) && el.type === 'text') {
            return { ...el, fontFamily: newFont };
          }
          return el;
        }),
        updatedAt: Date.now(),
      }));
    }
  };

  const handleNoteThemeChange = (newTheme: NoteTheme) => {
    setNoteTheme(newTheme);
    if (selectedIds.length > 0) {
      pushHistory();
      setProject(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (selectedIds.includes(el.id) && el.type === 'note') {
            return { ...el, theme: newTheme };
          }
          return el;
        }),
        updatedAt: Date.now(),
      }));
    }
  };

  // Inline editing coordinates
  const editingElement = editingElementId
    ? project.elements.find(el => el.id === editingElementId)
    : null;
  const editingScreenPos = editingElement
    ? worldToScreen(editingElement.x, editingElement.y, project.viewport)
    : null;

  const currentLayers = project.layers || createDefaultLayers();
  const activeLayerId = project.activeLayerId || 'layer_1';
  const activeLayer = currentLayers.find(l => l.id === activeLayerId) || currentLayers[1] || currentLayers[0];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none bg-slate-50 font-sans"
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={projectInputRef}
        type="file"
        accept=".json,.infboard"
        onChange={handleProjectInputChange}
        className="hidden"
      />

      {/* Header Bar */}
      <BoardHeader
        title={project.title}
        onUpdateTitle={newTitle => setProject(prev => ({ ...prev, title: newTitle }))}
        onBackToHome={onBackToHome}
        onOpenProjects={() => setIsProjectsModalOpen(true)}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        viewport={project.viewport}
        onZoomIn={() => zoomAtPoint(1.2, window.innerWidth / 2, window.innerHeight / 2)}
        onZoomOut={() => zoomAtPoint(0.833, window.innerWidth / 2, window.innerHeight / 2)}
        onResetZoom={handleResetZoom}
        onFitContent={handleFitContent}
        onZoomToPercent={handleZoomToPercent}
        isCanvasLocked={isCanvasLocked}
        onToggleCanvasLock={() => setIsCanvasLocked(prev => !prev)}
        isRulerActive={isRulerActive}
        onToggleRuler={() => setIsRulerActive(prev => !prev)}
        isProtractorActive={isProtractorActive}
        onToggleProtractor={() => setIsProtractorActive(prev => !prev)}
        onStartSnipping={() => setActiveTool('snipping')}
        isLayersPanelOpen={isLayersPanelOpen}
        onToggleLayersPanel={() => setIsLayersPanelOpen(prev => !prev)}
        activeLayerName={activeLayer?.name || 'Layer 1'}
        gridStyle={project.gridStyle}
        onChangeGridStyle={style => setProject(prev => ({ ...prev, gridStyle: style }))}
        backgroundColor={project.backgroundColor}
        onChangeBackgroundColor={bg => setProject(prev => ({ ...prev, backgroundColor: bg }))}
        onOpenExport={() => setIsExportModalOpen(true)}
        onTriggerImport={handleImportProjectClick}
        onClearCanvas={() => setIsClearCanvasModalOpen(true)}
        onDeleteCurrentProject={() => handleDeleteProject(project.id)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      {/* Contextual Property Controls */}
      <PropertyPanel
        activeTool={activeTool}
        selectedElements={selectedElements}
        currentColor={color}
        onChangeColor={handleColorChange}
        currentStrokeWidth={strokeWidth}
        onChangeStrokeWidth={handleStrokeWidthChange}
        currentFillColor={fillColor}
        onChangeFillColor={handleFillColorChange}
        currentOpacity={opacity}
        onChangeOpacity={handleOpacityChange}
        currentFontSize={fontSize}
        onChangeFontSize={handleFontSizeChange}
        currentFontFamily={fontFamily}
        onChangeFontFamily={handleFontFamilyChange}
        currentNoteTheme={noteTheme}
        onChangeNoteTheme={handleNoteThemeChange}
        eraserSize={eraserSize}
        onChangeEraserSize={setEraserSize}
        onDuplicateSelected={handleDuplicateSelected}
        onDeleteSelected={handleDeleteSelected}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onRotateSelectedBy={handleRotateSelectedBy}
        onSetRotationSelected={handleSetRotationSelected}
        onFlipHorizontalSelected={handleFlipHorizontalSelected}
        onFlipVerticalSelected={handleFlipVerticalSelected}
        onToggleBold={handleToggleBold}
        onToggleItalic={handleToggleItalic}
        onToggleUnderline={handleToggleUnderline}
        onChangeTextAlign={handleChangeTextAlign}
        onChangeImageFilter={handleChangeImageFilter}
      />

      {/* Main Infinite Canvas */}
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="absolute inset-0 touch-none block"
        style={{
          cursor:
            activeTool === 'hand'
              ? 'grab'
              : activeTool === 'snipping'
              ? 'crosshair'
              : ['pen', 'brush', 'pencil', 'highlighter', 'glow', 'dashed', 'rainbow'].includes(activeTool)
              ? 'crosshair'
              : activeTool === 'eraser'
              ? 'cell'
              : activeTool === 'text'
              ? 'text'
              : 'default',
        }}
      />

      {/* Interactive Ruler Overlay */}
      <InteractiveRuler
        visible={isRulerActive}
        onClose={() => setIsRulerActive(false)}
        onDrawLineAlongRuler={handleDrawLineAlongRuler}
      />

      {/* Interactive Protractor (Busur Derajat) Overlay */}
      <InteractiveProtractor
        visible={isProtractorActive}
        onClose={() => setIsProtractorActive(false)}
        onDrawAngle={handleDrawAngle}
      />

      {/* Snipping / Region Marking Overlay */}
      <SnippingOverlay
        region={snippingRegion}
        onCopyRegion={handleCopyRegion}
        onDownloadRegion={handleDownloadRegion}
        onStampRegionToCanvas={handleStampRegionToCanvas}
        onSelectElementsInRegion={handleSelectElementsInRegion}
        onCancel={() => setSnippingRegion(null)}
      />

      {/* Floating Toolbar Dock at bottom */}
      <ToolbarDock
        activeTool={activeTool}
        onChangeTool={setActiveTool}
        activeStrokeTool={activeStrokeTool}
        onChangeStrokeTool={setActiveStrokeTool}
        activeShapeType={activeShapeType}
        onChangeShapeType={setActiveShapeType}
        eraserMode={eraserMode}
        onChangeEraserMode={setEraserMode}
        onUploadImageClick={handleUploadImageClick}
      />

      {/* Canvas Locked Status Badge */}
      {isCanvasLocked && (
        <div className="absolute top-16 right-3 z-30 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/90 text-white font-bold text-xs shadow-lg backdrop-blur-md animate-bounce">
            <span>🔒 Kanvas Terkunci (Layar tidak bergerak)</span>
          </div>
        </div>
      )}

      {/* Radar Minimap on bottom-right */}
      <Minimap
        elements={project.elements}
        viewport={project.viewport}
        onNavigate={(wx, wy) => {
          if (isCanvasLocked) return;
          setProject(prev => ({
            ...prev,
            viewport: {
              ...prev.viewport,
              x: window.innerWidth / 2 - wx * prev.viewport.zoom,
              y: window.innerHeight / 2 - wy * prev.viewport.zoom,
            },
          }));
        }}
      />

      {/* Inline Text / Note Editor Overlay */}
      {editingElement && editingScreenPos && (
        <div
          className="absolute z-40"
          style={{
            left: `${editingScreenPos.x}px`,
            top: `${editingScreenPos.y}px`,
            width: `${Math.max(editingElement.width * project.viewport.zoom, 220)}px`,
            minHeight: `${Math.max(editingElement.height * project.viewport.zoom, 70)}px`,
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-2.5 border-2 border-blue-500 animate-in zoom-in-95 duration-100 flex flex-col gap-2">
            <textarea
              value={editingText}
              onChange={e => setEditingText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') setEditingElementId(null);
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSaveInlineText();
              }}
              autoFocus
              rows={4}
              placeholder="Tulis teks..."
              style={{
                fontFamily: editingElement.type === 'text' ? `"${(editingElement as TextElement).fontFamily}", sans-serif` : 'inherit',
              }}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none resize-none"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Ctrl+Enter untuk simpan</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingElementId(null)}
                  className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveInlineText}
                  className="px-2.5 py-1 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Switcher & Manager Modal */}
      <ProjectManagerModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projectsList}
        activeProjectId={project.id}
        onSelectProject={handleSelectProject}
        onCreateNewProject={handleCreateNewProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
        onExportProjectById={handleExportProjectById}
        onImportProjectClick={handleImportProjectClick}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
      />

      {/* Clear Canvas Confirmation Modal */}
      {isClearCanvasModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Bersihkan Kanvas?
                </h4>
                <p className="text-xs text-slate-500">
                  Semua coretan di papan saat ini akan dihapus.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
              Papan <span className="font-bold text-slate-900 dark:text-white">"{project.title}"</span> memiliki {project.elements.length} elemen yang akan dikosongkan. Tindakan ini bisa di-Undo (Ctrl+Z).
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsClearCanvasModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsClearCanvasModalOpen(false);
                  pushHistory();
                  setProject(prev => ({
                    ...prev,
                    elements: [],
                    updatedAt: Date.now(),
                  }));
                  setSelectedIds([]);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/25 transition-colors"
              >
                Bersihkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Guide Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Layers & Background (BG) Panel */}
      <LayersPanel
        isOpen={isLayersPanelOpen}
        onClose={() => setIsLayersPanelOpen(false)}
        layers={currentLayers}
        activeLayerId={activeLayerId}
        onSelectActiveLayer={handleSelectActiveLayer}
        onAddLayer={handleAddLayer}
        onDeleteLayer={handleDeleteLayer}
        onDuplicateLayer={handleDuplicateLayer}
        onRenameLayer={handleRenameLayer}
        onToggleLayerVisibility={handleToggleLayerVisibility}
        onToggleLayerLock={handleToggleLayerLock}
        onChangeLayerOpacity={handleChangeLayerOpacity}
        onMoveLayerOrder={handleMoveLayerOrder}
        selectedLayerIds={selectedLayerIds}
        onSelectLayerIds={setSelectedLayerIds}
        selectedElementCount={selectedIds.length}
        onMoveSelectedToLayer={handleMoveSelectedToLayer}
        backgroundColor={project.backgroundColor}
        onChangeBackgroundColor={bg => setProject(prev => ({ ...prev, backgroundColor: bg }))}
        gridStyle={project.gridStyle}
        onChangeGridStyle={style => setProject(prev => ({ ...prev, gridStyle: style }))}
        backgroundImage={project.backgroundImage}
        backgroundImageOpacity={project.backgroundImageOpacity}
        onUploadBackgroundImage={handleUploadBackgroundImage}
        onRemoveBackgroundImage={handleRemoveBackgroundImage}
        onChangeBackgroundImageOpacity={handleChangeBackgroundImageOpacity}
        elements={project.elements}
      />

      {/* SUCCESS TOAST FEEDBACK BANNER */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-200 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-950 text-xs font-semibold shadow-2xl backdrop-blur-md">
            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
