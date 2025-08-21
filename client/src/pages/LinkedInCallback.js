import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const LinkedInCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing LinkedIn authorization...');
  const [error, setError] = useState('');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const success = searchParams.get('success');
      const profileId = searchParams.get('profileId');
      const message = searchParams.get('message');

      // Check for OAuth errors from backend redirect
      if (error || errorDescription) {
        setStatus('error');
        setError(message || errorDescription || error);
        setMessage('LinkedIn authorization failed');
        
        // Redirect to profile after 3 seconds
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
        return;
      }

      // Check for success from backend redirect
      if (success && profileId) {
        setStatus('success');
        setMessage('LinkedIn connected successfully!');
        
        // Clear OAuth data from localStorage
        localStorage.removeItem('linkedin_oauth_employee_id');
        localStorage.removeItem('linkedin_oauth_state');
        
        // Redirect to profile after 3 seconds
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
        return;
      }

      // Handle traditional OAuth flow (if needed)
      if (code && state) {
        // Get state parameter from localStorage (set during OAuth initiation)
        const storedState = localStorage.getItem('linkedin_oauth_state');
        if (!storedState) {
          setStatus('error');
          setError('State parameter not found');
          setMessage('LinkedIn authorization failed');
          return;
        }

        // Call the new backend OAuth callback route
        try {
          const response = await axios.get(`/auth/linkedin/callback?code=${code}&state=${state}`);
          
          if (response.data.success) {
            setStatus('success');
            setMessage('LinkedIn connected successfully!');
            
            // Clear OAuth data from localStorage
            localStorage.removeItem('linkedin_oauth_state');
            localStorage.removeItem('linkedin_oauth_employee_id');
            
            // Redirect after 3 seconds
            setTimeout(() => {
              navigate('/profile');
            }, 3000);
          } else {
            throw new Error('Failed to complete LinkedIn connection');
          }
        } catch (error) {
          console.error('Backend OAuth callback error:', error);
          
          if (error.response?.data?.error) {
            setStatus('error');
            setError(error.response.data.message || error.response.data.error);
            setMessage('LinkedIn authorization failed');
          } else {
            throw error; // Re-throw to be handled by outer catch
          }
        }
      } else {
        setStatus('error');
        setError('Invalid OAuth callback parameters');
        setMessage('LinkedIn authorization failed');
      }

    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setError(error.response?.data?.details || error.message);
      setMessage('LinkedIn authorization failed');
    }
  };

  const renderStatus = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center">
            <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to your profile...</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authorization Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <button
              onClick={() => navigate('/profile')}
              className="btn-primary"
            >
              Go to Profile
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {renderStatus()}
      </div>
    </div>
  );
};

export default LinkedInCallback; 