import React, { useState, useEffect } from "react";
import { Calendar, FileCode, Github, Search, Brain, Code, Trophy, Zap, Users, Target, ArrowRight, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeTree from "./CodeTree";
import VsCodeAnimation from "./VsCodeAnimation";
import FloatingCard from "./FloatingCard";
import VSCodeTypewriter from "./VSCodeTypewriter";
import UniqueFeatures from "./UniqueFeatures";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const HeroSection = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = !!user;
  
  const stats = [
    { number: "1K+", label: "Problems Available", icon: <Code className="w-6 h-6" /> },
    { number: "500+", label: "Active Users", icon: <Users className="w-6 h-6" /> },
    { number: "50+", label: "Monthly Contests", icon: <Trophy className="w-6 h-6" /> },
    { number: "24/7", label: "AI Support", icon: <Target className="w-6 h-6" /> }
  ];

  const codingPhrases = [
    "AI-Powered Code Analysis",
    "Real-time Contest Tracking", 
    "Smart Problem Solving",
    "Instant Code Feedback",
    "Advanced Progress Analytics"
  ];

  const techStack = ["Python", "JavaScript", "C++", "Java", "React", "Node.js"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const typeEffect = () => {
      const currentPhrase = codingPhrases[currentPhraseIndex];
      let charIndex = 0;
      
      const typing = setInterval(() => {
        if (charIndex <= currentPhrase.length) {
          setTypedText(currentPhrase.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typing);
          setTimeout(() => {
            const deleting = setInterval(() => {
              if (charIndex > 0) {
                setTypedText(currentPhrase.slice(0, charIndex - 1));
                charIndex--;
              } else {
                clearInterval(deleting);
                setCurrentPhraseIndex((prev) => (prev + 1) % codingPhrases.length);
              }
            }, 50);
          }, 2000);
        }
      }, 100);
    };

    typeEffect();
  }, [currentPhraseIndex]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0e1a] via-[#161A30] to-[#1a1f2e]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Code Snippets */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-[#00FFC6]/10 font-mono text-xs select-none"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0 
            }}
            animate={{ 
              y: [null, -100, -200],
              opacity: [0, 0.3, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity,
              delay: Math.random() * 5 
            }}
          >
            {`{code: ${Math.floor(Math.random() * 1000)}}`}
          </motion.div>
        ))}
        
        {/* Geometric Patterns */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-[#00FFC6]/5 to-[#1829ea]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-l from-[#ff6b6b]/5 to-[#4ecdc4]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Matrix-like Grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(#00FFC6 1px, transparent 1px),
              linear-gradient(90deg, #00FFC6 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Navigation Header */}
      <motion.header 
        className="relative z-50 py-6 px-6"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <Brain className="h-10 w-10 text-[#00FFC6]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff6b6b] rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] bg-clip-text text-transparent">
                AlgoJudgeX
              </h1>
              <p className="text-xs text-gray-400">AI-Powered Coding Platform</p>
            </div>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-6">
            {techStack.map((tech, index) => (
              <motion.span
                key={tech}
                className="text-sm text-gray-400 hover:text-[#00FFC6] transition-colors cursor-pointer"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, color: "#00FFC6" }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Main Hero Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          
          {/* Left Column - Hero Text */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Dynamic Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#00FFC6]/10 to-[#4ecdc4]/10 border border-[#00FFC6]/20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <Zap className="w-4 h-4 text-[#00FFC6]" />
              <span className="text-sm text-[#00FFC6] font-medium">AI-Powered • Real-time • Advanced</span>
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-4">
              <motion.h1 
                className="text-5xl md:text-7xl font-bold leading-tight"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <span className="text-white">Code.</span>
                <br />
                <span className="bg-gradient-to-r from-[#00FFC6] via-[#4ecdc4] to-[#1829ea] bg-clip-text text-transparent">
                  Compete.
                </span>
                <br />
                <span className="text-white">Conquer.</span>
              </motion.h1>
              
              {/* Animated Typing Effect */}
              <motion.div 
                className="text-xl md:text-2xl text-gray-300 h-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <span className="text-[#00FFC6]">&gt; </span>
                <span className="font-mono">{typedText}</span>
                <span className="animate-pulse text-[#00FFC6]">|</span>
              </motion.div>
            </div>

            {/* Description */}
            <motion.p 
              className="text-lg text-gray-400 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              Enhance your coding journey with our platform featuring AI assistance. 
              Practice coding problems, participate in contests, 
              and track your progress with detailed analytics.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              <Link to={isLoggedIn ? "/questions" : "/auth"} className="group">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] hover:from-[#4ecdc4] hover:to-[#00FFC6] text-black font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-[#00FFC6]/25 hover:shadow-[#00FFC6]/40 hover:scale-105"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  {isLoggedIn ? "Continue Coding" : "Start Coding Now"}
                </Button>
              </Link>
              
              {/* View Source button removed as requested */}
            </motion.div>

            {/* Live Stats */}
            <motion.div 
              className="pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <AnimatePresence mode="wait">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      className={`text-center p-4 rounded-lg transition-all duration-500 ${
                        currentStat === index 
                          ? 'bg-gradient-to-br from-[#00FFC6]/10 to-[#4ecdc4]/10 border border-[#00FFC6]/30 shadow-lg shadow-[#00FFC6]/20' 
                          : 'bg-gray-800/20 border border-gray-700/30'
                      }`}
                      animate={{ 
                        scale: currentStat === index ? 1.05 : 1,
                        opacity: currentStat === index ? 1 : 0.7 
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className={`mx-auto mb-2 ${currentStat === index ? 'text-[#00FFC6]' : 'text-gray-400'}`}>
                        {stat.icon}
                      </div>
                      <div className={`text-2xl font-bold ${currentStat === index ? 'text-[#00FFC6]' : 'text-white'}`}>
                        {stat.number}
                      </div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Interactive Demo */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {/* 3D Container */}
            <div className="relative transform-gpu perspective-1000">
              
              {/* Main Code Editor Mockup */}
              <motion.div 
                className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl shadow-[#00FFC6]/10 overflow-hidden"
                whileHover={{ rotateY: 5, rotateX: 5 }}
                transition={{ duration: 0.3 }}
              >
                {/* Editor Header */}
                <div className="flex items-center gap-2 p-4 bg-gray-800 border-b border-gray-700">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-sm text-gray-400 ml-4">AlgoJudgeX.ai - Solution.py</div>
                  <div className="ml-auto flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-gray-400">AI Analyzing...</span>
                  </div>
                </div>

                {/* Code Content */}
                <div className="p-6 font-mono text-sm">
                  <div className="space-y-2">
                    <div className="text-gray-500"># AI-Powered Solution Analysis</div>
                    <div className="text-blue-400">def <span className="text-yellow-400">solve_problem</span>():</div>
                    <div className="text-gray-300 ml-4">algorithm = <span className="text-green-400">"optimized"</span></div>
                    <div className="text-gray-300 ml-4">time_complexity = <span className="text-green-400">"O(n log n)"</span></div>
                    <div className="text-gray-300 ml-4">confidence = <span className="text-red-400">98.5</span>%</div>
                    <div className="text-blue-400 ml-4">return <span className="text-purple-400">success</span></div>
                    
                    {/* AI Hint Popup */}
                    <motion.div 
                      className="absolute right-4 top-24 bg-[#00FFC6] text-black p-3 rounded-lg shadow-lg max-w-48 text-xs"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 2.5 }}
                    >
                      <div className="font-semibold">🧠 AI Hint</div>
                      <div>Consider using binary search for optimization!</div>
                    </motion.div>
                  </div>
                </div>

                {/* Bottom Stats Bar */}
                <div className="bg-gray-900 p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-green-400">✓ Tests Passed: 15/15</span>
                    <span className="text-blue-400">⚡ Runtime: 0.32s</span>
                  </div>
                  <div className="text-[#00FFC6]">AI Score: 95/100</div>
                </div>
              </motion.div>

              {/* Floating Features */}
              <motion.div 
                className="absolute -top-6 -left-6 bg-gradient-to-r from-[#ff6b6b] to-[#feca57] p-4 rounded-xl shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Trophy className="w-6 h-6 text-white" />
                <div className="text-xs text-white font-semibold mt-1">Contest Ready</div>
              </motion.div>

              <motion.div 
                className="absolute -bottom-4 -right-4 bg-gradient-to-r from-[#4ecdc4] to-[#44a08d] p-4 rounded-xl shadow-lg"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
              >
                <Brain className="w-6 h-6 text-white" />
                <div className="text-xs text-white font-semibold mt-1">AI Powered</div>
              </motion.div>

              <motion.div 
                className="absolute top-1/2 -left-8 bg-gradient-to-r from-[#a8edea] to-[#fed6e3] p-3 rounded-full shadow-lg"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Code className="w-5 h-5 text-gray-800" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA Section */}
        <motion.div 
          className="text-center mt-24 space-y-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8 }}
        >
          <div className="inline-block">
            <h3 className="text-3xl font-bold text-white mb-2">
              Ready to <span className="text-[#00FFC6]">{isLoggedIn ? "continue" : "enhance"}</span> your coding journey?
            </h3>
            <div className="h-1 bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] rounded-full"></div>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {isLoggedIn 
              ? "Welcome back! Continue practicing problems, participating in contests, and improving your skills with AI assistance."
              : "Join our community of developers practicing coding problems, participating in contests, and improving their skills with AI assistance."
            }
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to={isLoggedIn ? "/questions" : "/auth"}>
              <Button size="lg" className="bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] hover:from-[#4ecdc4] hover:to-[#00FFC6] text-black font-semibold px-12 py-4 rounded-xl text-lg shadow-lg shadow-[#00FFC6]/30">
                {isLoggedIn ? "Go to Practice" : "Start Your Journey"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Unique Features Section */}
      <UniqueFeatures />
    </div>
  );
};

export default HeroSection;
