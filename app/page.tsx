import { promises as fs } from 'fs';
import path from 'path';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Achievements from '@/components/Achievements';
import Publications from '@/components/Publications';
import OpenSource from '@/components/OpenSource';
import Contact from '@/components/Contact';
import Navigation from '@/components/Navigation';

async function getData() {
  const dataDir = path.join(process.cwd(), 'public/data');
  
  const [profileData, skillsData, experienceData, projectsData, achievementsData, publicationsData, opensourceData] = await Promise.all([
    fs.readFile(path.join(dataDir, 'profile.json'), 'utf8'),
    fs.readFile(path.join(dataDir, 'skills.json'), 'utf8'),
    fs.readFile(path.join(dataDir, 'experience.json'), 'utf8'),
    fs.readFile(path.join(dataDir, 'projects.json'), 'utf8'),
    fs.readFile(path.join(dataDir, 'achievements.json'), 'utf8'),
    fs.readFile(path.join(dataDir, 'publications.json'), 'utf8'),
    fs.readFile(path.join(dataDir, 'opensource.json'), 'utf8'),
  ]);

  return {
    profile: JSON.parse(profileData),
    skills: JSON.parse(skillsData),
    experience: JSON.parse(experienceData),
    projects: JSON.parse(projectsData),
    achievements: JSON.parse(achievementsData),
    publications: JSON.parse(publicationsData),
    opensource: JSON.parse(opensourceData),
  };
}

export default async function Home() {
  const data = await getData();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <section id="hero" className="min-h-screen">
        <Hero profile={data.profile} />
      </section>
      
      <section id="about" className="py-20">
        <About profile={data.profile} />
      </section>
      
      <section id="skills" className="py-20">
        <Skills skills={data.skills} />
      </section>
      
      <section id="experience" className="py-20">
        <Experience experience={data.experience} />
      </section>
      
      <section id="projects" className="py-20">
        <Projects projects={data.projects} />
      </section>
      
      <section id="publications" className="py-20">
        <Publications publications={data.publications.publications} patents={data.publications.patents} />
      </section>
      
      <section id="opensource" className="py-20">
        <OpenSource contributions={data.opensource.contributions} />
      </section>
      
      <section id="achievements" className="py-20">
        <Achievements />
      </section>
      
      <section id="contact" className="py-20">
        <Contact profile={data.profile} />
      </section>
      
      <footer className="bg-slate-900 text-white py-8 text-center">
        <p>&copy; 2024 {data.profile.name}. All rights reserved.</p>
        <p className="text-sm text-slate-400 mt-2">Built with Next.js & Tailwind CSS</p>
      </footer>
    </main>
  );
} 