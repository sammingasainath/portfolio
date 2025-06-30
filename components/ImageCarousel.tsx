'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface CarouselImage {
  src: string;
  alt: string;
}

interface ImageCarouselProps {
  folderPath: string;
  alt: string;
  title?: string;
}

const ImageCarousel = ({ folderPath, alt, title }: ImageCarouselProps) => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const router = useRouter();

  // Load images from folder
  useEffect(() => {
    const loadImagesFromFolder = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Common image extensions
        const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
        const imagePromises: Promise<CarouselImage>[] = [];
        
        // Try to load images with common naming patterns (1.jpg, 2.jpg, etc.)
        for (let i = 1; i <= 20; i++) {
          for (const ext of imageExtensions) {
            const imagePath = `${folderPath}/${i}.${ext}`;
            const imagePromise = new Promise<CarouselImage>((resolve, reject) => {
              const img = new window.Image();
              img.onload = () => resolve({ src: imagePath, alt: `${alt} - Image ${i}` });
              img.onerror = () => reject();
              img.src = `${router.basePath}${imagePath}`;
            });
            imagePromises.push(imagePromise);
          }
        }
        
        // Also try common filenames
        const commonNames = ['screenshot', 'demo', 'preview', 'main', 'hero', 'thumb'];
        for (const name of commonNames) {
          for (const ext of imageExtensions) {
            const imagePath = `${folderPath}/${name}.${ext}`;
            const imagePromise = new Promise<CarouselImage>((resolve, reject) => {
              const img = new window.Image();
              img.onload = () => resolve({ src: imagePath, alt: `${alt} - ${name}` });
              img.onerror = () => reject();
              img.src = `${router.basePath}${imagePath}`;
            });
            imagePromises.push(imagePromise);
          }
        }
        
        // Wait for all promises to settle
        const results = await Promise.allSettled(imagePromises);
        const loadedImages = results
          .filter((result): result is PromiseFulfilledResult<CarouselImage> => result.status === 'fulfilled')
          .map(result => result.value)
          .filter((image, index, self) => 
            // Remove duplicates based on src
            index === self.findIndex(img => img.src === image.src)
          );
        
        if (loadedImages.length === 0) {
          setError('No images found in the specified folder');
        } else {
          setImages(loadedImages);
        }
      } catch {
        setError('Failed to load images from folder');
      } finally {
        setLoading(false);
      }
    };

    loadImagesFromFolder();
  }, [folderPath, alt, router.basePath]);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  if (loading) {
    return (
      <div className="w-full aspect-video bg-white/5 rounded-lg flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          Loading images...
        </div>
      </div>
    );
  }

  if (error || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-white/5 rounded-lg flex items-center justify-center border border-red-500/20">
        <div className="text-center text-red-400">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">{error || 'No images found'}</p>
          <p className="text-xs text-gray-500 mt-1">Folder: {folderPath}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {title && (
        <h5 className="text-purple-300 font-medium mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {title}
          <span className="text-sm text-gray-400">({images.length} images)</span>
        </h5>
      )}
      
      <div className="relative bg-black/20 rounded-lg overflow-hidden shadow-2xl">
        {/* Main Image Display */}
        <div 
          className="relative w-full aspect-video"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            width={896}
            height={504}
            className="w-full h-full object-contain bg-black/10"
            loading="lazy"
          />
          
          {/* Image Counter */}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip (Instagram-style) */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-purple-400 scale-105'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel; 