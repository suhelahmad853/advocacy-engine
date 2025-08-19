import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Share2, Filter, Search, TrendingUp, Calendar, Users } from 'lucide-react';
import LinkedInShare from '../components/LinkedInShare';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Content = () => {
  const { refreshUserData } = useAuth();
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);
  
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/content');
      // The API returns { content: [...], pagination: {...} }
      if (response.data && Array.isArray(response.data.content)) {
        setContentItems(response.data.content);
      } else {
        console.warn('API returned unexpected data structure:', response.data);
        setContentItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
      // Fallback to mock data if API fails
      setContentItems([
        {
          _id: 'mock-1',
          title: "New AI Product Launch",
          category: "tech",
          type: "product-launch",
          description: "Exciting new AI features that will revolutionize our industry",
          aiScore: 95,
          performance: { totalReach: 2400, totalEngagements: 156 },
          tags: ["AI", "Innovation", "Product"],
          sharingData: { isApproved: true },
          status: "published"
        },
        {
          _id: 'mock-2',
          title: "Senior Developer Position Open",
          category: "hr",
          type: "job-opening",
          description: "Join our growing engineering team",
          aiScore: 88,
          performance: { totalReach: 1200, totalEngagements: 89 },
          tags: ["Hiring", "Engineering", "Career"],
          sharingData: { isApproved: true },
          status: "published"
        },
        {
          _id: 'mock-3',
          title: "Industry Conference Speaking",
          category: "business",
          type: "thought-leadership",
          description: "Share your expertise at TechConf 2024",
          aiScore: 82,
          performance: { totalReach: 3100, totalEngagements: 234 },
          tags: ["Conference", "Speaking", "Leadership"],
          sharingData: { isApproved: true },
          status: "published"
        }
      ]);
    } finally {
      setLoading(false);
        }
  }, []);
  
  // Load content and refresh user data only once when component mounts
  useEffect(() => {
    fetchContent();
    // Refresh user data to get latest LinkedIn status
    const refreshData = async () => {
      try {
        await refreshUserData();
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    };
    refreshData();
  }, []); // Empty dependency array - run only once
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
          <p className="text-gray-600">Browse and share company content to boost your advocacy</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Share2 className="w-4 h-4" />
          <span>Share Content</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Categories</option>
              <option>Product Launch</option>
              <option>Job Opening</option>
              <option>Thought Leadership</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Types</option>
              <option>Company News</option>
              <option>Job Opening</option>
              <option>Blog Post</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      ) : !Array.isArray(contentItems) || contentItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No content available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {contentItems.map((item) => (
          <div key={item._id || item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`badge badge-${item.type === 'job-opening' ? 'warning' : 'primary'}`}>
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500">{item.type}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{item.aiScore || 0}%</div>
                <div className="text-xs text-gray-500">AI Match</div>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>Reach</span>
                </div>
                <span className="font-medium">{(item.performance?.totalReach || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-gray-500">
                  <TrendingUp className="w-4 h-4" />
                  <span>Engagement</span>
                </div>
                <span className="font-medium">{item.performance?.totalEngagements || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <button className="btn-primary text-sm px-4 py-2">
                Share Now
              </button>
            </div>
            
            {/* LinkedIn Share Section */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <LinkedInShare 
                content={item} 
                onShareSuccess={(data) => console.log('Content shared successfully:', data)}
              />
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default Content; 