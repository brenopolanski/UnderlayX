'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useEditor } from '@/hooks/useEditor';
import { ChevronDown } from 'lucide-react';
import { FONT_OPTIONS, FONT_WEIGHTS } from '@/constants/fonts';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlowEffect } from '@/types/editor';
import { useDebounce } from '@/hooks/useDebounce';
import { ColorInput } from './ColorInput';

// Helper function for smooth scrolling
const scrollToElement = (element: HTMLElement | null) => {
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export function TextEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { textSets, updateTextSet, removeTextSet } = useEditor();
  const [openAccordions, setOpenAccordions] = useState<Record<number, boolean>>({});

  const debouncedUpdateText = useDebounce((id: number, updates: any) => {
    updateTextSet(id, updates);
  }, 16);

  const handlePositionChange = useCallback((id: number, type: 'horizontal' | 'vertical', value: number) => {
    debouncedUpdateText(id, {
      position: {
        ...textSets.find(set => set.id === id)?.position,
        [type]: value
      }
    });
  }, [textSets, debouncedUpdateText]);

  // Auto-scroll to new text layer
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const lastElement = container.lastElementChild;
      scrollToElement(lastElement as HTMLElement);
    }
  }, [textSets.length]);

  // Auto-open new accordions
  useEffect(() => {
    const newOpenState: Record<number, boolean> = {};
    textSets.forEach(set => {
      newOpenState[set.id] = openAccordions[set.id] !== false;
    });
    setOpenAccordions(newOpenState);
  }, [textSets.length]);

  const toggleAccordion = (id: number) => {
    setOpenAccordions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div ref={containerRef} className="space-y-4"> {/* Increased gap between items */}
      {textSets.map((textSet) => (
        <div 
          key={textSet.id} 
          className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg shadow-md dark:shadow-lg dark:shadow-black/20 p-4 space-y-4"
        >
          {/* Text Input */}
          <Input
            value={textSet.text}
            onChange={(e) => updateTextSet(textSet.id, { text: e.target.value })}
            className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
            placeholder="Enter text..."
          />
          
          {/* Font Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Font Family</Label>
              <Select
                value={textSet.fontFamily}
                onValueChange={(value) => updateTextSet(textSet.id, { fontFamily: value })}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto bg-zinc-900 border-white/10 text-white">
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem 
                      key={font.value} 
                      value={font.value}
                      className="focus:bg-white/10 focus:text-white"
                      style={{ fontFamily: font.value }}
                    >
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Font Weight</Label>
              <Select
                value={textSet.fontWeight}
                onValueChange={(value) => updateTextSet(textSet.id, { fontWeight: value })}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {FONT_WEIGHTS.map((weight) => (
                    <SelectItem 
                      key={weight.value} 
                      value={weight.value}
                      className="focus:bg-white/10 focus:text-white"
                    >
                      {weight.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text Size */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label className="text-sm text-gray-600 dark:text-gray-400">Text Size</Label>
              {/* <span className="text-sm text-gray-400">{textSet.fontSize}px</span> */}
            </div>
            <Slider
              min={12}
              max={1500}
              value={[textSet.fontSize]}
              onValueChange={([value]) => updateTextSet(textSet.id, { fontSize: value })}
            />
          </div>

          {/* Color */}
          <div>
            <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Color</Label>
            {/* <input
              type="color"
              value={textSet.color}
              onChange={(e) => updateTextSet(textSet.id, { color: e.target.value })}
              className="w-full h-9 cursor-pointer rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-md"
            /> */}
            <ColorInput
              value={textSet.color} // or shapeSet.color
              onChange={(value) => updateTextSet(textSet.id, { color: value })} // or updateShapeSet
            />
          </div>

          {/* Opacity */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label className="text-sm text-gray-600 dark:text-gray-400">Opacity</Label>
              <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(textSet.opacity * 100)}%</span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[textSet.opacity]}
              onValueChange={([value]) => updateTextSet(textSet.id, { opacity: value })}
            />
          </div>

          {/* Position Controls */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-sm text-gray-600 dark:text-gray-400">Horizontal Position</Label>
                <span className="text-sm text-gray-600 dark:text-gray-400">{textSet.position.horizontal}%</span>
              </div>
              <Slider
                min={0}
                max={100}
                value={[textSet.position.horizontal]}
                onValueChange={([value]) => handlePositionChange(textSet.id, 'horizontal', value)}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-sm text-gray-600 dark:text-gray-400">Vertical Position</Label>
                <span className="text-sm text-gray-600 dark:text-gray-400">{textSet.position.vertical}%</span>
              </div>
              <Slider
                min={0}
                max={100}
                value={[textSet.position.vertical]}
                onValueChange={([value]) => handlePositionChange(textSet.id, 'vertical', value)}
              />
            </div>
          </div>

          {/* Rotation */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label className="text-sm text-gray-600 dark:text-gray-400">Rotation</Label>
              <span className="text-sm text-gray-600 dark:text-gray-400">{textSet.rotation}°</span>
            </div>
            <Slider
              min={-180}
              max={180}
              value={[textSet.rotation]}
              onValueChange={([value]) => updateTextSet(textSet.id, { rotation: value })}
            />
          </div>

          {/* Glow Effect Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-600 dark:text-gray-400">Enable Glow</Label>
              <Switch
                checked={textSet.glow?.enabled ?? false}
                onCheckedChange={(checked) => {
                  const newGlow: GlowEffect = {
                    enabled: checked,
                    color: textSet.glow?.color || '#ffffff',
                    intensity: textSet.glow?.intensity || 20
                  };
                  updateTextSet(textSet.id, { glow: newGlow });
                }}
              />
            </div>

            {textSet.glow?.enabled && (
              <>
                <div>
                  <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Glow Color</Label>
                  {/* <input
                    type="color"
                    value={textSet.glow.color}
                    onChange={(e) => {
                      const newGlow: GlowEffect = {
                        ...textSet.glow!,
                        color: e.target.value
                      };
                      updateTextSet(textSet.id, { glow: newGlow });
                    }}
                    className="w-full h-9 cursor-pointer rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-md"
                  /> */}

              <ColorInput
                value={textSet.glow.color} 
                onChange={(value) => {
                  const newGlow: GlowEffect = {
                    ...textSet.glow!, 
                    color: value
                  };
                  updateTextSet(textSet.id, { glow: newGlow }); // or updateShapeSet
                }}
                />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Glow Intensity</Label>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{textSet.glow.intensity}</span>
                  </div>
                  <Slider
                    min={0}
                    max={50}
                    value={[textSet.glow.intensity]}
                    onValueChange={([value]) => {
                      const newGlow: GlowEffect = {
                        ...textSet.glow!,
                        intensity: value
                      };
                      updateTextSet(textSet.id, { glow: newGlow });
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Delete button */}
          <button
            onClick={() => removeTextSet(textSet.id)}
            className="w-full p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20"
          >
            Delete Layer
          </button>
        </div>
      ))}
    </div>
  );
}
