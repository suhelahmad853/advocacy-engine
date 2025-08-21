import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Building, Award, Linkedin, Edit, Save, X, Share2, TrendingUp } from 'lucide-react';
import LinkedInOAuth from '../components/LinkedInOAuth';

const Profile = () => {
  const { currentUser, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: currentUser?.firstName || 'John',
    lastName: currentUser?.lastName || 'Doe',
    role: currentUser?.role || 'Senior Developer',
    department: currentUser?.department || 'Engineering Department',
    email: currentUser?.email || 'john.doe@company.com',
    expertise: currentUser?.expertise || ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AI/ML'],
    interests: ['Web Development', 'Mobile Apps', 'Cloud Computing', 'Data Science']
  });

  // Refresh user data when component mounts
  useEffect(() => {
    refreshUserData();
  }, []);

  // Update profile state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfile({
        firstName: currentUser.firstName || 'John',
        lastName: currentUser.lastName || 'Doe',
        role: currentUser.role || 'Senior Developer',
        department: currentUser.department || 'Engineering Department',
        email: currentUser.email || 'john.doe@company.com',
        expertise: currentUser.expertise || ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AI/ML'],
        interests: ['Web Development', 'Mobile Apps', 'Cloud Computing', 'Data Science']
      });
    }
  }, [currentUser]);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    console.log('Profile saved:', profile);
  };

  const handleCancel = () => {
    setProfile({
      firstName: currentUser?.firstName || 'John',
      lastName: currentUser?.lastName || 'Doe',
      role: currentUser?.role || 'Senior Developer',
      department: currentUser?.department || 'Engineering Department',
      email: currentUser?.email || 'john.doe@company.com',
      expertise: currentUser?.expertise || ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AI/ML'],
      interests: ['Web Development', 'Mobile Apps', 'Cloud Computing', 'Data Science']
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your advocacy profile and preferences</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={handleSave}
              className="btn-success flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button 
              onClick={handleCancel}
              className="btn-danger flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    className="input-field"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    className="input-field"
                    placeholder="Last Name"
                  />
                </div>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({...profile, role: e.target.value})}
                  className="input-field"
                  placeholder="Role"
                />
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({...profile, department: e.target.value})}
                  className="input-field"
                  placeholder="Department"
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-600 mb-4">{profile.role} • {profile.department}</p>
              </>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentUser?.advocacyProfile?.totalPoints || 450}
                </div>
                <div className="text-sm text-gray-500">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentUser?.advocacyProfile?.level || 5}
                </div>
                <div className="text-sm text-gray-500">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {currentUser?.metrics?.totalShares || 23}
                </div>
                <div className="text-sm text-gray-500">Shares</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {currentUser?.metrics?.totalReach || '1.2K'}
                </div>
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
            {isEditing ? (
              <input
                type="text"
                value={profile.expertise.join(', ')}
                onChange={(e) => setProfile({...profile, expertise: e.target.value.split(', ').filter(s => s.trim())})}
                className="input-field"
                placeholder="Skills (comma separated)"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((skill, index) => (
                  <span key={index} className="badge badge-primary">{skill}</span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Interest</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.interests.join(', ')}
                onChange={(e) => setProfile({...profile, interests: e.target.value.split(', ').filter(s => s.trim())})}
                className="input-field"
                placeholder="Interests (comma separated)"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span key={index} className="badge badge-success">{interest}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LinkedIn Integration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">LinkedIn Integration</h3>
        
        {/* Debug Info - Remove in production */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Debug Info:</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>Current User ID: {currentUser?._id || 'NULL'}</div>
            <div>Current User Email: {currentUser?.email || 'NULL'}</div>
            <div>Current User Role: {currentUser?.role || 'NULL'}</div>
            <div>Token in localStorage: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
          </div>
        </div>
        
        <LinkedInOAuth 
          employeeId={currentUser?._id} 
          onConnectionChange={() => {
            // Refresh user data when LinkedIn connection changes
            refreshUserData();
          }}
        />
      </div>

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
            <p className="text-sm text-gray-600 mb-2">Coming soon</p>
            <button className="btn-secondary text-sm px-3 py-1" disabled>Connect</button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-800 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">f</span>
              </div>
              <span className="font-medium">Facebook</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Coming soon</p>
            <button className="btn-secondary text-sm px-3 py-1" disabled>Connect</button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2 p-4">
            <Share2 className="w-5 h-5" />
            <span>Share Content</span>
          </button>
          
          <button className="btn-success flex items-center justify-center space-x-2 p-4">
            <TrendingUp className="w-5 h-5" />
            <span>View Analytics</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2 p-4">
            <Award className="w-5 h-5" />
            <span>View Achievements</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 