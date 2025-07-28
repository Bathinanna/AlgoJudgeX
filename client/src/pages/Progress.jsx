import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  Code,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';
import { FaLock } from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const Progress = () => {
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  // Check if user is logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#161A30] to-[#1a1f2e] text-white flex items-center justify-center p-6">
        <div className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/30 p-8 max-w-md mx-auto">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <FaLock className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Access Restricted</h3>
              <p className="text-gray-400">
                Please log in to view your progress dashboard and track your coding journey.
              </p>
            </div>

            {/* Action Button */}
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00FFC6]/25 transition-all duration-300"
            >
              <FaLock className="w-4 h-4" />
              Login to View Progress
            </Link>

            {/* Additional Info */}
            <div className="pt-4 border-t border-gray-700/50">
              <p className="text-xs text-gray-500">
                Join <span className="text-[#00FFC6] font-semibold">AlgoJudgeX</span> to track your coding progress
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchProgressData();
    fetchSubmissions();
  }, []);

  const fetchProgressData = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProgress(data);
      } else {
        console.error('Failed to fetch progress data');
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchSubmissions = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submissions/user/${user._id}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        console.error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStats = () => {
    const total = submissions.length;
    const solved = submissions.filter(s => s.status === 'Success').length;
    const failed = submissions.filter(s => s.status === 'Failed').length;
    
    const languageStats = {};
    submissions.forEach(s => {
      languageStats[s.language] = (languageStats[s.language] || 0) + 1;
    });

    const dailyStats = {};
    submissions.forEach(s => {
      const date = new Date(s.createdAt).toDateString();
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    return {
      total,
      solved,
      failed,
      successRate: total > 0 ? ((solved / total) * 100).toFixed(1) : 0,
      languageStats,
      dailyStats
    };
  };

  const stats = getSubmissionStats();

  const pieData = [
    { name: 'Solved', value: stats.solved, color: '#22c55e' },
    { name: 'Failed', value: stats.failed, color: '#ef4444' }
  ];

  const languageData = Object.entries(stats.languageStats).map(([lang, count]) => ({
    language: lang,
    count
  }));

  const dailyData = Object.entries(stats.dailyStats)
    .slice(-7)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(),
      submissions: count
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00FFC6]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#161A30] to-[#1a1f2e] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] bg-clip-text text-transparent mb-2">
            Your Progress Dashboard
          </h1>
          <p className="text-gray-400">Track your coding journey and achievements</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Submissions</CardTitle>
              <Code className="h-4 w-4 text-[#00FFC6]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <p className="text-xs text-gray-400">
                All time submissions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Problems Solved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.solved}</div>
              <p className="text-xs text-gray-400">
                Successfully completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.successRate}%</div>
              <p className="text-xs text-gray-400">
                Problem success rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Current Streak</CardTitle>
              <Award className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-gray-400">
                Days solving problems
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#1e1e2e]/80 border-gray-700/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#00FFC6] data-[state=active]:text-black">
              Overview
            </TabsTrigger>
            <TabsTrigger value="submissions" className="data-[state=active]:bg-[#00FFC6] data-[state=active]:text-black">
              Submissions
            </TabsTrigger>
            <TabsTrigger value="languages" className="data-[state=active]:bg-[#00FFC6] data-[state=active]:text-black">
              Languages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Success Rate Chart */}
              <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Submission Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {pieData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-sm text-gray-300">{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Activity */}
              <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Daily Activity (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="submissions" 
                        stroke="#00FFC6" 
                        strokeWidth={2}
                        dot={{ fill: '#00FFC6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
              <CardHeader>
                <CardTitle className="text-white">Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.slice(0, 10).map((submission, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#0f1419]/50 rounded-lg border border-gray-700/30">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${submission.status === 'Success' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <div>
                          <p className="text-white font-medium">{submission.questionTitle}</p>
                          <p className="text-gray-400 text-sm">{submission.language}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={submission.status === 'Success' ? 'default' : 'destructive'}>
                          {submission.status}
                        </Badge>
                        <p className="text-gray-400 text-sm mt-1">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="languages" className="space-y-6">
            <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
              <CardHeader>
                <CardTitle className="text-white">Language Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={languageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="language" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#00FFC6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Progress;
