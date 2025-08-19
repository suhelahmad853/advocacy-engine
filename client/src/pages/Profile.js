import React from 'react';
import { User, Settings, Award, Share2, TrendingUp, Edit } from 'lucide-react';
import LinkedInConnect from '../components/LinkedInConnect';

const Profile = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your advocacy profile and preferences</p>
        </div>
        <button className="btn-secondary flex items-center space-x-2">
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">John Doe</h2>
            <p className="text-gray-600 mb-4">Senior Developer • Engineering Department</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">450</div>
                <div className="text-sm text-gray-500">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-gray-500">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">23</div>
                <div className="text-sm text-gray-500">Shares</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">1.2K</div>
                <div className="text-sm text-gray-500">Reach</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expertise & Skills */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expertise & Skills</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Skills</label>
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-primary">JavaScript</span>
              <span className="badge badge-primary">React</span>
              <span className="badge badge-primary">Node.js</span>
              <span className="badge badge-primary">MongoDB</span>
              <span className="badge badge-primary">AI/ML</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Interest</label>
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-success">Web Development</span>
              <span className="badge badge-success">Mobile Apps</span>
              <span className="badge badge-success">Cloud Computing</span>
              <span className="badge badge-success">Data Science</span>
            </div>
          </div>
        </div>
      </div>

      {/* LinkedIn Integration */}
      <LinkedInConnect />

      {/* Social Networks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Networks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">in</span>
              </div>
              <span className="font-medium">LinkedIn</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">500+ connections</p>
            <button className="btn-primary text-sm px-3 py-1">Connect</button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-400 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">🐦</span>
              </div>
              <span className="font-medium">Twitter</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">1.2K followers</p>
            <button className="btn-primary text-sm px-3 py-1">Connect</button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-800 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">f</span>
              </div>
              <span className="font-medium">Facebook</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Not connected</p>
            <button className="btn-secondary text-sm px-3 py-1">Connect</button>
          </div>
        </div>
      </div>

      {/* Content Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Categories</label>
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-primary">Tech</span>
              <span className="badge badge-primary">AI/ML</span>
              <span className="badge badge-primary">Web Development</span>
              <span className="badge badge-primary">Company News</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Posting Frequency</label>
            <select className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg">
              <option>Weekly</option>
              <option>Daily</option>
              <option>Monthly</option>
              <option>As needed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Consistency Champion</h4>
            <p className="text-sm text-gray-600">Weekly sharing streak</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Share2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Content Creator</h4>
            <p className="text-sm text-gray-600">25+ content shares</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Network Builder</h4>
            <p className="text-sm text-gray-600">500+ connections</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 