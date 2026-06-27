import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, Move, Check, RotateCcw } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  aspectRatio: number; // e.g., 1 for square, 16/9 for banner
  title?: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
}

export default function ImageCropperModal({
  imageSrc,
  aspectRatio,
  title = "Crop Image",
  onCropComplete,
  onCancel,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  // Load image on mount/src change
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
      // Reset crop params
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    };
  }, [imageSrc]);

  // Redraw preview on canvas
  useEffect(() => {
    if (!imgLoaded || !imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;

    // We want to draw the image inside the canvas with zoom and offset.
    // The canvas size will match our cropping resolution.
    // For Square: 400x400. For 16:9: 640x360.
    const targetWidth = aspectRatio === 1 ? 400 : 640;
    const targetHeight = aspectRatio === 1 ? 400 : 360;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // Calculate source rect to fit cover-style
    const imgAspect = img.width / img.height;
    const targetAspect = targetWidth / targetHeight;

    let drawWidth = targetWidth;
    let drawHeight = targetHeight;

    if (imgAspect > targetAspect) {
      // Image is wider than crop box
      drawWidth = targetHeight * imgAspect;
    } else {
      // Image is taller than crop box
      drawHeight = targetWidth / imgAspect;
    }

    // Apply Zoom
    drawWidth *= zoom;
    drawHeight *= zoom;

    // Center position + offsets
    const x = (targetWidth - drawWidth) / 2 + offsetX;
    const y = (targetHeight - drawHeight) / 2 + offsetY;

    // Draw
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  }, [imgLoaded, zoom, offsetX, offsetY, aspectRatio]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offsetX, y: e.clientY - offsetY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.current.x);
    setOffsetY(e.clientY - dragStart.current.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = { 
        x: e.touches[0].clientX - offsetX, 
        y: e.touches[0].clientY - offsetY 
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffsetX(e.touches[0].clientX - dragStart.current.x);
    setOffsetY(e.touches[0].clientY - dragStart.current.y);
  };

  const handleCrop = () => {
    if (!canvasRef.current) return;
    const croppedDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
    onCropComplete(croppedDataUrl);
  };

  const handleReset = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in" id="image-cropper-modal">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[96vh] overflow-hidden border border-gray-100 dark:border-slate-800 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-150 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
              {title}
            </h4>
          </div>
          <button 
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Container (Scrollable if height is very small) */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col items-center bg-slate-50 dark:bg-slate-950/50">
          
          {/* Crop Boundary Frame - Made smaller for perfect screen fit */}
          <div 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="relative cursor-move select-none border-2 border-dashed border-indigo-500/50 dark:border-indigo-400/40 rounded-xl overflow-hidden shadow-md bg-slate-200 dark:bg-slate-900 max-w-full"
            style={{
              width: aspectRatio === 1 ? '180px' : '240px',
              height: aspectRatio === 1 ? '180px' : '135px',
            }}
          >
            {/* Live Canvas */}
            <canvas 
              ref={canvasRef}
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Helper drag notice */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/5 hover:bg-black/0 transition-colors">
              <span className="bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                <Move className="w-2.5 h-2.5" />
                Drag to Position
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 text-center font-mono">
            Aspect Ratio: {aspectRatio === 1 ? '1:1 Square (Icons)' : '16:9 Landscape (Banners)'}
          </p>

          {/* Controls Panel - Made compact */}
          <div className="w-full mt-3 space-y-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-150 dark:border-slate-800">
            
            {/* Zoom Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" />
                  Zoom Size
                </span>
                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Horizontal Alignment - Combined/Simplified */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Horiz. Pan (X)</label>
                <input 
                  type="range"
                  min="-200"
                  max="-200"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
                  style={{ min: -200, max: 200 }} // Explicit check
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Vert. Pan (Y)</label>
                <input 
                  type="range"
                  min="-200"
                  max="200"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 border-t border-gray-150 dark:border-slate-800 flex justify-between bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1.5 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors flex items-center gap-1 font-mono"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-[11px] font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCrop}
              className="px-3 py-1.5 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Crop & Apply
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
