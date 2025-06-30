'use client';

import { useState, useEffect, useCallback } from 'react';
import MediaRenderer, { MediaItem } from './MediaRenderer';
import Image from 'next/image';
import achievementsData from '@/public/data/achievements.json';

type Achievement = (typeof achievementsData.achievements)[0];
type Leadership = (typeof achievementsData.leadership)[0];
type Volunteering = (typeof achievementsData.volunteering)[0];

const Achievements = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Achievement | Leadership | Volunteering | null>(null);
  const { achievements, leadership, volunteering } = achievementsData;

  const getThumbnail = (item: Achievement | Leadership | Volunteering): string | null => {
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

  const hasMedia = (item: Achievement | Leadership | Volunteering): boolean => {
    return !!item.media && item.media.length > 0;
  };

  const openModal = useCallback((item: Achievement | Leadership | Volunteering) => {
    if (hasMedia(item)) {
      setSelectedItem(item);
      setModalOpen(true);
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedItem(null);
    document.body.style.overflow = 'auto';
    if (window.location.hash) {
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
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
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash) return;
    
      const parts = hash.substring(1).split('-');
      const type = parts[0];
      const id = parseInt(parts[1], 10);
    
      if (!type || isNaN(id)) return;
    
      let itemToOpen: Achievement | Leadership | Volunteering | undefined;
    
      if (type === 'achievement') {
        itemToOpen = achievements.find(item => item.id === id);
      } else if (type === 'leadership') {
        itemToOpen = leadership.find(item => item.id === id);
      } else if (type === 'volunteer') {
        itemToOpen = volunteering.find(item => item.id === id);
      }
    
      if (itemToOpen) {
        openModal(itemToOpen);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [achievements, leadership, volunteering, openModal]);

  const Card = ({ item }: { item: Achievement }) => {
    const thumbnailSrc = getThumbnail(item);
    const { title, date, organization, description, impact, project } = item;

    return (
      <div
        className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
        onClick={() => hasMedia(item) ? openModal(item) : undefined}
      >
        <div className="h-48 bg-black/20 flex items-center justify-center overflow-hidden">
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt={`${title} thumbnail`}
              width={400}
              height={400}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-6xl text-purple-400/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          )}
        </div>
        <div className="p-5">
          <p className="text-xs text-purple-300 uppercase tracking-wider">{organization} • {date}</p>
          <h3 className="text-white font-bold text-xl mt-2 mb-2">{title}</h3>
          {project && <p className="text-sm text-purple-200 mb-2">Project: {project}</p>}
          {impact && <p className="text-sm font-semibold text-green-300 mb-3">{impact}</p>}
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    );
  };

  // Leadership
  
  return (
    <section id="achievements" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-white mb-12">
          Achievements & Recognition
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {achievements.filter(a => a.featured).map((achievement) => (
            <Card key={achievement.id} item={achievement} />
          ))}
        </div>

        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Leadership & Public Speaking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadership.map((role) => (
               <div 
                  key={role.id}
                  className={`bg-white/10 rounded-lg overflow-hidden transition-all duration-300 ${hasMedia(role) ? 'cursor-pointer hover:bg-white/20' : ''}`}
                  onClick={() => hasMedia(role) ? openModal(role) : undefined}
                >
                <div className="h-40 bg-purple-500/10 flex items-center justify-center">
                  {getThumbnail(role) ? (
                    <Image src={getThumbnail(role)!} alt={`${role.role} thumbnail`} width={200} height={160} className="w-full h-full object-contain"/>
                  ) : (
                    <svg className="w-12 h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-white">{role.role}</h4>
                  <p className="text-sm text-purple-300">{role.organization}</p>
                  <p className="text-xs text-gray-400 mt-1">{role.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Volunteering</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {volunteering.map((activity) => (
              <div
                key={activity.id}
                className={`bg-white/10 rounded-lg overflow-hidden transition-all duration-300 ${hasMedia(activity) ? 'cursor-pointer hover:bg-white/20' : ''}`}
                onClick={() => hasMedia(activity) ? openModal(activity) : undefined}
              >
                <div className="h-40 bg-pink-500/10 flex items-center justify-center">
                  {getThumbnail(activity) ? (
                    <Image src={getThumbnail(activity)!} alt={`${activity.activity} thumbnail`} width={200} height={160} className="w-full h-full object-contain"/>
                  ) : (
                    <svg className="w-10 h-10 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white">{activity.activity}</h4>
                  <p className="text-sm text-pink-300">{activity.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {modalOpen && selectedItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <div 
              className="bg-gray-900/90 border border-purple-500/30 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl shadow-purple-500/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white pr-8">
                  {'title' in selectedItem ? selectedItem.title : 'role' in selectedItem ? selectedItem.role : selectedItem.activity}
                </h3>

                {'project' in selectedItem && selectedItem.project && (
                  <p className="text-purple-300">Project: {selectedItem.project}</p>
                )}
                {'impact' in selectedItem && selectedItem.impact && (
                  <p className="text-green-300 font-semibold">Impact: {selectedItem.impact}</p>
                )}

                <p className='text-gray-300 text-sm'>
                  {'description' in selectedItem && selectedItem.description}
                </p>
                
                {selectedItem.media && selectedItem.media.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-white mt-6 mb-3">Media</h4>
                    <MediaRenderer media={selectedItem.media as MediaItem[]} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Achievements; 