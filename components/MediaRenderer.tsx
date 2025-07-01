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
  | { type: 'image' | 'video' | 'thumbnail' | 'iframe' | 'blog'; src: string; alt: string; title?: string }
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
          case 'blog':
            return (
              <div key={index} className="space-y-2">
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="font-bold text-white mb-2">{item.title || item.alt}</h5>
                      <p className="text-gray-300 text-sm mb-3">Read the complete blog post</p>
                    </div>
                    <div className="ml-4">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                  <a 
                    href={item.src} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Read Blog Post
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
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