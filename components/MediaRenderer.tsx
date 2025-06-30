'use client';

import Image from 'next/image';
import ImageCarousel from './ImageCarousel';

export interface GalleryItem {
  type: 'gallery';
  alt: string;
  baseSrc?: string; // Original folder path, now optional
  images: string[];
  title?: string;
}

export type MediaItem = 
  | { type: 'image' | 'video' | 'thumbnail'; src: string; alt: string; title?: string }
  | GalleryItem;

interface MediaRendererProps {
  media: MediaItem | MediaItem[];
  className?: string;
}

const MediaRenderer = ({ media, className = "" }: MediaRendererProps) => {
  const mediaItems = Array.isArray(media) ? media : [media];

  return (
    <div className={`space-y-6 ${className}`}>
      {mediaItems.map((item, index) => {
        switch (item.type) {
          case 'image':
          case 'thumbnail':
            return (
              <div key={index} className="rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={800}
                  height={600}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            );
          case 'video':
            const isYouTube = item.src.includes('youtube.com') || item.src.includes('youtu.be');
            if (isYouTube) {
              const videoIdMatch = item.src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
              const videoId = videoIdMatch ? videoIdMatch[1] : null;

              if (!videoId) return <p key={index} className='text-red-400'>Invalid YouTube URL</p>;

              return (
                <div key={index} className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={item.alt}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              );
            }
            // Fallback for other video types
            return (
              <video key={index} controls src={item.src} className="w-full h-auto rounded-lg shadow-lg">
                {item.alt}
              </video>
            );
          case 'gallery':
            // Ensure item.images is an array to prevent crashes
            if (!Array.isArray(item.images)) {
              console.error('MediaRenderer: Gallery item is missing "images" array.', item);
              return (
                <div key={index} className="text-red-400">
                  Error: Gallery data is invalid.
                </div>
              );
            }
            return (
              <ImageCarousel
                key={index}
                images={item.images}
                alt={item.alt}
                title={item.title}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default MediaRenderer;