# Samminga Sainath Rao - Professional Portfolio

A modern, responsive portfolio website built with Next.js and Tailwind CSS, following a headless CMS approach for easy content management.

## 🌟 Features

- **Headless CMS Architecture**: Content stored in JSON files for easy updates
- **Modern Design**: Glassmorphism effects with purple/pink gradient theme
- **Responsive**: Optimized for all device sizes
- **Interactive**: Smooth scrolling navigation, project modals, and animations
- **Easy Deployment**: Optimized for Vercel deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to view the portfolio.

## 📁 Project Structure

```
portfolio/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page component
├── components/
│   ├── Navigation.tsx      # Sticky navigation
│   ├── Hero.tsx           # Landing section
│   ├── About.tsx          # About me section
│   ├── Skills.tsx         # Skills showcase
│   ├── Experience.tsx     # Work experience timeline
│   ├── Projects.tsx       # Projects gallery
│   ├── Achievements.tsx   # Awards and recognition
│   └── Contact.tsx        # Contact form
├── public/
│   ├── data/             # Content JSON files
│   │   ├── profile.json
│   │   ├── skills.json
│   │   ├── experience.json
│   │   ├── projects.json
│   │   └── achievements.json
│   └── media/            # Images and videos
└── README.md
```

## 🛠️ Content Management

### The "Easy Update" Workflow

This portfolio uses a headless CMS approach - all content is stored in JSON files. To add or update content:

1. **Edit the JSON files** in `public/data/`
2. **Add media files** to `public/media/`
3. **Commit and push** changes to trigger automatic deployment

### Content Files

#### `profile.json`
Contains personal information, contact details, and education.

```json
{
  "name": "Your Name",
  "headline": "Your Professional Title",
  "tagline": "Your compelling tagline",
  "summary": "Your professional summary...",
  "contact": { ... },
  "social": { ... },
  "education": [ ... ]
}
```

#### `skills.json`
Categorized list of technical and soft skills.

```json
{
  "categories": [
    {
      "name": "Programming Languages",
      "skills": ["JavaScript", "Python", "Java"]
    }
  ]
}
```

#### `experience.json`
Work history with responsibilities and achievements.

```json
{
  "experiences": [
    {
      "company": "Company Name",
      "position": "Your Position",
      "duration": "Start - End",
      "responsibilities": [...],
      "technologies": [...]
    }
  ]
}
```

#### `projects.json`
Project portfolio with media support.

```json
{
  "projects": [
    {
      "title": "Project Name",
      "description": "Project description...",
      "technologies": [...],
      "demoUrl": "https://demo-link.com",
      "sourceCodeUrl": "https://github.com/...",
      "featured": true,
      "media": [
        {
          "type": "image",
          "src": "/media/project-image.png",
          "alt": "Description"
        }
      ]
    }
  ]
}
```

#### `achievements.json`
Awards, leadership roles, and volunteering activities.

```json
{
  "achievements": [...],
  "leadership": [...],
  "volunteering": [...]
}
```

### Adding New Projects

1. **Add project media** to `public/media/`
2. **Update `projects.json`** with new project entry
3. **Set `featured: true`** for projects you want highlighted
4. **Include awards** if the project won any recognition

### Adding Media

- **Images**: `.png`, `.jpg`, `.webp` formats
- **Videos**: `.mp4`, `.webm` formats
- **Path**: Always use `/media/filename.ext` format

## 🎨 Customization

### Color Theme
The portfolio uses a purple/pink gradient theme. To customize:

1. **Edit Tailwind classes** in components
2. **Update gradient colors** in `tailwind.config.js`
3. **Modify CSS variables** in `globals.css`

### Adding New Sections
1. **Create component** in `components/`
2. **Add data structure** to appropriate JSON file
3. **Import and use** in `app/page.tsx`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect GitHub repository** to Vercel
2. **Configure build settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. **Deploy automatically** on every push

### Manual Deployment

```bash
# Build the project
npm run build

# Start production server
npm start
```

## 📱 Features by Section

### Navigation
- Sticky header with smooth scrolling
- Mobile-responsive hamburger menu
- Active section highlighting

### Hero Section
- Animated typing effect for tagline
- Call-to-action buttons
- Social media links
- Gradient profile placeholder

### About Section
- Professional summary
- Education timeline
- Contact information
- Responsive layout

### Skills Section
- Categorized skill display
- Interactive hover effects
- Icon mapping for categories
- Responsive grid layout

### Experience Section
- Timeline layout
- Detailed job descriptions
- Technology tags
- Current position highlighting

### Projects Section
- Filterable project gallery
- Featured projects section
- Project detail modals
- Award recognition badges
- Live demo and source code links

### Achievements Section
- Major achievements highlighting
- Award and recognition display
- Leadership roles
- Volunteering activities

### Contact Section
- Contact form with validation
- Social media integration
- Responsive layout
- Email integration

## 🔧 Technical Features

- **Server-Side Rendering**: Fast initial page loads
- **Static Generation**: Optimized for performance
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Responsive Design**: Mobile-first approach
- **SEO Optimized**: Meta tags and structured data

## 📊 Analytics and SEO

- Add Google Analytics ID to `next.config.js`
- Customize meta tags in `layout.tsx`
- Update OpenGraph images
- Add structured data for better SEO

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For questions or support:
- Email: sammingasainathrao@gmail.com
- LinkedIn: [linkedin.com/in/samminga](https://www.linkedin.com/in/samminga)
- GitHub: [github.com/sammingasainath](https://github.com/sammingasainath)

---

**Built with ❤️ using Next.js and Tailwind CSS** 