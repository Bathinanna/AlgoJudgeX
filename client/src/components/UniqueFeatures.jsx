import React from 'react';
import { motion } from 'framer-motion';
import { Code, Brain, Trophy, Users, Zap, Target } from 'lucide-react';

const UniqueFeatures = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Code Analysis",
      description: "Get helpful feedback and suggestions to improve your coding solutions",
      color: "#00FFC6",
      gradient: "from-[#00FFC6] to-[#4ecdc4]"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Practice Contests",
      description: "Join coding competitions and track your performance on leaderboards",
      color: "#ff6b6b",
      gradient: "from-[#ff6b6b] to-[#feca57]"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Problem Practice",
      description: "Access a collection of coding problems to sharpen your skills",
      color: "#4ecdc4",
      gradient: "from-[#4ecdc4] to-[#44a08d]"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Learning",
      description: "Connect with other developers and learn together",
      color: "#a8edea",
      gradient: "from-[#a8edea] to-[#fed6e3]"
    }
  ];

  return (
    <div className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why <span className="bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] bg-clip-text text-transparent">AlgoJudgeX</span> Stands Out
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience coding education with our blend of AI assistance and competitive programming practice
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
            >
              <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-gray-600/50 group-hover:shadow-2xl overflow-hidden">
                
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon */}
                <motion.div 
                  className="relative mb-6"
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                      border: `1px solid ${feature.color}30`
                    }}
                  >
                    <div style={{ color: feature.color }}>
                      {feature.icon}
                    </div>
                  </div>
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#00FFC6] transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Hover Effect Line */}
                <motion.div 
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div 
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {[
            { number: "AI-Powered", label: "Code Analysis" },
            { number: "Real-time", label: "Contest Updates" },
            { number: "Instant", label: "Feedback System" },
            { number: "24/7", label: "Platform Availability" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="relative"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <div className="text-3xl font-bold text-[#00FFC6] mb-2">{stat.number}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00FFC6]/5 to-[#4ecdc4]/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default UniqueFeatures;
