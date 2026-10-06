/**
 * Infinity Board - Types & Interfaces (Enhanced with Layer System)
 */

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export type CanvasElementType = 'stroke' | 'shape' | 'text' | 'note' | 'image';

export interface BaseElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // In degrees (-180 to 180)
  zIndex: number;
  opacity: number;
  locked?: boolean;
  layerId?: string; // ID of the layer this element belongs to
}

export type StrokeTool = 
  | 'pen'        // Smooth gel pen
  | 'brush'      // Calligraphy / Fountain brush with variable weight
  | 'pencil'     // Textured sketch pencil
  | 'highlighter'// Translucent marker
  | 'glow'       // Neon cyber glowing stroke
  | 'dashed'     // Technical dashed line
  | 'rainbow';   // Dynamic rainbow multi-hue pen

export interface StrokeElement extends BaseElement {
  type: 'stroke';
  tool: StrokeTool;
  points: Point[];
  color: string;
  strokeWidth: number;
}

export type ShapeType = 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'diamond' | 'triangle' | 'star';

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  strokeColor: string;
  fillColor: string; // 'none' | hex / rgba
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed';
}

export type FontFamilyId = 
  | 'Inter'
  | 'Space Grotesk'
  | 'Outfit'
  | 'Playfair Display'
  | 'Caveat'
  | 'Patrick Hand'
  | 'Permanent Marker'
  | 'Fira Code';

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: FontFamilyId;
  color: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  backgroundColor?: string;
}

export type NoteTheme = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange' | 'dark';

export interface NoteElement extends BaseElement {
  type: 'note';
  text: string;
  theme: NoteTheme;
  title?: string;
}

export type ImageFilter = 'none' | 'grayscale' | 'sepia' | 'invert' | 'vintage';

export interface ImageElement extends BaseElement {
  type: 'image';
  dataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  aspectRatio: number;
  caption?: string;
  flipH?: boolean;
  flipV?: boolean;
  filter?: ImageFilter;
}

export type CanvasElement = StrokeElement | ShapeElement | TextElement | NoteElement | ImageElement;

export type ToolType = 
  | 'select' 
  | 'hand' 
  | 'pen' 
  | 'brush'
  | 'pencil' 
  | 'highlighter' 
  | 'glow'
  | 'dashed'
  | 'rainbow'
  | 'eraser' 
  | 'shape' 
  | 'text' 
  | 'note' 
  | 'image'
  | 'snipping';

export type EraserMode = 'stroke' | 'brush';

export interface EraserConfig {
  mode: EraserMode;
  size: number;
}

export interface RulerConfig {
  visible: boolean;
  x: number;
  y: number;
  length: number;
  angle: number;
}

export interface ProtractorConfig {
  visible: boolean;
  x: number;
  y: number;
  radius: number;
  angle: number;
}

export type GridStyle = 'dots' | 'grid' | 'lines' | 'none';

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0 to 1
  isBackground?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  layers?: CanvasLayer[];
  activeLayerId?: string;
  elements: CanvasElement[];
  viewport: Viewport;
  backgroundColor: string; // '#ffffff', '#0f172a', etc.
  backgroundImage?: string; // Optional custom background image/template
  backgroundImageOpacity?: number;
  gridStyle: GridStyle;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

export interface ProjectMetadata {
  id: string;
  title: string;
  description?: string;
  elementCount: number;
  createdAt: number;
  updatedAt: number;
  backgroundColor: string;
}

export interface SnippingRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}
