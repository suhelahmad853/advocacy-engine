import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Linkedin, CheckCircle, XCircle, RefreshCw, ExternalLink, X } from 'lucide-react';
import LinkedInOAuth from '../../components/LinkedInOAuth';
import axios from 'axios';

const EmployeeManagement = () => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [linkedinStatus, setLinkedinStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showOAuthModal, setShowOAuthModal] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchEmployees();
      fetchLinkedInStatus();
    }
  }, [currentUser]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchLinkedInStatus = async () => {
    try {
      const response = await axios.get('/api/linkedin/status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const statusMap = {};
      response.data.linkedinStatus.forEach(status => {
        statusMap[status.employeeId] = status.linkedin;
      });
      setLinkedinStatus(statusMap);
    } catch (error) {
      console.error('Failed to fetch LinkedIn status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionChange = () => {
    fetchLinkedInStatus();
    fetchEmployees();
  };

  const openOAuthModal = (employee) => {
    setSelectedEmployee(employee);
    setShowOAuthModal(true);
  };

  const closeOAuthModal = () => {
    setShowOAuthModal(false);
    setSelectedEmployee(null);
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

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Admin access required to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mr-2" />
        <span>Loading employee data...</span>
      </div>
    );
  }

  const connectedCount = Object.values(linkedinStatus).filter(status => status?.isConnected).length;
  const totalEmployees = employees.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage employee LinkedIn connections and advocacy status</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{connectedCount}</div>
            <div className="text-sm text-gray-500">LinkedIn Connected</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-600">{totalEmployees}</div>
            <div className="text-sm text-gray-500">Total Employees</div>
          </div>
        </div>
      </div>

      {/* Connection Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">LinkedIn Connection Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{connectedCount}</div>
            <div className="text-sm text-gray-600">Connected</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{totalEmployees - connectedCount}</div>
            <div className="text-sm text-gray-600">Not Connected</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Linkedin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {totalEmployees > 0 ? Math.round((connectedCount / totalEmployees) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Connection Rate</div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Employee LinkedIn Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LinkedIn Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Sync
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => {
                const linkedin = linkedinStatus[employee._id];
                return (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.role}</div>
                      <div className="text-sm text-gray-500">{employee.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {linkedin?.isConnected ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">Not Connected</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(linkedin?.lastSync)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${
                        linkedin?.tokenExpiry && new Date(linkedin.tokenExpiry) > new Date()
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {formatTokenExpiry(linkedin?.tokenExpiry)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {linkedin?.isConnected ? (
                        <div className="flex space-x-2">
                          <a
                            href={linkedin.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View</span>
                          </a>
                        </div>
                      ) : (
                        <button
                          onClick={() => openOAuthModal(employee)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Connect
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* OAuth Modal */}
      {showOAuthModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Connect LinkedIn for {selectedEmployee.firstName} {selectedEmployee.lastName}
                </h3>
                <button
                  onClick={closeOAuthModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <LinkedInOAuth
                employeeId={selectedEmployee._id}
                onConnectionChange={() => {
                  handleConnectionChange();
                  closeOAuthModal();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement; 