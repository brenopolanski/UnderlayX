'use client';

import NextImage from 'next/image';
import { useEditor } from '@/hooks/useEditor';
import { Upload } from 'lucide-react';
import { CanvasPreview } from './CanvasPreview';
import { convertHeicToJpeg } from '@/lib/image-utils';

const MAX_IMAGE_SIZE = 1920; // Maximum dimension for images

const optimizeImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Use native HTML Image constructor
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Check if optimization is needed
      if (img.width <= MAX_IMAGE_SIZE && img.height <= MAX_IMAGE_SIZE) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > MAX_IMAGE_SIZE) {
        height = Math.round((height * MAX_IMAGE_SIZE) / width);
        width = MAX_IMAGE_SIZE;
      } else if (height > MAX_IMAGE_SIZE) {
        width = Math.round((width * MAX_IMAGE_SIZE) / height);
        height = MAX_IMAGE_SIZE;
      }

      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            reject(new Error('Failed to optimize image'));
          }
        },
        'image/jpeg',
        0.9
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

export function Canvas() {
  const { image, textSets, isProcessing, isConverting, handleImageUpload, processingMessage } = useEditor();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image.webp', 'image.heic', 'image.heif'];
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      console.log(fileType, fileName);
      if (validTypes.includes(fileType) || fileName.match(/\.(heic|heif)$/)) {
        try {
          // First convert HEIC/HEIF if necessary
          const convertedFile = await convertHeicToJpeg(file);
          // Then optimize the converted file
          const optimizedFile = await optimizeImage(convertedFile);
          handleImageUpload(optimizedFile);
        } catch (error) {
          console.error('Error processing image:', error);
          alert('Error processing image. Please try again.');
        }
      } else {
        alert('Please upload a valid image file (JPG, PNG, WEBP, HEIC, or HEIF)');
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image.webp', 'image.heic', 'image.heif'];
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    if (validTypes.includes(fileType) || fileName.match(/\.(heic|heif)$/)) {
      try {
        // First convert HEIC/HEIF if necessary
        const convertedFile = await convertHeicToJpeg(file);
        // Then optimize the converted file
        const optimizedFile = await optimizeImage(convertedFile);
        handleImageUpload(optimizedFile);
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
      }
    } else {
      alert('Please upload a valid image file (JPG, PNG, WEBP, HEIC, or HEIF)');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      {!image.original ? (
        <div 
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full h-full"
          >
          <input
            id="canvas-upload"
            type="file"
            onChange={onFileChange}
            accept="image/jpeg,image/png,image.webp,image.heic,image.heif,.heic,.heif,.jpg,.jpeg,.png,.webp"
            className="hidden"
          />
          <label
            htmlFor="canvas-upload"
            className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-600/50 rounded-xl transition-all hover:border-gray-400/50 hover:bg-white/[0.02] cursor-pointer"
          >
            <div className="text-center space-y-6">
              <h3 className="text-xl font-medium text-white/90">Upload an image to get started</h3>
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-800/50 backdrop-blur-sm flex items-center justify-center border border-gray-700 shadow-xl">
                <Upload className="w-10 h-10 text-gray-400" />
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 font-medium">Click here or drag & drop to upload</p>
                <p className="text-gray-500 text-sm">Supports: JPG, PNG, WEBP, HEIC, HEIF</p>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center">
          {(isProcessing || isConverting) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-sm">
                  {processingMessage || 'Processing...'}
                </p>
              </div>
            </div>
          )}
          
          {image.original ? (
            <div className="relative w-full h-full prevent-save">
              <CanvasPreview />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400">Upload an image to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
