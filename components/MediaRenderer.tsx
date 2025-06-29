'use client';

import ImageCarousel from './ImageCarousel';

export interface MediaItem {
  type: 'image' | 'video' | 'blog' | 'thumbnail' | 'gallery' | 'pdf';
  src: string;
  alt: string;
  title?: string;
}

interface MediaRendererProps {
  mediaItem: MediaItem;
  className?: string;
}

const MediaRenderer = ({ mediaItem, className = "" }: MediaRendererProps) => {
  // Helper function to detect and convert YouTube URLs
  const getYouTubeEmbedUrl = (url: string): string | null => {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  return (
    <div className={className}>
      {mediaItem.type === 'image' || mediaItem.type === 'thumbnail' ? (
        <img
          src={mediaItem.src}
          alt={mediaItem.alt}
          className="w-full h-auto rounded-lg shadow-lg"
          loading="lazy"
        />
      ) : mediaItem.type === 'video' ? (
        isYouTubeUrl(mediaItem.src) ? (
          <iframe
            src={getYouTubeEmbedUrl(mediaItem.src) || ''}
            title={mediaItem.alt}
            className="w-full aspect-video rounded-lg shadow-lg"
            allowFullScreen
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <video
            src={mediaItem.src}
            controls
            className="w-full h-auto rounded-lg shadow-lg"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        )
      ) : mediaItem.type === 'gallery' ? (
        <ImageCarousel
          folderPath={mediaItem.src}
          alt={mediaItem.alt}
          title={mediaItem.title}
        />
      ) : mediaItem.type === 'blog' ? (
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-blue-300 font-medium">Blog Article</span>
          </div>
          <a
            href={mediaItem.src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium hover:underline"
          >
            Read the full article: {mediaItem.alt}
          </a>
        </div>
      ) : mediaItem.type === 'pdf' ? (
        <div className="p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-500/20 rounded-full">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-red-300 font-semibold text-lg">PDF Document</h4>
              <p className="text-gray-400 text-sm">{mediaItem.alt}</p>
            </div>
          </div>
          
          {/* PDF Preview Area */}
          <div className="mb-6 bg-gray-800/50 rounded-lg p-8 text-center border border-red-500/20">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-red-500/20 rounded-full">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h5 className="text-white font-medium mb-2">PDF Preview</h5>
                <p className="text-gray-400 text-sm mb-4">Click below to view the full document</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={mediaItem.src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in New Tab
            </a>
            <a
              href={mediaItem.src}
              download
              className="flex-1 inline-flex items-center justify-center gap-2 border border-red-400 text-red-400 hover:bg-red-400 hover:text-white px-4 py-3 rounded-lg transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MediaRenderer; 