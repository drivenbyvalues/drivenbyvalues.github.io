import React from 'react';

const Experience = () => {
  const experiences = [
    {
      title: 'Senior Full Stack Developer',
      company: 'Tech Innovation Inc.',
      location: 'San Francisco, CA',
      period: '2022 - Present',
      description: 'Lead development of scalable web applications serving 100K+ users. Architected microservices infrastructure and mentored junior developers.',
      achievements: [
        'Reduced application load time by 40%',
        'Led team of 5 developers',
        'Implemented CI/CD pipeline'
      ]
    },
    {
      title: 'Full Stack Developer',
      company: 'Digital Solutions Co.',
      location: 'Austin, TX',
      period: '2020 - 2022',
      description: 'Developed responsive web applications using React and Node.js. Collaborated with design team to implement pixel-perfect interfaces.',
      achievements: [
        'Built 15+ production applications',
        'Increased user engagement by 60%',
        'Optimized database queries'
      ]
    },
    {
      title: 'Frontend Developer',
      company: 'Creative Agency',
      location: 'Remote',
      period: '2019 - 2020',
      description: 'Created engaging user interfaces for client websites. Specialized in modern frontend technologies and responsive design.',
      achievements: [
        'Delivered 20+ client projects',
        'Improved mobile performance',
        'Implemented design systems'
      ]
    }
  ];

  return (
    <section id="experience" className="py-16 px-8 border-b border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">
            Professional Experience
          </h2>
        </div>

        <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{exp.title}</h3>
                    <h4 className="text-base text-gray-700">{exp.company}</h4>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>{exp.period}</div>
                    <div>{exp.location}</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                    {exp.description}
                  </p>
                  
                <ul className="space-y-1">
                      {exp.achievements.map((achievement, achIndex) => (
                        <li key={achIndex} className="flex items-start gap-3 text-gray-700 text-sm">
                          <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;