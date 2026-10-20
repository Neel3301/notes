import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  Eraser,
  RotateCcw,
  Trash2,
  Check,
  Download,
  Palette,
} from 'lucide-react';

const COLORS = [
  { label: 'Cream', hex: '#E5E7DA' },
  { label: 'Blue', hex: '#6F91B6' },
  { label: 'Yellow', hex: '#CABC3F' },
  { label: 'White', hex: '#FFFFFF' },
];

const STROKE_WIDTHS = [
  { label: 'Fine', size: 2 },
  { label: 'Med', size: 5 },
  { label: 'Bold', size: 10 },
];

/**
 * CanvasSketchpad component
 * Responsive HTML5 freehand drawing pad for note sketches and diagrams.
 *
 * Features:
 * - Touch & pointer events with touch-action: none
 * - HiDPI retina scaling
 * - Color swatches from app palette (#E5E7DA, #6F91B6, #CABC3F, #FFFFFF)
 * - Stroke size selector (2px, 5px, 10px)
 * - Eraser and pen mode
 * - Undo stack and Clear canvas
 * - Export to base64 data URL with auto-save
 */
export default function CanvasSketchpad({
  initialData = null,
  onSave,
  className = '',
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [color, setColor] = useState(COLORS[0].hex);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTHS[1].size);
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [savedBadge, setSavedBadge] = useState(false);

  // Setup Canvas and Load Initial Data
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    const width = rect.width || 350;
    const height = 400;

    // Retina DPI scale
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill dark background
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, width, height);

    // If initial sketch data exists, draw it
    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        // Save base snapshot
        setHistory([canvas.toDataURL()]);
      };
      img.src = initialData;
    } else {
      setHistory([canvas.toDataURL()]);
    }
  }, []);

  // Save current canvas state to history
  const pushHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => [...prev.slice(-15), dataUrl]);
    onSave?.(dataUrl);

    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1500);
  };

  // Get coordinates relative to canvas
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Start Drawing
  const handlePointerDown = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const coords = getCoordinates(e);
    lastPointRef.current = coords;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(coords.x, coords.y, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'eraser' ? '#121212' : color;
    ctx.fill();
  };

  // Move Drawing
  const handlePointerMove = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = tool === 'eraser' ? '#121212' : color;
    ctx.lineWidth = tool === 'eraser' ? strokeWidth * 2.5 : strokeWidth;
    ctx.stroke();

    lastPointRef.current = coords;
  };

  // End Drawing
  const handlePointerUp = (e) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    pushHistory();
  };

  // Undo Stroke
  const handleUndo = () => {
    if (history.length <= 1) return;
    const nextHistory = history.slice(0, -1);
    const prevSnapshot = nextHistory[nextHistory.length - 1];

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !prevSnapshot) return;

    const img = new Image();
    img.onload = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      setHistory(nextHistory);
      onSave?.(prevSnapshot);
    };
    img.src = prevSnapshot;
  };

  // Clear Canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, rect.width, rect.height);
    pushHistory();
  };

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col gap-3 select-none ${className}`}
    >
      {/* Top Toolbar: Tool & Stroke & Actions */}
      <div className="flex items-center justify-between px-1">
        {/* Tool selector */}
        <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-pill border border-border-subtle">
          <button
            type="button"
            onClick={() => setTool('pen')}
            className={`p-1.5 rounded-pill transition-colors flex items-center gap-1.5 text-label ${
              tool === 'pen'
                ? 'bg-cream-bg text-cream-text font-medium'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Pen</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded-pill transition-colors flex items-center gap-1.5 text-label ${
              tool === 'eraser'
                ? 'bg-cream-bg text-cream-text font-medium'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>
        </div>

        {/* Action icons: Undo & Clear */}
        <div className="flex items-center gap-1">
          {savedBadge && (
            <span className="text-label text-cream-bg flex items-center gap-1 mr-1 animate-fadeIn">
              <Check className="w-3 h-3" />
              <span>Saved</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-20 transition-opacity"
            title="Undo stroke"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center text-text-secondary hover:text-red-400 transition-colors"
            title="Clear canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Drawing Canvas Container */}
      <div className="w-full rounded-card overflow-hidden border border-border-subtle bg-[#121212] relative shadow-inner">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="touch-none cursor-crosshair w-full block"
        />
      </div>

      {/* Bottom Palette & Brush Size Controls */}
      <div className="flex items-center justify-between px-1 pt-1">
        {/* Color Swatches */}
        <div className="flex items-center gap-2.5">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => {
                setColor(c.hex);
                setTool('pen');
              }}
              className={`w-6 h-6 rounded-full border transition-all ${
                color === c.hex && tool === 'pen'
                  ? 'border-white scale-125 shadow-md'
                  : 'border-transparent hover:scale-110'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
        </div>

        {/* Stroke Width Selector */}
        <div className="flex items-center gap-1.5 bg-[#1A1A1A] px-2.5 py-1 rounded-pill border border-border-subtle">
          {STROKE_WIDTHS.map((sw) => (
            <button
              key={sw.size}
              type="button"
              onClick={() => setStrokeWidth(sw.size)}
              className={`px-2 py-0.5 rounded-pill text-[11px] font-medium transition-colors ${
                strokeWidth === sw.size
                  ? 'bg-cream-bg text-cream-text'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {sw.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
