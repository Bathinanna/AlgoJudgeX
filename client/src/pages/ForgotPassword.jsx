import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/forgot-password`,
        { email }
      );
      toast.success(data.message);
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
              Forgot Password
            </h2>
            <p className="text-gray-400 mt-2">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 py-2 text-white focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] text-black font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-[#00FFC6]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
