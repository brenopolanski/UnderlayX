export async function convertHeicToJpeg(file: File): Promise<File> {
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    try {
      // Dynamically import `heic2any` for client-side usage
      const heic2any = (await import('heic2any')).default;

      const blob = await heic2any({
        blob: file,
        toType: 'image/jpg',
        quality: 0.5,
      });

      return new File([blob as Blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
        type: 'image/jpg',
      });
    } catch (error) {
      console.error('Error converting HEIC to JPG:', error);
      throw new Error('Failed to convert HEIC image');
    }
  }
  return file;
}

export function getImageFormat(file: File): string {
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    return 'jpg';
  }
  return file.type.split('/')[1];
}

export const optimizeImage = async (file: File, quality: number = 0.2): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            reject(new Error('Failed to optimize image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = reject;
    img.src = url;
  });
};
