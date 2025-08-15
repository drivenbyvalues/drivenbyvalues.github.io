import React from 'react';
import { Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-20 pb-16 px-8 border-b border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-4 tracking-tight">
            Your Name
          </h1>
          <h2 className="text-xl text-gray-600 mb-8 font-light">
            Full Stack Developer
          </h2>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mb-8">
            <div className="flex items-center space-x-2">
              <Mail size={16} />
              <span>your.email@example.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={16} />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin size={16} />
              <span>San Francisco, CA</span>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <a
              href="#"
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <Github size={20} />
            </a>
            <a
              href="#"
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="#"
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed text-center">
            Passionate full-stack developer with 5+ years of experience crafting exceptional 
            digital experiences through innovative code and thoughtful design. Specialized in 
            modern web technologies with a keen eye for user experience and performance optimization.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;