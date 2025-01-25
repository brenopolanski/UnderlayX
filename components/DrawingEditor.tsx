'use client';

import { useEditor } from '@/hooks/useEditor';
import { Undo, Trash2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ColorInput } from './ColorInput';
import { cn } from '@/lib/utils';
import { Switch } from './ui/switch';

export function DrawingEditor() {
  const {
    isDrawingMode,
    drawingSize,
    drawingColor,
    drawings,
    setIsDrawingMode,
    setDrawingSize,
    setDrawingColor,
    clearDrawings,
    undoLastDrawing,
  } = useEditor();

  return (
    <div className="space-y-4">
      {/* Drawing Mode Toggle */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Drawing Mode</Label>
        <Switch
          checked={isDrawingMode}
          onCheckedChange={setIsDrawingMode}
        />
      </div>

      {/* Controls Section */}
      <div className="space-y-4 bg-gray-50 dark:bg-white/5 rounded-lg p-4">
        {/* Size Control */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Brush Size
          </Label>
          <Slider
            min={1}
            max={100} 
            step={1}
            value={[drawingSize]}
            onValueChange={([value]) => setDrawingSize(value)}
            className="my-2"
          />
          <div className="text-xs text-gray-500 text-right">{drawingSize}px</div>
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Color
          </Label>
          <ColorInput
            id="drawing-color"
            value={drawingColor}
            onChange={setDrawingColor}
          />
        </div>
      </div>

      {/* Action Buttons */}
      {drawings.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              undoLastDrawing();
              // Force a re-render of the canvas immediately
              setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
            }}
            className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Undo className="w-4 h-4" />
            <span className="text-sm font-medium">Undo</span>
          </button>
          <button
            onClick={() => {
              clearDrawings();
              // Force a re-render of the canvas immediately
              setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
            }}
            className="flex-1 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Clear All</span>
          </button>
        </div>
      )}
    </div>
  );
}
