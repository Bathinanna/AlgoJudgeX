import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Trophy, Code, Star, Edit3, Save, X, LogIn, UserPlus, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SubmissionHeatmap from '@/components/SubmissionHeatmap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    skills: []
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication whenever component mounts or when isAuthenticated changes
    fetchUserProfile();
  }, []);

  // Separate effect to handle logout and redirect
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      // If user is not authenticated and not loading, redirect to auth
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const user = localStorage.getItem('user');
      
      if (!token || !userId || !user) {
        navigate('/auth');
      }
    }
  }, [isAuthenticated, loading, navigate]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const user = localStorage.getItem('user');
      
      // Check for all required authentication data
      if (!token || !userId || !user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Don't set authenticated until we verify with the server
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Only set authenticated if the request succeeds
      setIsAuthenticated(true);
      setUser(response.data);
      setEditForm({
        name: response.data.name || '',
        bio: response.data.bio || '',
        skills: response.data.skills || []
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Any error (401, 403, 500, etc.) should treat user as unauthenticated
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear ALL authentication-related localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');  // This is what Header checks for
    localStorage.removeItem('role');
    localStorage.removeItem('cfHandle');
    localStorage.removeItem('lcHandle');
    localStorage.removeItem('pendingVerificationUserId');
    localStorage.removeItem('pendingVerificationEmail');
    
    // Clear all state
    setIsAuthenticated(false);
    setUser(null);
    setError('');
    setSelectedFile(null);
    setUploading(false);
    setIsEditing(false);
    
    // Trigger global user status change event for Header
    window.dispatchEvent(new Event("userStatusChanged"));
    
    // Force immediate redirect
    navigate('/auth', { replace: true });
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile/${userId}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUser(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handlePictureUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile-picture/${userId}`,
        formData,
        {
          headers: {
            // Let the browser set the correct multipart boundary
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Upload response:', response.data);
      
      setUser((prevUser) => ({
        ...prevUser,
        profilePicture: response.data.profilePicture,
      }));
      setSelectedFile(null);
      
      console.log('Updated user state with profilePicture:', response.data.profilePicture);
      
      // Ensure we have the latest data from server (in case of other fields updated)
      fetchUserProfile();
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleSkillAdd = (skill) => {
    if (skill.trim() && !editForm.skills.includes(skill.trim())) {
      setEditForm({
        ...editForm,
        skills: [...editForm.skills, skill.trim()]
      });
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleRemovePicture = async () => {
    if (!user?.profilePicture?.url || removing) return;
    try {
      setRemoving(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile-picture/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({ ...prev, profilePicture: { public_id: '', url: '' } }));
      setSelectedFile(null);
    } catch (err) {
      console.error('Error removing profile picture:', err);
      setError('Failed to remove profile picture');
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#161A30] to-[#1a1f2e] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#00FFC6] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#161A30] to-[#1a1f2e] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm border border-gray-700/30 shadow-2xl">
            <CardContent className="pt-8 pb-6 px-6">
              <div className="text-center space-y-6">
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] rounded-full flex items-center justify-center">
                    <Lock className="w-8 h-8 text-black" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Profile Access Required</h2>
                  <p className="text-gray-400">
                    Please log in or create an account to view your profile and track your coding progress.
                  </p>
                </div>

                {/* Features List */}
                <div className="text-left space-y-3 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Trophy className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Track your problem-solving progress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Code className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-gray-300 text-sm">View submission history and analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Manage skills and platform handles</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/auth')}
                    className="w-full bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] text-black font-semibold hover:shadow-lg hover:shadow-[#00FFC6]/25 transition-all duration-300"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login to Your Account
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/auth')}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-300"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create New Account
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="pt-4 border-t border-gray-700/50">
                  <p className="text-xs text-gray-500">
                    Join <span className="text-[#00FFC6] font-semibold">AlgoJudgeX</span> to start your coding journey
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#161A30] to-[#1a1f2e] flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#161A30] to-[#1a1f2e] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] text-black font-semibold hover:shadow-lg hover:shadow-[#00FFC6]/25 transition-all duration-300"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                {/* Temporary logout button for testing */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-all duration-300"
                >
                  Logout 
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSaveProfile}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm border border-gray-700/30 shadow-2xl text-white">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] flex items-center justify-center border-2 border-[#00FFC6]/30 mb-4">
                    {user?.profilePicture?.url ? (
                      <img
                        src={user.profilePicture.url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', user.profilePicture.url);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => console.log('Image loaded successfully:', user.profilePicture.url)}
                      />
                    ) : (
                      <User size={32} className="text-black" />
                    )}
                  </div>
                  
                  {isEditing && (
                    <div className="w-full mb-4">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00FFC6] file:text-black hover:file:bg-[#4ecdc4]"
                      />
                      <Button
                        onClick={handlePictureUpload}
                        disabled={!selectedFile || uploading}
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                      >
                        {uploading ? 'Uploading...' : 'Upload Picture'}
                      </Button>
                      {user?.profilePicture?.url && (
                        <Button
                          type="button"
                          onClick={handleRemovePicture}
                          disabled={removing}
                          variant="outline"
                          className="w-full mt-2 border-red-600 text-red-400 hover:bg-red-600/10 hover:text-red-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {removing ? 'Removing...' : 'Remove Current Picture'}
                        </Button>
                      )}
                    </div>
                  )}

                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="text-xl font-bold bg-[#1a1b26]/80 border border-gray-600 rounded-lg px-3 py-2 text-center mb-2 focus:border-[#00FFC6] focus:outline-none transition-colors duration-300"
                      placeholder="Your name"
                    />
                  ) : (
                    <h3 className="text-xl font-bold mb-2">{user?.name || 'User'}</h3>
                  )}
                  
                  <div className="flex items-center text-gray-400 mb-4">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{user?.email}</span>
                  </div>

                  <div className="flex items-center text-gray-400 mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Joined {new Date(user?.accountCreated).toLocaleDateString()}</span>
                  </div>

                  {/* Bio */}
                  <div className="w-full mt-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Bio</h4>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        className="w-full bg-[#1a1b26]/80 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-[#00FFC6] focus:outline-none transition-colors duration-300"
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-400 text-sm">
                        {user?.bio || 'No bio available'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm border border-gray-700/30 shadow-xl text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Problems Solved</p>
                      <p className="text-2xl font-bold text-green-400">
                        {user?.totalQuestionsSolved || 0}
                      </p>
                    </div>
                    <Code className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm border border-gray-700/30 shadow-xl text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Current Streak</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {user?.streak || 0}
                      </p>
                    </div>
                    <Trophy className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm border border-gray-700/30 shadow-xl text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Max Rating</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {user?.maxRating || 0}
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills */}
            <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm border border-gray-700/30 shadow-xl text-white">
              <CardHeader>
                <CardTitle className="text-lg">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {editForm.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] text-black px-3 py-1 rounded-full text-sm flex items-center gap-2 font-medium"
                        >
                          {skill}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-red-600 transition-colors duration-200"
                            onClick={() => handleSkillRemove(skill)}
                          />
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add a skill (press Enter)"
                      className="w-full bg-[#1a1b26]/80 border border-gray-600 rounded-lg px-3 py-2 focus:border-[#00FFC6] focus:outline-none transition-colors duration-300"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSkillAdd(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user?.skills?.length > 0 ? (
                      user.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400">No skills added yet</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Platform Handles */}
            <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm border border-gray-700/30 shadow-xl text-white">
              <CardHeader>
                <CardTitle className="text-lg">Platform Handles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">CodeForces</p>
                    <p className="text-blue-400 font-medium">
                      {user?.handles?.codeforces || 'Not set'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">LeetCode</p>
                    <p className="text-green-400 font-medium">
                      {user?.handles?.leetcode || 'Not set'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">CodeChef</p>
                    <p className="text-orange-400 font-medium">
                      {user?.handles?.codechef || 'Not set'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">HackerRank</p>
                    <p className="text-purple-400 font-medium">
                      {user?.handles?.hackerrank || 'Not set'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Heatmap */}
            <SubmissionHeatmap userId={user?._id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
