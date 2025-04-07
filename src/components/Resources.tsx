import React from 'react';
import InterviewPrep from './InterviewPrep';

const Resources: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
        <p className="mt-2 text-gray-600">Prepare for your career with our comprehensive resources</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Interview Preparation Section */}
        <section>
          <InterviewPrep />
        </section>

        {/* Additional Resource Sections */}
        <section className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Learning Materials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Resource Cards */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Technical Documentation</h3>
              <p className="text-gray-600 mb-4">Access comprehensive technical documentation and guides.</p>
              <a href="#" className="text-blue-600 hover:text-blue-800">Browse Documentation →</a>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Video Tutorials</h3>
              <p className="text-gray-600 mb-4">Watch video tutorials on various technical topics.</p>
              <a href="#" className="text-blue-600 hover:text-blue-800">View Tutorials →</a>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Practice Projects</h3>
              <p className="text-gray-600 mb-4">Work on real-world projects to build your portfolio.</p>
              <a href="#" className="text-blue-600 hover:text-blue-800">Start Projects →</a>
            </div>
          </div>
        </section>

        {/* Career Resources Section */}
        <section className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Career Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Resume Templates</h3>
              <p className="text-gray-600 mb-4">Download professional resume templates tailored for tech roles.</p>
              <a href="#" className="text-blue-600 hover:text-blue-800">Download Templates →</a>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Interview Tips</h3>
              <p className="text-gray-600 mb-4">Get expert tips and advice for technical interviews.</p>
              <a href="#" className="text-blue-600 hover:text-blue-800">Read Tips →</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Resources;