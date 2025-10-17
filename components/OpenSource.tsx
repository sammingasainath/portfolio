'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import MediaRenderer, { MediaItem } from './MediaRenderer';

interface Contribution {
  id: number;
  name: string;
  description: string;
  type: 'project' | 'contribution' | 'maintenance';
  role: string;
  technologies: string[];
  repository: string;
  homepage?: string;
  stars: number;
  forks: number;
  license: string;
  status: 'Active' | 'Archived' | 'Merged' | 'Closed';
  startDate: string;
  lastUpdated: string;
  contributions: {
    commits: number;
    pullRequests: number;
    issues: number;
  };
  impact: string;
  featured: boolean;
  media: MediaItem[];
}

interface OpenSourceProps {
  contributions: Contribution[];
}

const OpenSource = ({ contributions }: OpenSourceProps) => {
  const [filter, setFilter] = useState<'all' | 'project' | 'contribution' | 'maintenance'>('all');
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [showNonFeatured, setShowNonFeatured] = useState(false);
  const isClosingRef = useRef(false);

  const openModal = useCallback((contribution: Contribution) => {
    setSelectedContribution(contribution);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    isClosingRef.current = true;
    setSelectedContribution(null);
    document.body.style.overflow = 'auto';
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.pushState({}, document.title, window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  useEffect(() => {
    const processHash = () => {
      if (isClosingRef.current) {
        isClosingRef.current = false;
        return;
      }
      const hash = window.location.hash;
      if (hash.startsWith('#opensource-')) {
        const idPart = hash.substring('#opensource-'.length);
        const contributionId = parseInt(idPart, 10);
        if (!Number.isNaN(contributionId)) {
          const match = contributions.find(c => c.id === contributionId);
          if (match) {
            openModal(match);
          }
        }
      }
    };

    // Delay to ensure the app is hydrated and ready
    const timer = setTimeout(processHash, 100);
    window.addEventListener('hashchange', processHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', processHash);
    };
  }, [contributions, openModal]);

  const types = ['all', 'project', 'contribution', 'maintenance'] as const;
  const filteredContributions = filter === 'all' 
    ? contributions 
    : contributions.filter(c => c.type === filter);

  const featuredContributions = contributions.filter(c => c.featured);
  const nonFeaturedContributions = contributions.filter(c => !c.featured);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/10 text-green-300';
      case 'Merged':
        return 'bg-blue-500/10 text-blue-300';
      case 'Archived':
        return 'bg-yellow-500/10 text-yellow-300';
      case 'Closed':
        return 'bg-red-500/10 text-red-300';
      default:
        return 'bg-gray-500/10 text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-purple-500/10 text-purple-300';
      case 'contribution':
        return 'bg-blue-500/10 text-blue-300';
      case 'maintenance':
        return 'bg-orange-500/10 text-orange-300';
      default:
        return 'bg-gray-500/10 text-gray-300';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getThumbnail = (contribution: Contribution): string | null => {
    if (!contribution.media || contribution.media.length === 0) return null;

    const firstMedia = contribution.media[0];
    if (firstMedia.type === 'gallery' && 'images' in firstMedia && firstMedia.images && firstMedia.images.length > 0) {
      return firstMedia.images[0];
    }

    const image = contribution.media.find(m => m.type === 'image' || m.type === 'thumbnail');
    if (image && 'src' in image) return image.src || null;

    // Fallback for any gallery if no image/thumbnail is found
    const gallery = contribution.media.find(m => m.type === 'gallery');
    if (gallery && 'images' in gallery && gallery.images && gallery.images.length > 0) {
      return gallery.images[0];
    }

    return null;
  };

  const ContributionCard = ({ contribution }: { contribution: Contribution }) => {
    const thumbnailSrc = getThumbnail(contribution);

    return (
      <div
        className="group relative bg-white/5 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-purple-500/20 hover:scale-105 cursor-pointer hover:bg-white/10 hover:shadow-2xl hover:border hover:border-purple-500/30"
        onClick={() => openModal(contribution)}
      >
        <div className="relative w-full aspect-[16/10] bg-black/20">
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt={`${contribution.name} thumbnail`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <span className="text-3xl font-bold text-purple-400">
                {contribution.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contribution.status)}`}>
              {contribution.status}
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {formatNumber(contribution.stars)}
              </span>
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 717 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7a2 2 0 010-2.828l3.707-3.707a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {formatNumber(contribution.forks)}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 truncate group-hover:text-purple-300 transition-colors">
            {contribution.name}
          </h3>

          <p className="text-sm text-gray-400 mb-3 h-10 line-clamp-2">
            {contribution.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {contribution.technologies.slice(0, 3).map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-500/10 text-purple-300 text-xs font-medium rounded-full"
              >
                {tech}
              </span>
            ))}
            {contribution.technologies.length > 3 && (
              <span className="px-3 py-1 bg-gray-500/10 text-gray-300 text-xs font-medium rounded-full">
                +{contribution.technologies.length - 3}
              </span>
            )}
          </div>

          <div className="flex justify-between items-end">
            <div className="text-xs text-gray-400">
              {contribution.role}
            </div>
            <div className="inline-flex items-center text-xs text-purple-400 group-hover:text-purple-300 transition-colors">
              <span>Know More</span>
              <svg className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          Open Source <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Contributions</span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mb-8"></div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize cursor-pointer hover:scale-105 transform ${
                filter === type
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:shadow-md hover:border hover:border-purple-400/30'
              }`}
            >
              {type} ({type === 'all' ? contributions.length : contributions.filter(c => c.type === type).length})
            </button>
          ))}
        </div>
      </div>

      {/* Featured Contributions */}
      {filter === 'all' && featuredContributions.length > 0 && (
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Featured Contributions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredContributions.slice(0, 3).map((contribution) => (
              <ContributionCard key={contribution.id} contribution={contribution} />
            ))}
          </div>
        </div>
      )}

      {/* Other Contributions Section */}
      {filter === 'all' && nonFeaturedContributions.length > 0 && (
        <div className="mb-16">
          <div className="text-center">
            <button
              onClick={() => setShowNonFeatured(!showNonFeatured)}
              className="px-6 py-3 bg-white/5 border border-purple-400/30 text-purple-300 rounded-lg hover:bg-purple-500/10 hover:border-purple-400/60 transition-all duration-300 shadow-lg cursor-pointer hover:scale-105 transform hover:shadow-purple-400/50 hover:shadow-xl relative group"
            >
              <span className="relative z-10">{showNonFeatured ? 'Hide Other Contributions' : `Show ${nonFeaturedContributions.length} Other Contributions`}</span>
              <div className="absolute inset-0 rounded-lg bg-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200"></div>
            </button>
          </div>
          {showNonFeatured && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
              {nonFeaturedContributions.map((contribution) => (
                <ContributionCard key={contribution.id} contribution={contribution} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filtered Contributions */}
      {filter !== 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContributions.map((contribution) => (
            <ContributionCard key={contribution.id} contribution={contribution} />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedContribution && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div 
            className="bg-gray-900/90 border border-purple-500/30 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl shadow-purple-500/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="space-y-6 pr-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(selectedContribution.type)}`}>
                    {selectedContribution.type}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedContribution.status)}`}>
                    {selectedContribution.status}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-gray-400">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {formatNumber(selectedContribution.stars)}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7a2 2 0 010-2.828l3.707-3.707a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {formatNumber(selectedContribution.forks)}
                  </span>
                </div>
              </div>

              <h3 className="text-3xl font-bold text-white mb-4">
                {selectedContribution.name}
              </h3>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <p className="text-gray-300">
                    <strong>Role:</strong> {selectedContribution.role}
                  </p>
                  <p className="text-gray-300">
                    <strong>License:</strong> {selectedContribution.license}
                  </p>
                  <p className="text-gray-300">
                    <strong>Started:</strong> {formatDate(selectedContribution.startDate)}
                  </p>
                  <p className="text-gray-300">
                    <strong>Last Updated:</strong> {formatDate(selectedContribution.lastUpdated)}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-300">
                    <strong>Commits:</strong> {selectedContribution.contributions.commits}
                  </p>
                  <p className="text-gray-300">
                    <strong>Pull Requests:</strong> {selectedContribution.contributions.pullRequests}
                  </p>
                  <p className="text-gray-300">
                    <strong>Issues:</strong> {selectedContribution.contributions.issues}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xl font-semibold text-white mb-3">Description</h4>
                <p className="text-gray-300 leading-relaxed">
                  {selectedContribution.description}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-xl font-semibold text-white mb-3">Impact</h4>
                <p className="text-gray-300 leading-relaxed">
                  {selectedContribution.impact}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-xl font-semibold text-white mb-3">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedContribution.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-md border border-blue-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <a
                  href={selectedContribution.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  View Repository
                </a>
                
                {selectedContribution.homepage && (
                  <a
                    href={selectedContribution.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Live Demo
                  </a>
                )}
              </div>

              {selectedContribution.media && selectedContribution.media.length > 0 && (
                <div>
                  <h4 className="text-xl font-semibold text-white mb-3">Media</h4>
                  <MediaRenderer media={selectedContribution.media} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenSource;
