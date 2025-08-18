import React from 'react';
import { Trophy, Medal, TrendingUp, Users, Award } from 'lucide-react';

const Leaderboard = () => {
  const leaderboardData = [
    { rank: 1, name: "Sarah Johnson", role: "Marketing", points: 1250, level: 13, shares: 45, department: "Marketing" },
    { rank: 2, name: "Mike Chen", role: "Developer", points: 1180, level: 12, shares: 38, department: "Engineering" },
    { rank: 3, name: "Emily Davis", role: "Designer", points: 1120, level: 12, shares: 42, department: "Design" },
    { rank: 4, name: "Alex Rodriguez", role: "Sales", points: 980, level: 10, shares: 35, department: "Sales" },
    { rank: 5, name: "Lisa Wang", role: "Developer", points: 920, level: 10, shares: 31, department: "Engineering" }
  ];

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-500" />;
    return <span className="text-lg font-bold text-gray-400">{rank}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Leaderboard</h1>
        <p className="text-gray-600">Compete with your colleagues and climb the ranks!</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {leaderboardData.slice(0, 3).map((person, index) => (
          <div key={person.rank} className={`text-center p-6 rounded-lg ${
            index === 0 ? 'bg-gradient-to-b from-yellow-100 to-yellow-200 border-2 border-yellow-300' :
            index === 1 ? 'bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-300' :
            'bg-gradient-to-b from-orange-100 to-orange-200 border-2 border-orange-300'
          }`}>
            <div className="text-6xl mb-2">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{person.name}</h3>
            <p className="text-gray-600 mb-2">{person.role} • {person.department}</p>
            <div className="text-2xl font-bold text-gray-900 mb-1">{person.points} pts</div>
            <div className="text-sm text-gray-500">Level {person.level}</div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Complete Rankings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboardData.map((person) => (
                <tr key={person.rank} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(person.rank)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{person.name}</div>
                        <div className="text-sm text-gray-500">{person.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{person.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{person.points}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{person.level}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{person.shares}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Social Influencer</h3>
            <p className="text-sm text-gray-600">Sarah Johnson</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Viral Creator</h3>
            <p className="text-sm text-gray-600">Mike Chen</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Network Builder</h3>
            <p className="text-sm text-gray-600">Emily Davis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 