import React from 'react';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900/50 border-t border-slate-700/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center space-y-8">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Portfolio
          </div>
          
          <div className="flex space-x-6">
            <a
              href="#"
              className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-all duration-200 hover:scale-110 border border-slate-700 hover:border-blue-500"
            >
              <Github size={20} />
            </a>
            <a
              href="#"
              className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-all duration-200 hover:scale-110 border border-slate-700 hover:border-blue-500"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="#"
              className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-all duration-200 hover:scale-110 border border-slate-700 hover:border-blue-500"
            >
              <Mail size={20} />
            </a>
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-slate-400">
              © 2025 Your Name. All rights reserved.
            </p>
            <p className="text-slate-500 flex items-center justify-center space-x-1">
              <span>Made with</span>
              <Heart size={16} className="text-red-400 animate-pulse" />
              <span>and lots of coffee</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;