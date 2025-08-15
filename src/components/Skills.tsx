import React from 'react';

const Skills = () => {
  const skillCategories = [
    {
      title: 'Frontend',
      skills: [
        'React', 'TypeScript', 'Next.js', 'Vue.js', 'Tailwind CSS', 'SASS/SCSS'
      ]
    },
    {
      title: 'Backend',
      skills: [
        'Node.js', 'Python', 'Express.js', 'PostgreSQL', 'MongoDB', 'Redis'
      ]
    },
    {
      title: 'Tools & DevOps',
      skills: [
        'Git', 'Docker', 'AWS', 'CI/CD', 'Jest', 'Figma'
      ]
    }
  ];

  return (
    <section id="skills" className="py-16 px-8 border-b border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">
            Technical Skills
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {skillCategories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="space-y-4"
            >
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                {category.title}
              </h3>
              <div className="space-y-2">
                {category.skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="inline-block text-sm text-gray-700 mr-3 mb-2"
                  >
                    {skill}
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

export default Skills;