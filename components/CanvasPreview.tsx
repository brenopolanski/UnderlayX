'use client';

import { useEffect, useRef } from 'react';
import { useEditor } from '@/hooks/useEditor';
import { SHAPES } from '@/constants/shapes';

export function CanvasPreview() {
  const { image, textSets, shapeSets } = useEditor(); // Added shapeSets
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const fgImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!image.background) return;

    // Load background image
    const bgImg = new Image();
    bgImg.src = image.background;
    bgImg.onload = () => {
      bgImageRef.current = bgImg;
      render();
    };

    // Load foreground image if exists
    if (image.foreground) {
      const fgImg = new Image();
      fgImg.src = image.foreground;
      fgImg.onload = () => {
        fgImageRef.current = fgImg;
        render();
      };
    }
  }, [image.background, image.foreground]);

  useEffect(() => {
    // Load all fonts used in text sets
    const loadFonts = async () => {
      const fontPromises = textSets.map(textSet => {
        // Create proper font string for loading
        const fontString = `${textSet.fontWeight} ${textSet.fontSize}px ${textSet.fontFamily}`;
        return document.fonts.load(fontString);
      });
      await Promise.all(fontPromises);
      render();
    };
    
    loadFonts();
  }, [textSets]);

  const render = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !bgImageRef.current) return;

    // Set canvas size to match background image
    canvas.width = bgImageRef.current.width;
    canvas.height = bgImageRef.current.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(bgImageRef.current, 0, 0);

    // Draw shapes
    shapeSets.forEach(shapeSet => {
      ctx.save();
      
      const x = (canvas.width * shapeSet.position.horizontal) / 100;
      const y = (canvas.height * shapeSet.position.vertical) / 100;
      
      // Move to position and apply transformations
      ctx.translate(x, y);
      ctx.rotate((shapeSet.rotation * Math.PI) / 180);
      
      // Add glow effect if enabled
      if (shapeSet.glow?.enabled) {
        ctx.shadowColor = shapeSet.glow.color;
        ctx.shadowBlur = shapeSet.glow.intensity;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      // Update the scaling logic to use single scale value
      const scale = shapeSet.scale / 100;
      ctx.scale(scale, scale);

      // Set opacity
      ctx.globalAlpha = shapeSet.opacity;

      // Find shape path and draw
      const shape = SHAPES.find(s => s.value === shapeSet.type);
      if (shape) {
        const path = new Path2D(shape.path);
        
        if (shapeSet.isFilled) {
          ctx.fillStyle = shapeSet.color;
          ctx.fill(path);
        } else {
          ctx.strokeStyle = shapeSet.color;
          ctx.lineWidth = shapeSet.strokeWidth || 2;
          ctx.stroke(path);
        }
      }
      
      ctx.restore();
    });

    // Draw text layers with font family and weight
    textSets.forEach(textSet => {
      ctx.save();
      
      // Create proper font string for rendering
      ctx.font = `${textSet.fontWeight} ${textSet.fontSize}px ${textSet.fontFamily}`;
      ctx.fillStyle = textSet.color;
      ctx.globalAlpha = textSet.opacity;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const x = (canvas.width * textSet.position.horizontal) / 100;
      const y = (canvas.height * textSet.position.vertical) / 100;

      ctx.translate(x, y);
      ctx.rotate((textSet.rotation * Math.PI) / 180);

      // Add glow effect if enabled
      if (textSet.glow?.enabled && textSet.glow.color && textSet.glow.intensity > 0) {
        ctx.shadowColor = textSet.glow.color;
        ctx.shadowBlur = textSet.glow.intensity;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      ctx.fillText(textSet.text, 0, 0);
      
      ctx.restore();
    });

    // Add watermark for non-premium users
    // if (!isPremiumUser) { // Add this condition based on your premium user logic
    //   ctx.save();
    //   ctx.globalAlpha = 0.1;
    //   ctx.font = '20px Inter';
    //   ctx.fillStyle = '#ffffff';
    //   ctx.textAlign = 'center';
      
    //   // Create diagonal watermark pattern
    //   for (let i = 0; i < canvas.width; i += 200) {
    //     for (let j = 0; j < canvas.height; j += 100) {
    //       ctx.fillText('DEMO VERSION', i, j);
    //     }
    //   }
    //   ctx.restore();
    // }

    // Draw foreground
    if (fgImageRef.current) {
      ctx.drawImage(fgImageRef.current, 0, 0);
    }
  };

  // Re-render on text or shape changes
  useEffect(() => {
    render();
  }, [textSets, shapeSets]); // Added shapeSets to dependencies

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-contain"
    />
  );
}
