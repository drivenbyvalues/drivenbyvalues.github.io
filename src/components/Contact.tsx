import React, { useState } from 'react';

const Contact = () => {
  return (
    <section id="contact" className="py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">
            Contact Information
          </h2>
        </div>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed mb-6">
            I'm always interested in hearing about new opportunities and exciting projects. 
            Whether you have a question or just want to say hello, feel free to reach out.
          </p>
          
          <div className="space-y-2 text-gray-700">
            <p><strong>Email:</strong> your.email@example.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>LinkedIn:</strong> linkedin.com/in/yourprofile</p>
            <p><strong>GitHub:</strong> github.com/yourusername</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;