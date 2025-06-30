'use client';

import { useState, useEffect } from 'react';
import MediaRenderer, { MediaItem } from './MediaRenderer';
import Image from 'next/image';

interface ProjectMedia extends MediaItem {
  title?: string; // Optional title for gallery sections
}

interface Project {
  id: number;
  title: string;
  tagline: string;
  description: string;
  technologies: string[];
  category: string;
  status: string;
  demoUrl?: string;
  sourceCodeUrl?: string;
  featured: boolean;
  awards?: string[];
  media: ProjectMedia[];
}

interface ProjectsData {
  projects: Project[];
}

interface ProjectsProps {
  projects: ProjectsData;
}

// Probe a list of image URLs and resolve the first that loads successfully
const findFirstExistingImage = (urls: string[]): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!urls || urls.length === 0) return resolve(null);

    let idx = 0;
    const tryNext = () => {
      if (idx >= urls.length) return resolve(null);
      const testImg = new Image();
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

const Projects = ({ projects }: ProjectsProps) => {
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNonFeatured, setShowNonFeatured] = useState(false);
  const [thumbnailCache, setThumbnailCache] = useState<Record<number, string>>({});

  const categories = ['All', ...new Set(projects.projects.map(p => p.category))];
  const filteredProjects = filter === 'All' 
    ? projects.projects 
    : projects.projects.filter(p => p.category === filter);

  const featuredProjects = projects.projects.filter(p => p.featured);
  const nonFeaturedProjects = projects.projects.filter(p => !p.featured);

  // Helper function to get gallery thumbnail alternatives
  const getGalleryThumbnailAlternatives = (basePath: string): string[] => {
    // Handle URL encoding for paths with spaces
    const encodedBasePath = basePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    
    return [
      // Primary numeric screenshot
      `${encodedBasePath}/1.jpg`,
      `${encodedBasePath}/1.jpeg`,
      `${encodedBasePath}/1.png`,
      `${encodedBasePath}/1.webp`,

      // Generic screenshot names
      `${encodedBasePath}/screenshot.jpg`,
      `${encodedBasePath}/screenshot.jpeg`,
      `${encodedBasePath}/screenshot.png`,

      // "demo" fallback
      `${encodedBasePath}/demo.jpg`,
      `${encodedBasePath}/demo.jpeg`,
      `${encodedBasePath}/demo.png`,

      // "preview" fallback
      `${encodedBasePath}/preview.jpg`,
      `${encodedBasePath}/preview.jpeg`,
      `${encodedBasePath}/preview.png`,

      // "main" fallback
      `${encodedBasePath}/main.jpg`,
      `${encodedBasePath}/main.jpeg`,
      `${encodedBasePath}/main.png`,

      // "hero" fallback
      `${encodedBasePath}/hero.jpg`,
      `${encodedBasePath}/hero.jpeg`,
      `${encodedBasePath}/hero.png`
    ];
  };

  // Helper function to create thumbnail error handler
  const createThumbnailErrorHandler = (project: Project) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const currentSrc = target.src;

    // --- YouTube thumbnails --------------------------------------------------
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
      // Final fallback – stop listening to avoid infinite loop
      target.onerror = null;
      return;
    }

    // --- Gallery thumbnails --------------------------------------------------
    if (project.media && project.media[0]?.type === 'gallery') {
      const galleryBase = project.media[0].src;
      const alternatives = getGalleryThumbnailAlternatives(galleryBase);

      // Find current index in list (match by filename)
      const currentFile = currentSrc.substring(currentSrc.lastIndexOf('/')); // includes leading '/'
      const currentIdx = alternatives.findIndex((alt) => alt.endsWith(currentFile));
      const nextIdx = currentIdx + 1;

      if (nextIdx < alternatives.length) {
        target.src = alternatives[nextIdx];
      } else {
        // No more fallbacks – stop error listener
        target.onerror = null;
      }
    } else {
      // Non-gallery / non-YouTube – just disable further retries to avoid console spam
      target.onerror = null;
    }
  };



  // Helper function to detect YouTube URLs (used for thumbnails)
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Helper function to get YouTube thumbnail with multiple resolution options
  const getYouTubeThumbnailUrls = (url: string): string[] => {
    // Enhanced regex to handle various YouTube URL formats
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      const videoId = match[1];
      // Return multiple thumbnail URLs in order of preference
      return [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/default.jpg`
      ];
    }
    return [];
  };

  const getYouTubeThumbnail = (url: string): string | null => {
    const thumbnails = getYouTubeThumbnailUrls(url);
    return thumbnails.length > 0 ? thumbnails[0] : null;
  };

  // Helper function to get project thumbnail
  const getProjectThumbnail = (project: Project): { type: string; src: string; alt: string } | null => {
    if (!project.media || project.media.length === 0) return null;
    
    // First, look for a designated thumbnail
    const thumbnail = project.media.find(media => media.type === 'thumbnail');
    if (thumbnail) return thumbnail;
    
    // If no thumbnail, use the first media item
    const firstMedia = project.media[0];
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
      const cached = thumbnailCache[project.id];
      if (cached) {
        return { type: 'image', src: cached, alt: firstMedia.alt };
      }
      // Otherwise return null to show letter fallback until resolved
      return null;
    }
    
    return firstMedia;
  };

  // Test function to verify thumbnail paths for problematic projects
  const testThumbnailPaths = () => {
    console.log('🧪 === THUMBNAIL PATH TESTING ===');
    
    // Test UPI Payment System
    const upiProject = projects.projects.find(p => p.title.includes('UPI') || p.title.includes('Serverless'));
    if (upiProject) {
      console.log('📱 UPI Payment System Test:');
      console.log('  - Project found:', upiProject.title);
      console.log('  - Media config:', upiProject.media[0]);
      const thumbnail = getProjectThumbnail(upiProject);
      console.log('  - Generated thumbnail:', thumbnail);
      console.log('  - Expected to work: http://localhost:3000/media/ServerlessPG/1.png');
    }
    
    // Test Harit Parishar
    const haritProject = projects.projects.find(p => p.title.includes('Harit'));
    if (haritProject) {
      console.log('🌱 Harit Parishar Test:');
      console.log('  - Project found:', haritProject.title);
      console.log('  - Media config:', haritProject.media[0]);
      const thumbnail = getProjectThumbnail(haritProject);
      console.log('  - Generated thumbnail:', thumbnail);
      console.log('  - Expected to work: http://localhost:3000/media/Harit%20Parisar/1.jpeg');
    }
    
    // Test Post4Planet
    const post4Planet = projects.projects.find(p => p.title.includes('Post4Planet'));
    if (post4Planet) {
      console.log('🌍 Post4Planet Test:');
      const thumbnail = getProjectThumbnail(post4Planet);
      console.log('  - Generated thumbnail:', thumbnail);
      console.log('  - Expected to work: http://localhost:3000/media/Post4Planet/1.jpg');
    }
  };

  // Run test on component mount
  useEffect(() => {
    testThumbnailPaths();
  }, []);

  // Probe gallery thumbnails once on mount / when projects change
  useEffect(() => {
    projects.projects.forEach((project) => {
      if (thumbnailCache[project.id]) return; // already resolved
      const firstMedia = project.media?.[0];
      if (firstMedia && firstMedia.type === 'gallery') {
        const alternatives = getGalleryThumbnailAlternatives(firstMedia.src);
        findFirstExistingImage(alternatives).then((url) => {
          if (url) {
            setThumbnailCache((prev) => ({ ...prev, [project.id]: url }));
          } else {
            setThumbnailCache((prev) => ({ ...prev, [project.id]: '' })); // mark attempted
          }
        });
      }
    });
  }, [projects.projects]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          My <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Projects</span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mb-8"></div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Projects */}
      {filter === 'All' && (
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Featured Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                  {(() => {
                    const thumbnail = getProjectThumbnail(project);
                    if (thumbnail && (thumbnail.type === 'image' || thumbnail.type === 'thumbnail')) {
                      return (
                        <Image
                          src={thumbnail.src}
                          alt={thumbnail.alt}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={createThumbnailErrorHandler(project)}
                        />
                      );
                    } else {
                      return (
                        <div className="text-6xl text-purple-400/50">
                          {project.title.split(' ').map(word => word[0]).join('').slice(0, 2)}
                        </div>
                      );
                    }
                  })()}
                </div>
                
                <div className="p-6">
                  <h4 className="text-xl font-bold text-white mb-2">{project.title}</h4>
                  <p className="text-purple-300 text-sm mb-3">{project.tagline}</p>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>
                  
                  {project.awards && project.awards.length > 0 && (
                    <div className="mb-3">
                      {project.awards.map((award, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs mr-2">
                          🏆 {award}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.technologies.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs">
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Live Demo
                      </a>
                    )}
                    {project.sourceCodeUrl && (
                      <a
                        href={project.sourceCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-3 py-2 rounded text-sm text-center transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Source Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-Featured Projects Section */}
      {filter === 'All' && nonFeaturedProjects.length > 0 && (
        <div className="mb-16">
          <div className="text-center mb-8">
            <button
              onClick={() => setShowNonFeatured(!showNonFeatured)}
              className="group flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-white">
                Other Projects ({nonFeaturedProjects.length})
              </h3>
              <svg
                className={`w-5 h-5 text-purple-400 transition-transform duration-300 ${
                  showNonFeatured ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <p className="text-gray-400 text-sm mt-2">
              {showNonFeatured ? 'Click to collapse' : 'Click to view more projects'}
            </p>
          </div>
          
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
            showNonFeatured 
              ? 'max-h-[2000px] opacity-100' 
              : 'max-h-0 opacity-0'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {nonFeaturedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                    {(() => {
                      const thumbnail = getProjectThumbnail(project);
                      if (thumbnail && (thumbnail.type === 'image' || thumbnail.type === 'thumbnail')) {
                        return (
                          <Image
                            src={thumbnail.src}
                            alt={thumbnail.alt}
                            width={400}
                            height={400}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={createThumbnailErrorHandler(project)}
                          />
                        );
                      } else {
                        return (
                          <div className="text-4xl text-purple-400/50">
                            {project.title.split(' ').map(word => word[0]).join('').slice(0, 2)}
                          </div>
                        );
                      }
                    })()}
                  </div>
                  
                  <div className="p-4">
                    <h4 className="text-lg font-bold text-white mb-1">{project.title}</h4>
                    <p className="text-purple-300 text-xs mb-2">{project.category}</p>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{project.tagline}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 2).map((tech, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 2 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs">
                          +{project.technologies.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Projects Grid - Only show when filter is not 'All' */}
      {filter !== 'All' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                {(() => {
                  const thumbnail = getProjectThumbnail(project);
                  if (thumbnail && (thumbnail.type === 'image' || thumbnail.type === 'thumbnail')) {
                    return (
                      <Image
                        src={thumbnail.src}
                        alt={thumbnail.alt}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={createThumbnailErrorHandler(project)}
                      />
                    );
                  } else {
                    return (
                      <div className="text-4xl text-purple-400/50">
                        {project.title.split(' ').map(word => word[0]).join('').slice(0, 2)}
                      </div>
                    );
                  }
                })()}
              </div>
              
              <div className="p-4">
                <h4 className="text-lg font-bold text-white mb-1">{project.title}</h4>
                <p className="text-purple-300 text-xs mb-2">{project.category}</p>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{project.tagline}</p>
                
                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 2).map((tech, idx) => (
                    <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 2 && (
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs">
                      +{project.technologies.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-white/10">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-white">{selectedProject.title}</h3>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <p className="text-purple-300 mb-2">{selectedProject.tagline}</p>
              <p className="text-gray-300 mb-4">{selectedProject.description}</p>
              
              {/* Media Gallery */}
              {selectedProject.media && selectedProject.media.filter(media => media.type !== 'thumbnail').length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-4">Project Media:</h4>
                  <div className="space-y-6">
                    {selectedProject.media.filter(media => media.type !== 'thumbnail').map((mediaItem, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg overflow-hidden">
                        <h5 className="text-purple-300 font-medium p-3 bg-white/5 border-b border-white/10">
                          {mediaItem.alt}
                        </h5>
                        <div className="p-4">
                          <MediaRenderer mediaItem={mediaItem} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedProject.awards && selectedProject.awards.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-2">Awards & Recognition:</h4>
                  {selectedProject.awards.map((award, idx) => (
                    <span key={idx} className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded mr-2 mb-2">
                      🏆 {award}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-2">Technologies Used:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4">
                {selectedProject.demoUrl && (
                  <a
                    href={selectedProject.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Live Demo
                  </a>
                )}
                {selectedProject.sourceCodeUrl && (
                  <a
                    href={selectedProject.sourceCodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Source Code
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects; 