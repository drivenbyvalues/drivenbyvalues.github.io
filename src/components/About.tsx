import React from 'react';

const About = () => {
  return (
    <section id="about" className="py-16 px-8 border-b border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">
            Professional Summary
          </h2>
        </div>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Experienced full-stack developer with a proven track record of delivering high-quality 
            web applications that serve thousands of users. My expertise spans modern frontend 
            frameworks, robust backend architectures, and cloud infrastructure management.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            I specialize in React, Node.js, and TypeScript, with extensive experience in database 
            design, API development, and DevOps practices. My approach combines technical excellence 
            with user-centered design principles to create solutions that are both powerful and intuitive.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Throughout my career, I've led cross-functional teams, mentored junior developers, and 
            consistently delivered projects on time and within budget. I'm passionate about clean code, 
            performance optimization, and staying current with emerging technologies.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;