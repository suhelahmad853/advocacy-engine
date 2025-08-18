import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Share2, 
  Users, 
  Target, 
  Award, 
  BarChart3,
  ArrowUpRight,
  Calendar,
  Star
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalPoints: 0,
    level: 1,
    totalShares: 0,
    totalEngagements: 0,
    totalReach: 0,
    streak: 0
  });

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalPoints: currentUser?.advocacyProfile?.totalPoints || 0,
        level: currentUser?.advocacyProfile?.level || 1,
        totalShares: 12,
        totalEngagements: 156,
        totalReach: 2400,
        streak: 5
      });

      setRecommendations([
        {
          id: 1,
          title: "New AI Product Launch",
          category: "Product Launch",
          type: "company-news",
          aiScore: 95,
          description: "Exciting new AI features that will revolutionize our industry"
        },
        {
          id: 2,
          title: "Senior Developer Position Open",
          category: "Job Opening",
          type: "job-opening",
          aiScore: 88,
          description: "Join our growing engineering team"
        },
        {
          id: 3,
          title: "Industry Conference Speaking",
          category: "Thought Leadership",
          type: "thought-leadership",
          aiScore: 82,
          description: "Share your expertise at TechConf 2024"
        }
      ]);

      setLoading(false);
    }, 1000);
  }, [currentUser]);

  const StatCard = ({ title, value, icon: Icon, change, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <ArrowUpRight className={`w-4 h-4 text-${color}-500`} />
              <span className={`text-sm text-${color}-600 font-medium`}>{change}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const RecommendationCard = ({ recommendation }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`badge badge-${recommendation.type === 'job-opening' ? 'warning' : 'primary'}`}>
              {recommendation.category}
            </span>
            <span className="text-xs text-gray-500">{recommendation.type}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{recommendation.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{recommendation.description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{recommendation.aiScore}%</div>
          <div className="text-xs text-gray-500">AI Match</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Star className="w-4 h-4 text-yellow-400" />
          <span>Perfect for your network</span>
        </div>
        <button className="btn-primary text-sm px-4 py-2">
          Share Now
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {currentUser?.firstName}! 👋
            </h1>
            <p className="text-blue-100">
              Ready to amplify your brand advocacy? Here's what's happening today.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.totalPoints}</div>
            <div className="text-blue-100">Total Points</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Points"
          value={stats.totalPoints}
          icon={Award}
          change="+25 this week"
          color="blue"
        />
        <StatCard
          title="Current Level"
          value={stats.level}
          icon={TrendingUp}
          change="Next: 100 pts"
          color="green"
        />
        <StatCard
          title="Content Shared"
          value={stats.totalShares}
          icon={Share2}
          change="+3 this week"
          color="purple"
        />
        <StatCard
          title="Total Reach"
          value={stats.totalReach.toLocaleString()}
          icon={Users}
          change="+450 this week"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Share Content</h3>
              <p className="text-sm text-gray-500">Boost your advocacy score</p>
            </div>
          </div>
          <button className="w-full btn-success">Browse Content</button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Analytics</h3>
              <p className="text-sm text-gray-500">Track your performance</p>
            </div>
          </div>
          <button className="w-full btn-primary">See Stats</button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Set Goals</h3>
              <p className="text-sm text-gray-500">Plan your advocacy strategy</p>
            </div>
          </div>
          <button className="w-full btn-secondary">Create Goals</button>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">AI-Powered Recommendations</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Based on your expertise and network</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Share2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Shared "New AI Product Launch"</p>
              <p className="text-sm text-gray-500">2 hours ago • LinkedIn</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-600">+10 pts</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Reached 500+ people</p>
              <p className="text-sm text-gray-500">Yesterday • Viral content bonus</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-blue-600">+50 pts</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Achievement unlocked: Social Influencer</p>
              <p className="text-sm text-gray-500">3 days ago • 500+ engagements</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-purple-600">🏆</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 