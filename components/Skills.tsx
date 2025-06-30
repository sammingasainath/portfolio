'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SkillItem {
  name: string;
  logo?: string;
}

interface SkillCategory {
  name: string;
  skills: (string | SkillItem)[];
}

interface SkillsData {
  categories: SkillCategory[];
}

interface SkillsProps {
  skills: SkillsData;
}

interface SkillCategoryWithIndex extends SkillCategory {
  originalIndex: number;
}

interface SkillCardProps {
  category: SkillCategory;
  index: number;
  isExpanded: boolean;
  onToggle: (index: number) => void;
  getIconForCategory: (categoryName: string) => string;
  getSkillName: (skill: string | SkillItem) => string;
  getSkillLogo: (skill: string | SkillItem) => string | undefined;
}

const SkillCard = ({ category, index, isExpanded, onToggle, getIconForCategory, getSkillName, getSkillLogo }: SkillCardProps) => {
  return (
    <div 
      key={`${category.name}-${index}`}
      className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
    >
      <button
        onClick={() => onToggle(index)}
        className="w-full p-6 text-left focus:outline-none"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg 
              className="w-6 h-6 text-purple-400 mr-3 group-hover:text-pink-400 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={getIconForCategory(category.name)} 
              />
            </svg>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
              {category.name}
            </h3>
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
      
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded 
            ? 'max-h-[500px] opacity-100' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 flex flex-wrap gap-2">
          {category.skills.map((skill, skillIndex) => {
            const skillName = getSkillName(skill);
            const skillLogo = getSkillLogo(skill);
            
            return (
              <span
                key={`${category.name}-skill-${skillIndex}`}
                className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30 hover:bg-purple-500/30 hover:text-white transition-all duration-200"
              >
                {skillLogo && (
                  <Image
                    src={skillLogo}
                    alt={`${skillName} logo`}
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                {skillName}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Skills = ({ skills }: SkillsProps) => {
  const [expandedCategoryIndex, setExpandedCategoryIndex] = useState<number | null>(null);

  const toggleCategory = (index: number) => {
    setExpandedCategoryIndex(prevIndex => (prevIndex === index ? null : index));
  };

  const getSkillName = (skill: string | SkillItem): string => {
    return typeof skill === 'string' ? skill : skill.name;
  };

  const getSkillLogo = (skill: string | SkillItem): string | undefined => {
    return typeof skill === 'string' ? undefined : skill.logo;
  };

  const getIconForCategory = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'Programming Languages': 'M13 16.5L6.5 10 13 3.5L14.4 4.9L9.3 10l5.1 5.1L13 16.5z',
      'Frontend Development': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      'Backend Development': 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 12 12v-4a8 8 0 01-8-8z',
      'Database & Cloud': 'M3 17v4a2 2 0 002 2h14a2 2 0 002-2v-4M8 12l4 4 4-4M12 2v14',
      'Machine Learning & AI': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'Tools & Technologies': 'M12 15v3.5c0 .83-.67 1.5-1.5 1.5h-9c-.83 0-1.5-.67-1.5-1.5v-9c0-.83.67-1.5 1.5-1.5H6',
      'Design & Media': 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      'Business & Marketing': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'Theoretical Knowledge': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      'Soft Skills': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    };
    return iconMap[categoryName] || 'M13 16.5L6.5 10 13 3.5L14.4 4.9L9.3 10l5.1 5.1L13 16.5z';
  };

  // --- PREPARE COLUMNS FOR MASONRY LAYOUT ---
  const columns: { lg: SkillCategoryWithIndex[][]; md: SkillCategoryWithIndex[][] } = {
    lg: [[], [], []],
    md: [[], []],
  };

  skills.categories.forEach((category, index) => {
    columns.lg[index % 3].push({ ...category, originalIndex: index });
    columns.md[index % 2].push({ ...category, originalIndex: index });
  });


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          My <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Skills</span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto"></div>
      </div>

      {/* --- MASONRY LAYOUT FOR LARGE SCREENS --- */}
      <div className="hidden lg:flex flex-row gap-8">
        {columns.lg.map((column, colIndex) => (
          <div key={colIndex} className="w-1/3 flex flex-col gap-8">
            {column.map((category) => (
              <SkillCard
                key={category.originalIndex}
                category={category}
                index={category.originalIndex}
                isExpanded={expandedCategoryIndex === category.originalIndex}
                onToggle={toggleCategory}
                getIconForCategory={getIconForCategory}
                getSkillName={getSkillName}
                getSkillLogo={getSkillLogo}
              />
            ))}
          </div>
        ))}
      </div>

      {/* --- GRID LAYOUT FOR MEDIUM SCREENS --- */}
      <div className="hidden md:grid grid-cols-2 gap-8 lg:hidden">
        {skills.categories.map((category, index) => (
          <SkillCard
            key={index}
            category={category}
            index={index}
            isExpanded={expandedCategoryIndex === index}
            onToggle={toggleCategory}
            getIconForCategory={getIconForCategory}
            getSkillName={getSkillName}
            getSkillLogo={getSkillLogo}
          />
        ))}
      </div>
      
      {/* --- SINGLE COLUMN LAYOUT FOR SMALL SCREENS --- */}
      <div className="grid grid-cols-1 gap-8 md:hidden">
        {skills.categories.map((category, index) => (
          <SkillCard
            key={index}
            category={category}
            index={index}
            isExpanded={expandedCategoryIndex === index}
            onToggle={toggleCategory}
            getIconForCategory={getIconForCategory}
            getSkillName={getSkillName}
            getSkillLogo={getSkillLogo}
          />
        ))}
      </div>
    </div>
  );
};

export default Skills;