'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import MediaRenderer, { MediaItem } from './MediaRenderer';

interface Publication {
  id: number;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  type: 'journal' | 'conference' | 'preprint' | 'book' | 'thesis';
  status: 'Published' | 'Accepted' | 'Under Review' | 'In Progress';
  doi?: string;
  url?: string;
  abstract: string;
  keywords: string[];
  citations: number;
  media: MediaItem[];
}

interface Patent {
  id: number;
  title: string;
  inventors: string[];
  patentNumber?: string;
  applicationNumber: string;
  filingDate: string;
  publicationDate?: string;
  status: 'Granted' | 'Filed' | 'Published' | 'Pending';
  assignee: string;
  abstract: string;
  claims: number;
  url?: string;
  media: MediaItem[];
}

interface PublicationsProps {
  publications: Publication[];
  patents: Patent[];
}

const Publications = ({ publications, patents }: PublicationsProps) => {
  const [activeTab, setActiveTab] = useState<'publications' | 'patents' | 'both'>('both');
  const [selectedItem, setSelectedItem] = useState<Publication | Patent | null>(null);
  const isClosingRef = useRef(false);

  const openModal = useCallback((item: Publication | Patent) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    isClosingRef.current = true;
    setSelectedItem(null);
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
      if (hash.startsWith('#publication-')) {
        const idPart = hash.substring('#publication-'.length);
        const pubId = parseInt(idPart, 10);
        if (!Number.isNaN(pubId)) {
          // ensure correct tab visible
          setActiveTab('publications');
          const match: Publication | undefined = publications.find((p: Publication) => p.id === pubId);
          if (match) openModal(match);
        }
      } else if (hash.startsWith('#patent-')) {
        const idPart = hash.substring('#patent-'.length);
        const patId = parseInt(idPart, 10);
        if (!Number.isNaN(patId)) {
          setActiveTab('patents');
          const match: Patent | undefined = patents.find((p: Patent) => p.id === patId);
          if (match) openModal(match);
        }
      }
    };

    // Delay to ensure hydration
    const timer = setTimeout(processHash, 100);
    window.addEventListener('hashchange', processHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', processHash);
    };
  }, [publications, patents, openModal]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
      case 'Granted':
        return 'bg-green-500/10 text-green-300';
      case 'Accepted':
      case 'Filed':
        return 'bg-blue-500/10 text-blue-300';
      case 'Under Review':
        return 'bg-yellow-500/10 text-yellow-300';
      case 'In Progress':
      case 'Pending':
        return 'bg-purple-500/10 text-purple-300';
      default:
        return 'bg-gray-500/10 text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getThumbnail = (item: Publication | Patent): string | null => {
    if (!item.media || item.media.length === 0) return null;

    const firstMedia = item.media[0];
    if (firstMedia.type === 'gallery' && 'images' in firstMedia && firstMedia.images && firstMedia.images.length > 0) {
      return firstMedia.images[0];
    }

    const image = item.media.find(m => m.type === 'image' || m.type === 'thumbnail');
    if (image && 'src' in image) return image.src || null;

    // Fallback for any gallery if no image/thumbnail is found
    const gallery = item.media.find(m => m.type === 'gallery');
    if (gallery && 'images' in gallery && gallery.images && gallery.images.length > 0) {
      return gallery.images[0];
    }

    return null;
  };

  const PublicationCard = ({ publication }: { publication: Publication }) => {
    const thumbnailSrc = getThumbnail(publication);

    return (
      <div
        className="group relative bg-white/5 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-purple-500/20 hover:scale-105 cursor-pointer hover:bg-white/10 hover:shadow-2xl hover:border hover:border-purple-500/30"
        onClick={() => openModal(publication)}
      >
        <div className="relative w-full aspect-[16/10] bg-black/20">
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt={`${publication.title} thumbnail`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <span className="text-3xl font-bold text-purple-400">
                {publication.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute top-3 right-3 text-gray-400 text-sm">
            {publication.year}
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(publication.status)}`}>
              {publication.status}
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {publication.title}
          </h3>

          <p className="text-sm text-gray-400 mb-2 line-clamp-1">
            {publication.authors.join(', ')}
          </p>

          <p className="text-sm text-gray-400 mb-3 line-clamp-1">
            {publication.journal}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {publication.keywords.slice(0, 3).map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-500/10 text-purple-300 text-xs font-medium rounded-full"
              >
                {keyword}
              </span>
            ))}
            {publication.keywords.length > 3 && (
              <span className="px-3 py-1 bg-gray-500/10 text-gray-300 text-xs font-medium rounded-full">
                +{publication.keywords.length - 3}
              </span>
            )}
          </div>

          <div className="flex justify-between items-end">
            {publication.citations > 0 && (
              <div className="text-xs text-gray-400 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {publication.citations} citations
              </div>
            )}
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

  const PatentCard = ({ patent }: { patent: Patent }) => {
    const thumbnailSrc = getThumbnail(patent);

    return (
      <div
        className="group relative bg-white/5 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-purple-500/20 hover:scale-105 cursor-pointer hover:bg-white/10 hover:shadow-2xl hover:border hover:border-purple-500/30"
        onClick={() => openModal(patent)}
      >
        <div className="relative w-full aspect-[16/10] bg-black/20">
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt={`${patent.title} thumbnail`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <span className="text-3xl font-bold text-purple-400">
                {patent.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {patent.patentNumber && (
            <div className="absolute top-3 right-3 text-gray-400 text-xs">
              {patent.patentNumber}
            </div>
          )}
        </div>
        
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patent.status)}`}>
              {patent.status}
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {patent.title}
          </h3>

          <p className="text-sm text-gray-400 mb-2 line-clamp-1">
            {patent.inventors.join(', ')}
          </p>

          <p className="text-sm text-gray-400 mb-3 line-clamp-1">
            {patent.assignee}
          </p>

          <div className="text-xs text-gray-400 space-y-1 mb-4">
            <div>Filed: {formatDate(patent.filingDate)}</div>
            <div>Claims: {patent.claims}</div>
          </div>

          <div className="flex justify-end">
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
          Publications & <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Patents</span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mb-8"></div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('publications')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 transform ${
              activeTab === 'publications'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:shadow-md hover:border hover:border-purple-400/30'
            }`}
          >
            Publications ({publications.length})
          </button>
          <button
            onClick={() => setActiveTab('patents')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 transform ${
              activeTab === 'patents'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:shadow-md hover:border hover:border-purple-400/30'
            }`}
          >
            Patents ({patents.length})
          </button>
          <button
            onClick={() => setActiveTab('both')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 transform ${
              activeTab === 'both'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:shadow-md hover:border hover:border-purple-400/30'
            }`}
          >
            Both ({publications.length + patents.length})
          </button>
        </div>
      </div>

      {/* Publications */}
      {activeTab === 'publications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publications.map((publication) => (
            <PublicationCard key={publication.id} publication={publication} />
          ))}
        </div>
      )}

      {/* Patents */}
      {activeTab === 'patents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {patents.map((patent) => (
            <PatentCard key={patent.id} patent={patent} />
          ))}
        </div>
      )}

      {/* Both Publications and Patents */}
      {activeTab === 'both' && (
        <div className="space-y-12">
          {/* Publications Section */}
          {publications.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Publications</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publications.map((publication) => (
                  <PublicationCard key={`pub-${publication.id}`} publication={publication} />
                ))}
              </div>
            </div>
          )}

          {/* Patents Section */}
          {patents.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Patents</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {patents.map((patent) => (
                  <PatentCard key={`pat-${patent.id}`} patent={patent} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {selectedItem && (
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
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedItem.status)}`}>
                    {selectedItem.status}
                  </div>
                  {'year' in selectedItem ? (
                    <span className="text-gray-400">{selectedItem.year}</span>
                  ) : (
                    selectedItem.patentNumber && (
                      <span className="text-gray-400">{selectedItem.patentNumber}</span>
                    )
                  )}
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4">
                  {selectedItem.title}
                </h3>

                {'authors' in selectedItem ? (
                  <div className="space-y-2 mb-6">
                    <p className="text-gray-300">
                      <strong>Authors:</strong> {selectedItem.authors.join(', ')}
                    </p>
                    <p className="text-gray-300">
                      <strong>Journal:</strong> {selectedItem.journal}
                    </p>
                    {selectedItem.doi && (
                      <p className="text-gray-300">
                        <strong>DOI:</strong> 
                        <a href={`https://doi.org/${selectedItem.doi}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 ml-2">
                          {selectedItem.doi}
                        </a>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 mb-6">
                    <p className="text-gray-300">
                      <strong>Inventors:</strong> {selectedItem.inventors.join(', ')}
                    </p>
                    <p className="text-gray-300">
                      <strong>Assignee:</strong> {selectedItem.assignee}
                    </p>
                    <p className="text-gray-300">
                      <strong>Application Number:</strong> {selectedItem.applicationNumber}
                    </p>
                    <p className="text-gray-300">
                      <strong>Filing Date:</strong> {formatDate(selectedItem.filingDate)}
                    </p>
                    {selectedItem.publicationDate && (
                      <p className="text-gray-300">
                        <strong>Publication Date:</strong> {formatDate(selectedItem.publicationDate)}
                      </p>
                    )}
                    <p className="text-gray-300">
                      <strong>Number of Claims:</strong> {selectedItem.claims}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-white mb-3">Abstract</h4>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedItem.abstract}
                  </p>
                </div>

                {'keywords' in selectedItem && selectedItem.keywords.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-white mb-3">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-600/20 text-purple-300 text-sm rounded-md border border-purple-500/30"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.url && (
                  <div className="mb-6">
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      View {'authors' in selectedItem ? 'Publication' : 'Patent'}
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              {selectedItem.media && selectedItem.media.length > 0 && (
                <div>
                  <h4 className="text-xl font-semibold text-white mb-3">Media</h4>
                  <MediaRenderer media={selectedItem.media} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Publications;
