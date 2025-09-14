'use client';

interface ProfileData {
  name: string;
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
}

interface ContactProps {
  profile: ProfileData;
}

const Contact = ({ profile }: ContactProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          Get In <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Touch</span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mb-6"></div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Have a project in mind or want to discuss opportunities? I&apos;d love to hear from you!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">Email</p>
                  <a 
                    href={`mailto:${profile.contact.email}`}
                    className="text-purple-400 hover:text-purple-300 transition-all duration-200 cursor-pointer hover:scale-105 transform hover:underline"
                  >
                    {profile.contact.email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">Location</p>
                  <p className="text-gray-300">{profile.contact.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">Phone</p>
                  <a 
                    href={`tel:${profile.contact.phone}`}
                    className="text-purple-400 hover:text-purple-300 transition-all duration-200 cursor-pointer hover:scale-105 transform hover:underline"
                  >
                    {profile.contact.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <h4 className="text-white font-semibold mb-4">Connect with me</h4>
              <div className="flex space-x-4">
                <a
                  href={profile.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 cursor-pointer hover:scale-110 transform hover:shadow-lg hover:shadow-blue-600/50"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href={profile.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-800 transition-all duration-200 cursor-pointer hover:scale-110 transform hover:shadow-lg hover:shadow-gray-700/50"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a
                  href={profile.social.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-all duration-200 cursor-pointer hover:scale-110 transform hover:shadow-lg hover:shadow-purple-600/50"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* --- REPLACED FORM WITH WHATSAPP BUTTON --- */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center h-full">
            <h3 className="text-2xl font-bold text-white mb-4">Let&apos;s Connect!</h3>
            <p className="text-gray-300 mb-8 max-w-sm">
              The quickest way to reach me is via WhatsApp. Click the button below to start a chat instantly.
            </p>
            <a
              href={`https://wa.me/${profile.contact.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.457l-6.354 1.687zM8.118 6.982c.197-.459.395-.465.592-.472.196-.007.426.002.624.002.243 0 .617.033.935.438.318.403.963 1.562 1.093 1.683.13.122.217.2.316.318.1.118.043.216-.043.347-.085.13-.27.232-.416.347-.145.115-.29.165-.436.165-.145 0-.317-.043-.464-.13-.146-.087-1.036-.51-1.97-1.21-.712-.534-1.188-1.196-1.233-1.314-.045-.118-.328-.437-.328-.747s.328-.464.427-.564c.1-.1.217-.13.316-.13z" />
              </svg>
              Message me on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 