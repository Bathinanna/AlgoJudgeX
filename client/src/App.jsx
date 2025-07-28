import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout.jsx";
import Contests from "./pages/Contests.jsx";
import Profile from "./pages/Profile.jsx";
import Practice from "./pages/Practice.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Dashboard from "./components/Dashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CodeEditor from "./pages/CodeEditor.jsx";
import QuestionsList from "./pages/QuestionsList.jsx";
import Index from "./pages/Index.jsx";
import Learn from "./pages/Learn.jsx";
import AIChatAgent from "./components/AIChatAgent.jsx"
import MyCalendar from "./components/MyCalendar.jsx";
import Lead from "./pages/Lead.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Progress from "./pages/Progress.jsx";
import ContestDashboard from "./pages/ContestDashboard.jsx";
import OTPVerificationPage from "./pages/OTPVerificationPage.jsx";



const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            {/* <Route path="cal" element={<MyCalendar/>} /> */}
            <Route path="contests" element={<Contests />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="practice" element={<Practice />} />
            <Route path="questions" element={<QuestionsList />} />
            <Route path="editor/:id" element={<CodeEditor />} />
            <Route path="leaderboard" element={<Lead />} />
            <Route path="learn" element={<Learn/>} />
            <Route path="ai" element={<AIChatAgent/>}/>
            <Route path="progress" element={<Progress />} />
            <Route path="contest-dashboard" element={<ContestDashboard />} />
          </Route>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
