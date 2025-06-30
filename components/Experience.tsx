'use client';

import { useState } from 'react';
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

const getThumbnail = (item: ExperienceItem): string | null => {
  if (!item.media || item.media.length === 0) {
    return null;
  }

  // 1. Look for an explicit 'thumbnail' type
  const thumbnailMedia = item.media.find(m => m.type === 'thumbnail');
  if (thumbnailMedia?.type === 'thumbnail') {
    return thumbnailMedia.src;
  }

  // 2. Look for the first 'image' type
  const imageMedia = item.media.find(m => m.type === 'image');
  if (imageMedia?.type === 'image') {
    return imageMedia.src;
  }

  // 3. Look for the first 'gallery' and take its first image
  const galleryMedia = item.media.find(m => m.type === 'gallery');
  if (galleryMedia?.type === 'gallery' && galleryMedia.images.length > 0) {
    return galleryMedia.images[0];
  }

  // 4. Handle YouTube videos
  const videoMedia = item.media.find(m => m.type === 'video' && m.src.includes('youtube'));
  if (videoMedia?.type === 'video') {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = videoMedia.src.match(youtubeRegex);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }

  return null; // No suitable thumbnail found
};

const Experience = ({ experience }: ExperienceProps) => {
  const [selectedExperience, setSelectedExperience] = useState<ExperienceItem | null>(null);
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
            const thumbnailSrc = getThumbnail(exp);

            return (
              <div key={exp.id} className={`flex flex-col md:flex-row items-start md:items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Timeline Dot */}
                <div className="absolute left-2 md:left-1/2 transform md:-translate-x-1/2 w-5 h-5 bg-purple-400 rounded-full border-4 border-slate-900 z-10"></div>
                
                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl flex flex-col sm:flex-row overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300">
                    {/* Image Thumbnail */}
                    <div 
                      onClick={() => hasMedia(exp) && openModal(exp)}
                      className={`w-full sm:w-1/3 h-48 sm:h-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0 overflow-hidden ${hasMedia(exp) ? 'cursor-pointer' : ''}`}
                    >
                      {thumbnailSrc ? (
                        <Image
                          src={thumbnailSrc}
                          alt={`${exp.company} thumbnail`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-5xl text-purple-400/50">
                          {exp.company.split(' ').map(word => word[0]).join('').slice(0, 2)}
                        </div>
                      )}
                    </div>
                    
                    {/* Main Content */}
                    <div className="p-6 w-full sm:w-2/3">
                      <button 
                        onClick={() => toggleExperience(index)}
                        className="w-full text-left"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-lg font-bold text-white">{exp.position}</h4>
                            <p className="text-purple-300 text-sm">{exp.company}</p>
                          </div>
                          <svg className={`w-5 h-5 text-purple-400 transition-transform duration-300 shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <p className="text-gray-400 text-xs mb-3">{exp.duration} • {exp.type} • {exp.location}</p>
                      </button>

                      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 mt-3' : 'max-h-0'}`}>
                        <p className="text-gray-300 text-sm mb-3">{exp.description}</p>
                        <h5 className="text-white font-semibold text-sm mb-2">Key Responsibilities:</h5>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {exp.responsibilities.slice(0, 3).map((resp, i) => <li key={i}>{resp}</li>)}
                          {exp.responsibilities.length > 3 && <li>+{exp.responsibilities.length - 3} more...</li>}
                        </ul>
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