import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Linkedin, CheckCircle, XCircle } from 'lucide-react';

const LinkedInConnect = () => {
  const { currentUser, refreshUserData } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [connectionStatus, setConnectionStatus] = useState({});

  useEffect(() => {
    checkLinkedInStatus();
  }, []);

  const checkLinkedInStatus = async () => {
    try {
      const response = await axios.get('/api/linkedin/status');
      setIsConnected(response.data.isConnected);
      setConnectionStatus(response.data);
    } catch (error) {
      console.error('Failed to check LinkedIn status:', error);
    }
  };

  const connectLinkedIn = async () => {
    if (!accessToken.trim()) {
      alert('Please enter your LinkedIn access token');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('/api/linkedin/connect', { accessToken });
      setIsConnected(true);
      setAccessToken('');
      
      // Refresh user data to update LinkedIn connection status
      await refreshUserData();
      
      checkLinkedInStatus();
      alert('LinkedIn connected successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to connect LinkedIn');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectLinkedIn = async () => {
    if (!window.confirm('Are you sure you want to disconnect LinkedIn?')) return;

    setIsLoading(true);
    try {
      await axios.post('/api/linkedin/disconnect');
      setIsConnected(false);
      setConnectionStatus({});
      
      // Refresh user data to update LinkedIn connection status
      await refreshUserData();
      
      alert('LinkedIn disconnected successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to disconnect LinkedIn');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <Linkedin className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">LinkedIn Integration</h3>
      </div>

      {isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">LinkedIn Connected</span>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Profile ID:</strong> {connectionStatus.profileId}</p>
            <p><strong>Profile URL:</strong> {connectionStatus.profileUrl}</p>
          </div>

          <button
            onClick={disconnectLinkedIn}
            disabled={isLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect LinkedIn'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600">
            <XCircle className="w-5 h-5" />
            <span>LinkedIn Not Connected</span>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter LinkedIn Access Token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <button
              onClick={connectLinkedIn}
              disabled={isLoading || !accessToken.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 w-full"
            >
              {isLoading ? 'Connecting...' : 'Connect LinkedIn'}
            </button>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p><strong>How to get your LinkedIn Access Token:</strong></p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Go to LinkedIn Developer Portal</li>
              <li>Create a new app</li>
              <li>Request necessary permissions</li>
              <li>Generate access token</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkedInConnect; 