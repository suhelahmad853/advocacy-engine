import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Linkedin, Share2, CheckCircle, AlertCircle } from 'lucide-react';

const LinkedInShare = ({ content, onShareSuccess }) => {
  const { currentUser } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [shareStatus, setShareStatus] = useState(null);

  const shareToLinkedIn = async () => {
    if (!content) return;

    setIsSharing(true);
    setShareStatus(null);

    try {
      // Use the real LinkedIn sharing endpoint
      const response = await axios.post('/api/linkedin/share', {
        contentId: content._id || content.id,
        customMessage: customMessage.trim()
      }, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });

      setShareStatus({
        type: 'success',
        message: 'Content shared to LinkedIn successfully!',
        postId: response.data.postId,
        pointsEarned: response.data.pointsEarned
      });

      setCustomMessage('');
      if (onShareSuccess) {
        onShareSuccess(response.data);
      }
    } catch (error) {
      console.error('LinkedIn sharing error:', error);
      setShareStatus({
        type: 'error',
        message: error.response?.data?.details || error.response?.data?.error || 'Failed to share content'
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (!currentUser?.socialNetworks?.linkedin?.isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">LinkedIn Not Connected</span>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          Connect your LinkedIn account to share content directly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Linkedin className="w-5 h-5 text-blue-600" />
        <h4 className="font-medium text-gray-900">Share to LinkedIn</h4>
      </div>

      <div className="space-y-3">
        <textarea
          placeholder="Add your personal message (optional)"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows="3"
        />

        <button
          onClick={shareToLinkedIn}
          disabled={isSharing}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 w-full flex items-center justify-center gap-2"
        >
          {isSharing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sharing...
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Share to LinkedIn
            </>
          )}
        </button>
      </div>

      {shareStatus && (
        <div className={`mt-3 p-3 rounded-md ${
          shareStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {shareStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`text-sm ${
              shareStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {shareStatus.message}
            </span>
          </div>
          {shareStatus.pointsEarned && (
            <p className="text-sm text-green-700 mt-1">
              +{shareStatus.pointsEarned} points earned!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LinkedInShare; 