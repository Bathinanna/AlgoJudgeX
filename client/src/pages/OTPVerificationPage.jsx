import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import OTPVerification from '../components/OTPVerification';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const OTPVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Try to get from location.state, else from localStorage
    let userId, email;
    if (location.state && location.state.userId && location.state.email) {
      userId = location.state.userId;
      email = location.state.email;
    } else {
      userId = localStorage.getItem("pendingVerificationUserId");
      email = localStorage.getItem("pendingVerificationEmail");
    }
    if (!userId || !email) {
      toast.error('Missing verification information');
      navigate('/auth');
      return;
    }
    setUserId(userId);
    setEmail(email);
  }, [location, navigate]);

  const handleVerificationSuccess = (data) => {
    // After successful OTP verification
    const { token, _id, role } = data;
    // Clean up pending verification info
    localStorage.removeItem("pendingVerificationUserId");
    localStorage.removeItem("pendingVerificationEmail");
    localStorage.setItem("token", token);
    localStorage.setItem("userId", _id);
    localStorage.setItem("user", JSON.stringify(data));
    if (data.handles) {
      localStorage.setItem("cfHandle", data.handles.codeforces || "");
      localStorage.setItem("lcHandle", data.handles.leetcode || "");
    }
    localStorage.setItem("role", role);
    // Trigger header update
    window.dispatchEvent(new Event("userStatusChanged"));
    toast.success("Email verified successfully!");
    navigate(role === "admin" ? "/admin" : "/");
  };

  if (!userId || !email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#161A30] to-[#1a1f2e] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/30 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] bg-clip-text text-transparent">
              Verify Your Email
            </h2>
            <p className="text-gray-400 mt-2">
              We've sent a code to <span className="text-[#00FFC6]">{email}</span>
            </p>
          </div>
          
          <OTPVerification 
            userId={userId} 
            email={email}
            onVerified={handleVerificationSuccess}
            onResendOTP={() => toast.info("A new OTP has been sent to your email")}
          />

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

export default OTPVerificationPage;
