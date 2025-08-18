import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Trophy, 
  User, 
  BarChart3, 
  Settings,
  Share2,
  TrendingUp
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/',
      description: 'Overview and insights'
    },
    {
      name: 'Content Library',
      icon: FileText,
      path: '/content',
      description: 'Browse and share content'
    },
    {
      name: 'Leaderboard',
      icon: Trophy,
      path: '/leaderboard',
      description: 'Competition and rankings'
    },
    {
      name: 'My Profile',
      icon: User,
      path: '/profile',
      description: 'Profile and settings'
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      description: 'Performance metrics'
    }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">SC</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Social Catalyst</h1>
            <p className="text-xs text-gray-500">Advocacy Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${
                active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
              }`} />
              <div className="flex-1">
                <span className="font-medium">{item.name}</span>
                <p className={`text-xs ${
                  active ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Share Content</span>
          </button>
          
          <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">View Stats</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Powered by AI Technology
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 