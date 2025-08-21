import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Linkedin, ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const LinkedInOAuth = ({ employeeId, onConnectionChange }) => {
  const { currentUser, refreshUserData } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [authUrl, setAuthUrl] = useState('');
  const [error, setError] = useState('');

  // Use employeeId prop or fallback to currentUser._id
  const actualEmployeeId = employeeId || currentUser?._id;

  useEffect(() => {
    // Check current connection status
    if (actualEmployeeId) {
      checkConnectionStatus();
    }
  }, [actualEmployeeId, currentUser]);

  const checkConnectionStatus = async () => {
    if (!actualEmployeeId) {
      console.error('No employee ID available for LinkedIn status check');
      return;
    }

    try {
      // First try to get status from currentUser (faster)
      if (currentUser?.socialNetworks?.linkedin?.isConnected) {
        setConnectionStatus(currentUser.socialNetworks.linkedin);
        return;
      }

      // Use the new /my-status endpoint for regular employees
      const response = await axios.get(`/api/linkedin/my-status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.linkedinStatus) {
        setConnectionStatus(response.data.linkedinStatus);
      }
    } catch (error) {
      console.error('Failed to check connection status:', error);
    }
  };

  const initiateOAuth = async () => {
    if (!actualEmployeeId) {
      setError('No employee ID available. Please refresh the page and try again.');
      return;
    }

    console.log('Initiating OAuth for employee ID:', actualEmployeeId);
    console.log('Current user:', currentUser);

    try {
      setIsConnecting(true);
      setError('');

      const response = await axios.get(`/api/linkedin/oauth/authorize/${actualEmployeeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setAuthUrl(response.data.authUrl);
      
      // Store state parameter for OAuth callback
      localStorage.setItem('linkedin_oauth_state', response.data.state);
      
      // Open LinkedIn OAuth in new window
      const authWindow = window.open(
        response.data.authUrl,
        'LinkedIn OAuth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Poll for OAuth completion
      const pollInterval = setInterval(async () => {
        if (authWindow.closed) {
          clearInterval(pollInterval);
          setIsConnecting(false);
          
          // Wait a moment for the backend to process the OAuth callback
          setTimeout(async () => {
            try {
              // Refresh user data to get updated LinkedIn status
              await refreshUserData();
              // Check connection status again
              await checkConnectionStatus();
              if (onConnectionChange) {
                onConnectionChange();
              }
            } catch (error) {
              console.error('Failed to refresh after OAuth completion:', error);
              // Still try to check connection status
              await checkConnectionStatus();
            }
          }, 2000);
        }
      }, 1000);

      // Add timeout for OAuth completion (5 minutes)
      setTimeout(() => {
        if (!authWindow.closed) {
          clearInterval(pollInterval);
          setIsConnecting(false);
          setError('OAuth connection timed out. Please try again.');
          authWindow.close();
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      setError(error.response?.data?.error || 'Failed to start LinkedIn connection');
      setIsConnecting(false);
    }
  };

  const disconnectLinkedIn = async () => {
    if (!actualEmployeeId) {
      setError('No employee ID available. Please refresh the page and try again.');
      return;
    }

    if (!window.confirm('Are you sure you want to disconnect your LinkedIn account?')) {
      return;
    }

    try {
      await axios.post(`/api/linkedin/disconnect/${actualEmployeeId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setConnectionStatus(null);
      // Refresh user data after disconnection
      await refreshUserData();
      if (onConnectionChange) {
        onConnectionChange();
      }
    } catch (error) {
      console.error('Failed to disconnect LinkedIn:', error);
      setError(error.response?.data?.error || 'Failed to disconnect LinkedIn');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTokenExpiry = (expiryDate) => {
    if (!expiryDate) return 'N/A';
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffMs = expiry - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
        <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mr-2" />
        <span className="text-blue-600">Connecting to LinkedIn...</span>
      </div>
    );
  }

  if (connectionStatus?.isConnected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">LinkedIn Connected</span>
          </div>
          <button
            onClick={checkConnectionStatus}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg space-y-2">
          <div className="flex items-center space-x-2">
            <Linkedin className="w-4 h-4 text-green-600" />
            <a 
              href={connectionStatus.profileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-700 hover:text-green-800 underline flex items-center space-x-1"
            >
              <span>View Profile</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Profile ID:</span>
              <span className="ml-2 font-mono text-xs">{connectionStatus.profileId}</span>
            </div>
            <div>
              <span className="text-gray-600">Last Sync:</span>
              <span className="ml-2">{formatDate(connectionStatus.lastSync)}</span>
            </div>
            <div>
              <span className="text-gray-600">Token Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                connectionStatus.tokenExpiry && new Date(connectionStatus.tokenExpiry) > new Date()
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {formatTokenExpiry(connectionStatus.tokenExpiry)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Permissions:</span>
              <span className="ml-2 text-xs">
                {connectionStatus.permissions?.length || 0} granted
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={disconnectLinkedIn}
          className="w-full btn-danger flex items-center justify-center space-x-2"
        >
          <XCircle className="w-4 h-4" />
          <span>Disconnect LinkedIn</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Debug Info - Remove in production */}
      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
        Debug: Employee ID: {actualEmployeeId || 'Not available'} | 
        Current User ID: {currentUser?._id || 'Not available'}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {!connectionStatus?.isConnected ? (
        <div className="text-center">
          <button
            onClick={initiateOAuth}
            disabled={isConnecting || !actualEmployeeId}
            className="btn-primary flex items-center justify-center space-x-2 w-full"
          >
            {isConnecting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Linkedin className="w-5 h-5" />
            )}
            <span>
              {isConnecting ? 'Connecting...' : 'Connect LinkedIn'}
            </span>
          </button>
          {!actualEmployeeId && (
            <p className="text-sm text-red-600 mt-2">
              Error: No employee ID available. Please refresh the page.
            </p>
          )}
        </div>
      ) : (
        <div className="text-xs text-gray-500 text-center">
          <p>This will open LinkedIn in a new window</p>
          <p>You'll be asked to authorize Social Catalyst</p>
        </div>
      )}
    </div>
  );
};

export default LinkedInOAuth; 