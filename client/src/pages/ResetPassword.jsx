import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/reset-password/${token}`,
        { password }
      );
      toast.success('Password has been reset successfully! You can now log in.');
      setTimeout(() => navigate('/auth'), 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#161A30] to-[#1a1f2e] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/30 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] bg-clip-text text-transparent">
              Reset Password
            </h2>
            <p className="text-gray-400 mt-2">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password"
                     className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-10 py-2 text-white focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword"
                     className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-10 py-2 text-white focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] text-black font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-[#00FFC6]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/auth" className="text-sm text-gray-400 hover:text-[#00FFC6] transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
