'use client';

import { useState, useEffect } from 'react';
import MediaRenderer from './MediaRenderer';
import Image from 'next/image';

interface MediaItem {
  type: 'image' | 'video' | 'gallery' | 'thumbnail';
  src: string;
  alt: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  organization: string;
  impact?: string;
  link?: string;
  featured: boolean;
  project?: string;
  media?: MediaItem[];
}

interface Leadership {
  id: number;
  role: string;
  organization: string;
  description: string;
  duration: string;
  media?: MediaItem[];
}

interface Volunteering {
  id: number;
  activity: string;
  description: string;
  impact: string;
  type: string;
  media?: MediaItem[];
}

interface AchievementsData {
  achievements: Achievement[];
  leadership: Leadership[];
  volunteering: Volunteering[];
}

interface AchievementsProps {
  achievements: AchievementsData;
}

const Achievements = ({ achievements }: AchievementsProps) => {
  const [selectedItem, setSelectedItem] = useState<Achievement | Leadership | Volunteering | null>(null);
  const [modalType, setModalType] = useState<'achievement' | 'leadership' | 'volunteering' | null>(null);
  const [thumbnailCache, setThumbnailCache] = useState<Record<string, string>>({});

  const openModal = (item: Achievement | Leadership | Volunteering, type: 'achievement' | 'leadership' | 'volunteering') => {
    setSelectedItem(item);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  const hasMedia = (item: Achievement | Leadership | Volunteering): boolean => {
    return !!(item.media && item.media.length > 0);
  };

  // Helper function to get YouTube thumbnail
  const getYouTubeThumbnail = (url: string): string | null => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      const videoId = match[1];
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  };

  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Helper function to get gallery thumbnail alternatives
  const getGalleryThumbnailAlternatives = (basePath: string): string[] => {
    const encodedBasePath = basePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    
    return [
      `${encodedBasePath}/1.jpg`,
      `${encodedBasePath}/1.jpeg`,
      `${encodedBasePath}/1.png`,
      `${encodedBasePath}/1.webp`,
      `${encodedBasePath}/screenshot.jpg`,
      `${encodedBasePath}/screenshot.jpeg`,
      `${encodedBasePath}/screenshot.png`,
      `${encodedBasePath}/demo.jpg`,
      `${encodedBasePath}/demo.jpeg`,
      `${encodedBasePath}/demo.png`,
      `${encodedBasePath}/main.jpg`,
      `${encodedBasePath}/main.jpeg`,
      `${encodedBasePath}/main.png`
    ];
  };

  // Helper function to find first existing image
  const findFirstExistingImage = (urls: string[]): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!urls || urls.length === 0) return resolve(null);

      let idx = 0;
      const tryNext = () => {
        if (idx >= urls.length) return resolve(null);
        const testImg = new window.Image();
        testImg.onload = () => resolve(urls[idx]);
        testImg.onerror = () => {
          idx += 1;
          tryNext();
        };
        testImg.src = urls[idx];
      };
      tryNext();
    });
  };

  // Helper function to get thumbnail for any item
  const getThumbnail = (item: Achievement | Leadership | Volunteering): { type: string; src: string; alt: string } | null => {
    if (!item.media || item.media.length === 0) return null;
    
    // First, look for a designated thumbnail
    const thumbnail = item.media.find(media => media.type === 'thumbnail');
    if (thumbnail) return thumbnail;
    
    // If no thumbnail, use the first media item
    const firstMedia = item.media[0];
    if (firstMedia.type === 'video' && isYouTubeUrl(firstMedia.src)) {
      const youtubeThumbnail = getYouTubeThumbnail(firstMedia.src);
      if (youtubeThumbnail) {
        return {
          type: 'image',
          src: youtubeThumbnail,
          alt: firstMedia.alt
        };
      }
    } else if (firstMedia.type === 'gallery') {
      // If we have already resolved a thumbnail for this gallery, use it
      const cacheKey = `${item.id}-${firstMedia.src}`;
      const cached = thumbnailCache[cacheKey];
      if (cached) {
        return { type: 'image', src: cached, alt: firstMedia.alt };
      }
      // Otherwise return null to show icon fallback until resolved
      return null;
    }
    
    return firstMedia;
  };

  // Create thumbnail error handler
  const createThumbnailErrorHandler = (item: Achievement | Leadership | Volunteering) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const currentSrc = target.src;

    // YouTube thumbnails
    if (currentSrc.includes('img.youtube.com/vi/')) {
      if (currentSrc.includes('maxresdefault.jpg')) {
        target.src = currentSrc.replace('maxresdefault.jpg', 'hqdefault.jpg');
        return;
      }
      if (currentSrc.includes('hqdefault.jpg')) {
        target.src = currentSrc.replace('hqdefault.jpg', 'mqdefault.jpg');
        return;
      }
      if (currentSrc.includes('mqdefault.jpg')) {
        target.src = currentSrc.replace('mqdefault.jpg', 'default.jpg');
        return;
      }
      target.onerror = null;
      return;
    }

    // Gallery thumbnails
    if (item.media && item.media[0]?.type === 'gallery') {
      const galleryBase = item.media[0].src;
      const alternatives = getGalleryThumbnailAlternatives(galleryBase);
      const currentFile = currentSrc.substring(currentSrc.lastIndexOf('/'));
      const currentIdx = alternatives.findIndex((alt) => alt.endsWith(currentFile));
      const nextIdx = currentIdx + 1;

      if (nextIdx < alternatives.length) {
        target.src = alternatives[nextIdx];
      } else {
        target.onerror = null;
      }
    } else {
      target.onerror = null;
    }
  };

  // Probe gallery thumbnails once on mount
  useEffect(() => {
    const allItems = [
      ...achievements.achievements,
      ...achievements.leadership,
      ...achievements.volunteering
    ];

    allItems.forEach((item) => {
      const cacheKey = `${item.id}-${item.media?.[0]?.src}`;
      if (thumbnailCache[cacheKey]) return; // already resolved
      
      const firstMedia = item.media?.[0];
      if (firstMedia && firstMedia.type === 'gallery') {
        const alternatives = getGalleryThumbnailAlternatives(firstMedia.src);
        findFirstExistingImage(alternatives).then((url) => {
          if (url) {
            setThumbnailCache((prev) => ({ ...prev, [cacheKey]: url }));
          } else {
            setThumbnailCache((prev) => ({ ...prev, [cacheKey]: '' })); // mark attempted
          }
        });
      }
    });
  }, [achievements, thumbnailCache]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          Achievements & <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Recognition</span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto"></div>
      </div>

      {/* Featured Achievements */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-white mb-8 text-center">Major Achievements</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {achievements.achievements.filter(a => a.featured).map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
              onClick={() => hasMedia(achievement) ? openModal(achievement, 'achievement') : undefined}
            >
              <div className="h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                {(() => {
                  const thumbnail = getThumbnail(achievement);
                  if (thumbnail && (thumbnail.type === 'image' || thumbnail.type === 'thumbnail')) {
                    return (
                      <Image
                        src={thumbnail.src}
                        alt={thumbnail.alt}
                        width={400}
                        height={400}
                        className="w-full h-full object-contain"
                        onError={createThumbnailErrorHandler(achievement)}
                      />
                    );
                  } else {
                    return (
                      <div className="text-6xl text-purple-400/50">
                        {achievement.title.split(' ').map(word => word[0]).join('').slice(0, 2)}
                      </div>
                    );
                  }
                })()}
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-xl font-bold text-white">{achievement.title}</h4>
                  {hasMedia(achievement) && (
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <p className="text-purple-300 text-sm mb-2">{achievement.organization} • {achievement.date}</p>
                <p className="text-gray-300 mb-3">{achievement.description}</p>
                
                {achievement.impact && (
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                      💰 {achievement.impact}
                    </span>
                  </div>
                )}
                
                {achievement.project && (
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                      🚀 {achievement.project}
                    </span>
                  </div>
                )}
                
                {achievement.link && (
                  <a
                    href={achievement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Learn more
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Achievements */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-white mb-8 text-center">Other Recognition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.achievements.filter(a => !a.featured).map((achievement) => (
                        <div
              key={achievement.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
              onClick={() => hasMedia(achievement) ? openModal(achievement, 'achievement') : undefined}
            >
              <div className="h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                {(() => {
                  const thumbnail = getThumbnail(achievement);
                  if (thumbnail && (thumbnail.type === 'image' || thumbnail.type === 'thumbnail')) {
                    return (
                      <Image
                        src={thumbnail.src}
                        alt={thumbnail.alt}
                        width={400}
                        height={400}
                        className="w-full h-full object-contain"
                        onError={createThumbnailErrorHandler(achievement)}
                      />
                    );
                  } else {
                    return (
                      <div className="text-4xl text-purple-400/50">
                        {achievement.title.split(' ').map(word => word[0]).join('').slice(0, 2)}
                      </div>
                    );
                  }
                })()}
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-bold text-white">{achievement.title}</h4>
                  {hasMedia(achievement) && (
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <p className="text-purple-300 text-sm mb-2">{achievement.organization} • {achievement.date}</p>
                <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>
                
                {achievement.link && (
                  <a
                    href={achievement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View details
                    <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership & Volunteering */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leadership */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Leadership Roles</h3>
          <div className="space-y-4">
            {achievements.leadership.map((role) => (
                            <div
                key={role.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                onClick={() => hasMedia(role) ? openModal(role, 'leadership') : undefined}
              >
                <div className="h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                  {(() => {
                    const thumbnail = getThumbnail(role);
                    if (thumbnail && (thumbnail.type === 'image' || thumbnail.type === 'thumbnail')) {
                      return (
                        <Image
                          src={thumbnail.src}
                          alt={thumbnail.alt}
                          width={400}
                          height={400}
                          className="w-full h-full object-contain"
                          onError={createThumbnailErrorHandler(role)}
                        />
                      );
                    } else {
                      return (
                        <div className="text-4xl text-purple-400/50">
                          {role.role.split(' ').map(word => word[0]).join('').slice(0, 2)}
                        </div>
                      );
                    }
                  })()}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-white">{role.role}</h4>
                    {hasMedia(role) && (
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-purple-300 text-sm mb-2">{role.organization}</p>
                  <p className="text-gray-300 text-sm mb-2">{role.description}</p>
                  <p className="text-gray-400 text-xs">{role.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volunteering */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Volunteering & Social Impact</h3>
          <div className="space-y-4">
            {achievements.volunteering.map((activity) => (
              <div
                key={activity.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                onClick={() => hasMedia(activity) ? openModal(activity, 'volunteering') : undefined}
              >
                <div className="h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                  {(() => {
                    const thumbnail = getThumbnail(activity);
                    if (thumbnail && (thumbnail.type === 'image' || thumbnail.type === 'thumbnail')) {
                      return (
                        <Image
                          src={thumbnail.src}
                          alt={thumbnail.alt}
                          width={400}
                          height={400}
                          className="w-full h-full object-contain"
                          onError={createThumbnailErrorHandler(activity)}
                        />
                      );
                    } else {
                      return (
                        <div className="text-4xl text-purple-400/50">
                          {activity.activity.split(' ').map(word => word[0]).join('').slice(0, 2)}
                        </div>
                      );
                    }
                  })()}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-white">{activity.activity}</h4>
                    {hasMedia(activity) && (
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{activity.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                      {activity.type}
                    </span>
                    <span className="text-gray-400 text-xs">Impact: {activity.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {modalType === 'achievement' 
                      ? (selectedItem as Achievement).title
                      : modalType === 'leadership'
                      ? (selectedItem as Leadership).role
                      : (selectedItem as Volunteering).activity
                    }
                  </h3>
                  <p className="text-purple-300">
                    {modalType === 'achievement' 
                      ? `${(selectedItem as Achievement).organization} • ${(selectedItem as Achievement).date}`
                      : modalType === 'leadership'
                      ? `${(selectedItem as Leadership).organization} • ${(selectedItem as Leadership).duration}`
                      : (selectedItem as Volunteering).type
                    }
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-300">
                  {modalType === 'achievement' 
                    ? (selectedItem as Achievement).description
                    : modalType === 'leadership'
                    ? (selectedItem as Leadership).description
                    : (selectedItem as Volunteering).description
                  }
                </p>
              </div>

              {/* Media Content */}
              {selectedItem.media && selectedItem.media.filter(media => media.type !== 'thumbnail').length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-4">Media:</h4>
                  <div className="space-y-6">
                    {selectedItem.media.filter(media => media.type !== 'thumbnail').map((mediaItem, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg overflow-hidden">
                        <h5 className="text-purple-300 font-medium p-3 bg-white/5 border-b border-white/10">
                          {mediaItem.alt}
                        </h5>
                        <div className="p-4">
                          <MediaRenderer media={mediaItem} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements; 