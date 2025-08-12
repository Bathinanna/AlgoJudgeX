import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    cfHandle: "",
    lcHandle: "",
    role: "user",
  });
  // State is no longer needed for OTP verification as we're using a separate page
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const url = isLogin
      ? `${import.meta.env.VITE_BACKEND_URL}/api/users/login`
      : `${import.meta.env.VITE_BACKEND_URL}/api/users/register`;

    const payload = isLogin
      ? {
          email: formData.email,
          password: formData.password,
        }
      : {
          name: formData.username,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
          handles: {
            codeforces: formData.cfHandle,
            leetcode: formData.lcHandle,
          },
        };

    try {
      const res = await axios.post(url, payload);
      
      // Handle registration that requires OTP verification
      if (!isLogin && res.data._id) {
        // Store for OTP page in case of refresh
        localStorage.setItem("pendingVerificationUserId", res.data._id);
        localStorage.setItem("pendingVerificationEmail", formData.email);
        navigate('/verify-otp', {
          state: { userId: res.data._id, email: formData.email }
        });
        toast.info("Please verify your email with the OTP sent");
        return;
      }
      
      // Handle login that requires verification
      if (isLogin && res.data.requiresVerification) {
        // Store for OTP page in case of refresh
        localStorage.setItem("pendingVerificationUserId", res.data.userId);
        localStorage.setItem("pendingVerificationEmail", formData.email);
        navigate('/verify-otp', {
          state: { userId: res.data.userId, email: formData.email }
        });
        toast.info("Please verify your email before logging in");
        return;
      }
      
      // Normal login flow
  const { token, _id, name, email, role, themePreference } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", _id);
      localStorage.setItem("user", JSON.stringify(res.data));
      
      if (res.data.handles) {
        localStorage.setItem("cfHandle", res.data.handles.codeforces || "");
        localStorage.setItem("lcHandle", res.data.handles.leetcode || "");
      }
      
      localStorage.setItem("role", role);
      if (themePreference) {
        localStorage.setItem("theme", themePreference);
        document.documentElement.classList.toggle('dark', themePreference === 'dark');
      }

      // ✅ Trigger header update
      window.dispatchEvent(new Event("userStatusChanged"));

      toast.success("User Logged in Successfully!");

      navigate(role === "admin" ? "/admin" : "/");
    } catch (err) {
      // If backend says verification required, handle OTP flow
      const data = err.response?.data;
      if (isLogin && data?.requiresVerification && data?.userId) {
        localStorage.setItem("pendingVerificationUserId", data.userId);
        localStorage.setItem("pendingVerificationEmail", formData.email);
        navigate('/verify-otp', {
          state: { userId: data.userId, email: formData.email }
        });
        toast.info("Please verify your email before logging in");
        return;
      }
      toast.error("Authentication failed. Please try again!");
      setError(data?.message || "Something went wrong");
    }
  };
  
  // No longer need handleVerificationSuccess as it's handled in the OTPVerificationPage

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#31304D] to-[#161A30] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-[#1E1E2E] text-[#F0ECE5] rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            {isLogin ? "Login" : "Register"}
          </h2>

          {error && (
            <p className="text-red-400 text-center text-sm mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <Input
                  name="username"
                  placeholder="Username"
                  className="bg-[#31304D] text-[#F0ECE5] focus:ring-2 focus:ring-[#00C8A9] transition-all"
                  value={formData.username}
                  onChange={handleChange}
                />
                <Input
                  name="cfHandle"
                  placeholder="Codeforces Handle"
                  className="bg-[#31304D] text-[#F0ECE5] focus:ring-2 focus:ring-[#00C8A9] transition-all"
                  value={formData.cfHandle}
                  onChange={handleChange}
                />
                <Input
                  name="lcHandle"
                  placeholder="Leetcode Handle"
                  className="bg-[#31304D] text-[#F0ECE5] focus:ring-2 focus:ring-[#00C8A9] transition-all"
                  value={formData.lcHandle}
                  onChange={handleChange}
                />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="bg-[#31304D] text-[#F0ECE5] focus:ring-2 focus:ring-[#00C8A9] p-3 w-full rounded transition-all"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </>
            )}
            <Input
              name="email"
              placeholder="Email"
              type="email"
              className="bg-[#31304D] text-[#F0ECE5] focus:ring-2 focus:ring-[#00C8A9] transition-all"
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              name="password"
              placeholder="Password"
              type="password"
              className="bg-[#31304D] text-[#F0ECE5] focus:ring-2 focus:ring-[#00C8A9] transition-all"
              value={formData.password}
              onChange={handleChange}
            />
            {!isLogin && (
            <Input
              name="confirmPassword"
              placeholder="Confirm password"
              type="password"
              className="bg-[#31304D] text-[#F0ECE5] focus:ring-2 focus:ring-[#00C8A9] transition-all"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            )}
            <Button
              type="submit"
              className="w-full bg-[#00C8A9] text-[#161A30] hover:bg-[#F0ECE5] hover:text-[#161A30] transition-all p-3 rounded-full cursor-pointer"
            >
              {isLogin ? "Login" : "Register"}
            </Button>
          </form>

          {isLogin && (
            <div className="text-center mt-4">
              <Link 
                to="/forgot-password" 
                className="text-[#00C8A9] hover:underline text-sm"
              >
                Forgot your password?
              </Link>
            </div>
          )}

          <p className="text-center text-sm text-[#B6BBC4] mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={toggleMode}
              className="text-[#00C8A9] hover:underline cursor-pointer"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
