'use client';

import { useState, useEffect } from 'react';
import MediaRenderer, { MediaItem } from './MediaRenderer';
import Image from 'next/image';

interface ExperienceItem {
  id: number;
  company: string;
  position: string;
  location: string;
  duration: string;
  type: string;
  description: string;
  responsibilities: string[];
  achievements?: string[];
  technologies: string[];
  current: boolean;
  media?: MediaItem[];
}

interface ExperienceData {
  experiences: ExperienceItem[];
}

interface ExperienceProps {
  experience: ExperienceData;
}

const Experience = ({ experience }: ExperienceProps) => {
  const [selectedExperience, setSelectedExperience] = useState<ExperienceItem | null>(null);
  const [thumbnailCache, setThumbnailCache] = useState<Record<string, string>>({});
  const [expandedExperienceIndex, setExpandedExperienceIndex] = useState<number | null>(null);

  const toggleExperience = (index: number) => {
    setExpandedExperienceIndex(prevIndex => (prevIndex === index ? null : index));
  };

  const openModal = (exp: ExperienceItem) => {
    setSelectedExperience(exp);
  };

  const closeModal = () => {
    setSelectedExperience(null);
  };

  const hasMedia = (exp: ExperienceItem): boolean => {
    return !!(exp.media && exp.media.length > 0);
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
      `${encodedBasePath}/demo.png`
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

  // Helper function to get thumbnail for experience item
  const getThumbnail = (exp: ExperienceItem): { type: string; src: string; alt: string } | null => {
    if (!exp.media || exp.media.length === 0) return null;
    
    // First, look for a designated thumbnail
    const thumbnail = exp.media.find(media => media.type === 'thumbnail');
    if (thumbnail) return thumbnail;
    
    // If no thumbnail, use the first media item
    const firstMedia = exp.media[0];
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
      const cacheKey = `${exp.id}-${firstMedia.src}`;
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
  const createThumbnailErrorHandler = (exp: ExperienceItem) => (e: React.SyntheticEvent<HTMLImageElement>) => {
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
    if (exp.media && exp.media[0]?.type === 'gallery') {
      const galleryBase = exp.media[0].src;
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
    experience.experiences.forEach((exp) => {
      const cacheKey = `${exp.id}-${exp.media?.[0]?.src}`;
      if (thumbnailCache[cacheKey]) return; // already resolved
      
      const firstMedia = exp.media?.[0];
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
  }, [experience, thumbnailCache]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          Work <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Experience</span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto"></div>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-1 bg-gradient-to-b from-purple-400 to-pink-400 h-full"></div>
        
        <div className="space-y-12">
          {experience.experiences.map((exp, index) => {
            const isExpanded = expandedExperienceIndex === index;

            return (
              <div key={exp.id} className={`flex flex-col md:flex-row items-start md:items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Timeline Dot */}
                <div className="absolute left-2 md:left-1/2 transform md:-translate-x-1/2 w-5 h-5 bg-purple-400 rounded-full border-4 border-slate-900 z-10"></div>
                
                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300">
                    {/* Image Thumbnail */}
                    <div
                      className="absolute left-0 top-0 h-full w-48 flex-shrink-0"
                      onClick={() => openModal(exp)}
                    >
                      {(() => {
                        const thumbnail = getThumbnail(exp);
                        if (thumbnail && (thumbnail.type === 'image' || thumbnail.type === 'thumbnail')) {
                          return (
                            <div className="h-full w-full relative group cursor-pointer">
                              <Image
                                src={thumbnail.src}
                                alt={thumbnail.alt}
                                width={192}
                                height={192}
                                className="w-full h-full object-cover"
                                onError={createThumbnailErrorHandler(exp)}
                              />
                              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                  className="w-6 h-6 text-purple-400 cursor-pointer hover:text-pink-400 transition-colors duration-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-5xl text-purple-400/50">
                              {exp.company.split(' ').map(word => word[0]).join('').slice(0, 2)}
                            </div>
                          );
                        }
                      })()}
                    </div>
                    
                    {/* Header - Always Visible */}
                    <button
                      onClick={() => toggleExperience(index)}
                      className="w-full p-6 text-left focus:outline-none"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-white">{exp.position}</h3>
                            {hasMedia(exp) && (
                              <svg
                                className="w-6 h-6 text-purple-400 cursor-pointer hover:text-pink-400 transition-colors duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal(exp);
                                }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </div>
                          <h4 className="text-lg text-purple-400 mb-2">{exp.company}</h4>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-2">
                            <span>{exp.location}</span>
                            <span>•</span>
                            <span>{exp.type}</span>
                            {exp.current && <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Current</span>}
                          </div>
                          <p className="text-purple-300 text-sm">{exp.duration}</p>
                        </div>
                        <svg
                          className={`w-5 h-5 text-purple-400 transition-transform duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    
                    {/* Collapsible Content */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                      isExpanded
                        ? 'max-h-[800px] opacity-100 pb-6' 
                        : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-6">
                        <p className="text-gray-300 mb-4">{exp.description}</p>
                        
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-white font-semibold mb-2">Key Responsibilities:</h5>
                            <ul className="space-y-1">
                              {exp.responsibilities.slice(0, 3).map((resp, idx) => (
                                <li key={idx} className="text-gray-300 text-sm flex items-start">
                                  <span className="text-purple-400 mr-2 mt-1.5">•</span>
                                  {resp}
                                </li>
                              ))}
                              {exp.responsibilities.length > 3 && (
                                <li className="text-purple-400 text-sm italic">
                                  +{exp.responsibilities.length - 3} more responsibilities...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-white font-semibold mb-2">Key Achievements:</h5>
                            <ul className="space-y-1">
                              {exp.achievements.slice(0, 2).map((achievement, idx) => (
                                <li key={idx} className="text-gray-300 text-sm flex items-start">
                                  <span className="text-pink-400 mr-2 mt-1.5">★</span>
                                  {achievement}
                                </li>
                              ))}
                              {exp.achievements.length > 2 && (
                                <li className="text-purple-400 text-sm italic">
                                  +{exp.achievements.length - 2} more achievements...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Media Modal */}
      {selectedExperience && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedExperience.position}
                  </h3>
                  <p className="text-purple-300">
                    {selectedExperience.company} • {selectedExperience.duration}
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-400 mt-2">
                    <span>{selectedExperience.location}</span>
                    <span>•</span>
                    <span>{selectedExperience.type}</span>
                    {selectedExperience.current && <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Current</span>}
                  </div>
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
                <p className="text-gray-300">{selectedExperience.description}</p>
              </div>

              {/* Full Responsibilities */}
              {selectedExperience.responsibilities && selectedExperience.responsibilities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">Key Responsibilities:</h4>
                  <ul className="space-y-2">
                    {selectedExperience.responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start">
                        <span className="text-purple-400 mr-2 mt-1.5">•</span>
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Achievements */}
              {selectedExperience.achievements && selectedExperience.achievements.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">Key Achievements:</h4>
                  <ul className="space-y-2">
                    {selectedExperience.achievements.map((achievement, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start">
                        <span className="text-pink-400 mr-2 mt-1.5">★</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technologies */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Technologies Used:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedExperience.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Media Content */}
              {selectedExperience.media && selectedExperience.media.filter(media => media.type !== 'thumbnail').length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-4">Media:</h4>
                  <div className="space-y-6">
                    {selectedExperience.media.filter(media => media.type !== 'thumbnail').map((mediaItem, idx) => (
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

export default Experience; 