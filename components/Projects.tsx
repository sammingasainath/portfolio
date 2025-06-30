'use client';

import { useState, useEffect, useCallback } from 'react';
import MediaRenderer, { MediaItem } from './MediaRenderer';
import Image from 'next/image';

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
  media: MediaItem[];
}

interface ProjectsData {
  projects: Project[];
}

interface ProjectsProps {
  projects: ProjectsData;
}

const getProjectThumbnail = (project: Project): string | null => {
  if (!project.media || project.media.length === 0) return null;

  const firstMedia = project.media[0];
  if (firstMedia.type === 'gallery' && 'images' in firstMedia && firstMedia.images.length > 0) {
    return firstMedia.images[0];
  }

  const image = project.media.find(m => m.type === 'image' || m.type === 'thumbnail');
  if (image && 'src' in image) return image.src;

  // Fallback for any gallery if no image/thumbnail is found
  const gallery = project.media.find(m => m.type === 'gallery');
  if (gallery && 'images' in gallery && gallery.images.length > 0) {
    return gallery.images[0];
  }
  
  const videoMedia = project.media.find(m => m.type === 'video' && m.src.includes('youtube'));
  if (videoMedia?.type === 'video') {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = videoMedia.src.match(youtubeRegex);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }

  return null;
};

const Projects = ({ projects: { projects } }: ProjectsProps) => {
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNonFeatured, setShowNonFeatured] = useState(false);

  const categories = ['All', ...new Set(projects.map(p => p.category))];
  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

  const featuredProjects = projects.filter(p => p.featured);
  const nonFeaturedProjects = projects.filter(p => !p.featured);

  const openModal = (project: Project) => {
    setSelectedProject(project);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = useCallback(() => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  }, []);

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [closeModal]);

  const ProjectCard = ({ project }: { project: Project }) => {
    const thumbnailSrc = getProjectThumbnail(project);

    return (
      <div
        className="group relative bg-white/5 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-purple-500/20 hover:scale-105 cursor-pointer"
        onClick={() => openModal(project)}
      >
        <div className="relative w-full aspect-[16/10] bg-black/20">
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt={`${project.title} thumbnail`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <span className="text-3xl font-bold text-purple-400">
                {project.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        
        <div className="p-5">
          <h3 className="text-lg font-bold text-white mb-2 truncate group-hover:text-purple-300 transition-colors">{project.title}</h3>
          <p className="text-sm text-gray-400 mb-3 h-10 line-clamp-2">{project.tagline}</p>
          <div className="flex flex-wrap gap-2">
            {project.technologies.slice(0, 3).map((tech) => (
              <span key={tech} className="px-3 py-1 bg-purple-500/10 text-purple-300 text-xs font-medium rounded-full">
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-3 py-1 bg-gray-500/10 text-gray-300 text-xs font-medium rounded-full">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

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
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Other Projects Section */}
      {filter === 'All' && (
        <div className="mb-16">
          <div className="text-center">
            <button
              onClick={() => setShowNonFeatured(!showNonFeatured)}
              className="px-6 py-3 bg-white/5 border border-purple-400/30 text-purple-300 rounded-lg hover:bg-purple-500/10 hover:border-purple-400/60 transition-all duration-300 shadow-lg"
            >
              {showNonFeatured ? 'Hide Other Projects' : `Show ${nonFeaturedProjects.length} Other Projects`}
            </button>
          </div>
          {showNonFeatured && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
              {nonFeaturedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filtered Projects */}
      {filter !== 'All' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-gray-900/70 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedProject.title}</h3>
                  <p className="text-purple-300">{selectedProject.category}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-gray-300">{selectedProject.description}</p>

                {selectedProject.awards && selectedProject.awards.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Awards</h4>
                    <ul className="list-disc list-inside text-gray-300">
                      {selectedProject.awards.map((award, i) => <li key={i}>{award}</li>)}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map(tech => (
                      <span key={tech} className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  {selectedProject.demoUrl && (
                    <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Live Demo
                    </a>
                  )}
                  {selectedProject.sourceCodeUrl && (
                    <a href={selectedProject.sourceCodeUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                      Source Code
                    </a>
                  )}
                </div>

                {selectedProject.media && selectedProject.media.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mt-8 mb-4">Media</h4>
                    <MediaRenderer media={selectedProject.media} />
                  </div>
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