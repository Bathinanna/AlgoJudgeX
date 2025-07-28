import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const OTPVerification = ({ userId, email, onVerified, onResendOTP }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    
    // Set up timer for OTP expiration
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const handleInputChange = (e, index) => {
    const value = e.target.value;
    
    if (value === '' || /^[0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input field
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError("Please enter a complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/verify-otp`,
        { userId, otp: otpValue }
      );
      
      toast.success("Email verified successfully!");
      onVerified(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify OTP. Please try again.");
      toast.error("OTP verification failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/resend-otp`,
        { userId }
      );
      
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      toast.success("A new OTP has been sent to your email");
      
      if (onResendOTP) onResendOTP();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
      toast.error("Failed to send a new OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-center">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-center space-x-3 my-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength="1"
            className="w-12 h-12 text-center bg-gray-900/50 border border-gray-700 rounded-lg text-white text-xl focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] transition-all"
            value={digit}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </div>

      <button
        onClick={handleVerifyOTP}
        disabled={loading || otp.join('').length !== 6}
        className="w-full bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] text-black font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-[#00FFC6]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
      
      <div className="text-center mt-4">
        {timer > 0 ? (
          <p className="text-sm text-gray-400">
            Resend OTP in <span className="text-[#00FFC6]">{timer}</span> seconds
          </p>
        ) : (
          <button
            onClick={handleResendOTP}
            disabled={loading}
            className="text-[#00FFC6] hover:underline text-sm"
          >
            Resend OTP
          </button>
        )}
      </div>
    </>
  );
};

export default OTPVerification;
