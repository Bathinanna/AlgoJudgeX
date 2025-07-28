import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Settings, Shield, UserPlus, UserMinus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/all`
      );
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/toggle-admin/${userId}`
      );
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, isAdmin: !user.isAdmin, role: !user.isAdmin ? 'admin' : 'user' }
          : user
      ));
      
      alert(response.data.message);
    } catch (error) {
      console.error('Error toggling admin status:', error);
      alert('Failed to update user role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161A30] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161A30] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">User Management</h1>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <Card className="bg-[#1E1E2E] border-[#31304D]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                All Users ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="p-3 text-gray-400">Name</th>
                      <th className="p-3 text-gray-400">Username</th>
                      <th className="p-3 text-gray-400">Email</th>
                      <th className="p-3 text-gray-400">Role</th>
                      <th className="p-3 text-gray-400">Joined</th>
                      <th className="p-3 text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-800 hover:bg-gray-800/30"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-white font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-300">@{user.username}</td>
                        <td className="p-3 text-gray-300">{user.email}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.isAdmin
                                ? 'bg-red-900/30 text-red-400 border border-red-500/30'
                                : 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {user.role || (user.isAdmin ? 'admin' : 'user')}
                          </span>
                        </td>
                        <td className="p-3 text-gray-300">
                          {new Date(user.accountCreated || user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Button
                            onClick={() => toggleAdminStatus(user._id, user.isAdmin)}
                            size="sm"
                            variant={user.isAdmin ? "destructive" : "default"}
                            className="flex items-center gap-2"
                          >
                            {user.isAdmin ? (
                              <>
                                <UserMinus className="w-4 h-4" />
                                Remove Admin
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" />
                                Make Admin
                              </>
                            )}
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No users found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-[#1E1E2E] border-[#31304D]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1E1E2E] border-[#31304D]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-600/20 rounded-lg">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Admins</p>
                    <p className="text-2xl font-bold text-white">
                      {users.filter(user => user.isAdmin).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1E1E2E] border-[#31304D]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-600/20 rounded-lg">
                    <UserPlus className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Regular Users</p>
                    <p className="text-2xl font-bold text-white">
                      {users.filter(user => !user.isAdmin).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserManagement;
