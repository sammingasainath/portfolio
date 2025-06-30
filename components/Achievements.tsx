'use client';

import { useState, useEffect } from 'react';
import MediaRenderer, { MediaItem } from './MediaRenderer';
import Image from 'next/image';

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

const getThumbnail = (item: Achievement | Leadership | Volunteering): string | null => {
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


const Achievements = ({ achievements }: AchievementsProps) => {
  const [selectedItem, setSelectedItem] = useState<Achievement | Leadership | Volunteering | null>(null);

  const openModal = (item: Achievement | Leadership | Volunteering) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedItem(null);
    document.body.style.overflow = 'auto';
  };
  
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
  }, []);

  const hasMedia = (item: Achievement | Leadership | Volunteering): boolean => {
    return !!(item.media && item.media.length > 0);
  };

  const Card = ({ item }: { item: Achievement | Leadership | Volunteering }) => {
    const thumbnailSrc = getThumbnail(item);
    const title = 'title' in item ? item.title : 'role' in item ? item.role : item.activity;

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
              {'organization' in item ? item.organization.split(' ').map(word => word[0]).join('').slice(0, 2) : 'A'}
            </div>
          )}
        </div>
        <div className="p-6">
          <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
          {'organization' in item && <p className="text-purple-300 text-sm mb-2">{item.organization} &bull; {'date' in item && item.date}</p>}
          <p className="text-gray-300 text-sm line-clamp-2">{item.description}</p>
        </div>
      </div>
    );
  };

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
            <Card key={achievement.id} item={achievement} />
          ))}
        </div>
      </div>

      {/* Other Achievements */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-white mb-8 text-center">Other Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.achievements.filter(a => !a.featured).map((achievement) => (
            <Card key={achievement.id} item={achievement} />
          ))}
        </div>
      </div>

      {/* Leadership */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-white mb-8 text-center">Leadership & Public Speaking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.leadership.map((role) => (
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

      {/* Volunteering */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-8 text-center">Volunteering</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.volunteering.map((activity) => (
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
                <p className="text-sm text-pink-300">{activity.organization}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-gray-900/70 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{'title' in selectedItem ? selectedItem.title : 'role' in selectedItem ? selectedItem.role : selectedItem.activity}</h3>
                  {'organization' in selectedItem && <p className="text-purple-300">{selectedItem.organization}</p>}
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-6">
                <p className="text-gray-300">{selectedItem.description}</p>
                {selectedItem.media && selectedItem.media.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mt-8 mb-4">Media</h4>
                    <MediaRenderer media={selectedItem.media} />
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

export default Achievements; 