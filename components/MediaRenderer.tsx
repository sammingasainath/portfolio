'use client';

import Image from 'next/image';
import ImageCarousel from './ImageCarousel';

export interface MediaItem {
  type: 'image' | 'video' | 'gallery' | 'thumbnail';
  src: string;
  alt: string;
}

interface MediaRendererProps {
  media: MediaItem;
  className?: string;
}

const MediaRenderer = ({ media, className = "" }: MediaRendererProps) => {
  switch (media.type) {
    case 'image':
    case 'thumbnail':
      return (
        <div className={className}>
          <Image
            src={media.src}
            alt={media.alt}
            width={800}
            height={600}
            className="w-full h-auto rounded-lg shadow-lg"
            loading="lazy"
          />
        </div>
      );
    case 'video':
      const isYouTube = media.src.includes('youtube.com') || media.src.includes('youtu.be');
      if (isYouTube) {
        const videoId = new URL(media.src).searchParams.get('v') || media.src.split('/').pop();
        return (
          <div className={`relative w-full aspect-video rounded-lg overflow-hidden ${className}`}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={media.alt}
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
        <video controls src={media.src} className={`w-full h-auto rounded-lg ${className}`}>
          {media.alt}
        </video>
      );
    default:
      return null;
  }
};

export default MediaRenderer;