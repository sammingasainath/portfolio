interface ProfileData {
  name: string;
  headline: string;
  tagline: string;
  profilePicture?: string;
  summary: string;
  contact: {
    phone: string;
    email: string;
    location: string;
  };
  social: {
    linkedin: string;
    github: string;
    portfolio: string;
  };
  education: Array<{
    degree?: string;
    institution?: string;
    gpa?: string;
    percentage?: string;
    duration?: string;
    year?: string;
    status?: string;
    achievement?: string;
  }>;
}

interface AboutProps {
  profile: ProfileData;
}

const About = ({ profile }: AboutProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          About <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Me</span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* About Text */}
        <div className="space-y-6">
          {Array.isArray(profile.summary) ? (
            profile.summary.map((paragraph, index) => (
              <p
                key={index}
                className="text-lg text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<span class="text-white font-semibold">$1</span>')
                }}
              />
            ))
          ) : (
            <p className="text-lg text-gray-300 leading-relaxed">
              {profile.summary}
            </p>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-gray-300">
                <span className="text-purple-400 font-semibold">Location:</span> {profile.contact.location}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-gray-300">
                <span className="text-purple-400 font-semibold">Email:</span> {profile.contact.email}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-gray-300">
                <span className="text-purple-400 font-semibold">Phone:</span> {profile.contact.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <svg className="w-6 h-6 text-purple-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
            </svg>
            Education
          </h3>
          
          <div className="space-y-6">
            {profile.education.map((edu, index) => (
              <div key={index} className="border-l-2 border-purple-400 pl-4">
                <h4 className="text-lg font-semibold text-white">
                  {edu.degree || edu.achievement}
                </h4>
                {edu.institution && (
                  <p className="text-purple-300 text-sm mb-1">{edu.institution}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  {edu.gpa && <span>CPI: {edu.gpa}</span>}
                  {edu.percentage && <span>Percentage: {edu.percentage}</span>}
                  {edu.duration && <span>{edu.duration}</span>}
                  {edu.year && <span>{edu.year}</span>}
                  {edu.status && <span className="text-green-400">{edu.status}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 