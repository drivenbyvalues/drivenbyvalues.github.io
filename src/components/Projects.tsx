import React from 'react';

const Projects = () => {
  const projects = [
    {
      title: 'E-Commerce Platform',
      description: 'A full-featured e-commerce platform built with React, Node.js, and PostgreSQL. Features include user authentication, payment processing, and admin dashboard.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      year: '2024'
    },
    {
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
      technologies: ['Next.js', 'MongoDB', 'Socket.io', 'Tailwind'],
      year: '2023'
    },
    {
      title: 'Weather Dashboard',
      description: 'A responsive weather dashboard that displays current weather conditions and forecasts with beautiful data visualizations and location-based services.',
      technologies: ['Vue.js', 'Chart.js', 'OpenWeather API', 'PWA'],
      year: '2023'
    }
  ];

  return (
    <section id="projects" className="py-16 px-8 border-b border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">
            Selected Projects
          </h2>
        </div>

        <div className="space-y-8">
          {projects.map((project, index) => (
            <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                <span className="text-sm text-gray-600">{project.year}</span>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">
                  {project.description}
                </p>
                
              <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="text-xs text-gray-600 bg-gray-100 px-2 py-1"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;