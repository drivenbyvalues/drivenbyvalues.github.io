import React, { useState, useEffect } from 'react';
import { Menu, X, Download, FileText } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#about', label: 'About' },
    { href: '#skills', label: 'Skills' },
    { href: '#experience', label: 'Experience' },
    { href: '#projects', label: 'Projects' },
    { href: '#contact', label: 'Contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200' : 'bg-transparent'
    }`}>
      <div className="max-w-4xl mx-auto px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-gray-700" />
            <span className="text-xl font-light text-gray-800">Resume</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button className="hidden md:flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 text-sm transition-all duration-200">
              <Download size={16} />
              <span>Resume</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border border-gray-200 mt-2 p-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-left text-sm"
                >
                  {item.label}
                </button>
              ))}
              <button className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 mt-4 w-full justify-center text-sm">
                <Download size={16} />
                <span>Resume</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;