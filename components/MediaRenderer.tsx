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
  | { type: 'image' | 'video' | 'thumbnail' | 'iframe'; src: string; alt: string; title?: string }
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
              <div key={index} className="space-y-2">
                <div className="text-center p-2">
                    <p className="font-bold text-white">{item.title || item.alt}</p>
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={800}
                    height={600}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            );
          case 'video':
            const isYouTube = item.src.includes('youtube.com') || item.src.includes('youtu.be');
            if (isYouTube) {
              const videoIdMatch = item.src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
              const videoId = videoIdMatch ? videoIdMatch[1] : null;

              if (!videoId) return <p key={index} className='text-red-400'>Invalid YouTube URL</p>;

              return (
                <div key={index} className="space-y-2">
                   <div className="text-center p-2">
                    <p className="font-bold text-white">{item.title || item.alt}</p>
                  </div>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={item.alt}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
              );
            }
            // Fallback for other video types
            return (
              <div key={index} className="space-y-2">
                <div className="text-center p-2">
                  <p className="font-bold text-white">{item.title || item.alt}</p>
                </div>
                <video src={item.src} title={item.alt} controls className="w-full rounded-lg" />
              </div>
            );
          case 'gallery':
            return (
              <div key={index} className="space-y-2">
                <div className="text-center p-2">
                    <p className="font-bold text-white">{item.alt}</p>
                </div>
                <ImageCarousel
                  images={item.images}
                  alt={item.alt}
                  title={item.title}
                />
              </div>
            );
          case 'iframe':
            return (
              <div key={index} className="space-y-2">
                <div className="text-center p-2">
                    <p className="font-bold text-white">{item.title || item.alt}</p>
                </div>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src={item.src}
                    title={item.alt}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            );
          default:
            // Ensure exhaustive check
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _exhaustiveCheck: never = item;
            return null;
        }
      })}
    </div>
  );
};

export default MediaRenderer;