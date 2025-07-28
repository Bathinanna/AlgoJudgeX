import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Trophy, Users, Play, Eye, Plus } from 'lucide-react';
import { FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ContestDashboard = () => {
  const [contests, setContests] = useState([]);
  const [userContests, setUserContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();
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
                Please log in to view contests, participate in competitions, and track your contest performance.
              </p>
            </div>

            {/* Action Button */}
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00FFC6]/25 transition-all duration-300"
            >
              <FaLock className="w-4 h-4" />
              Login to Join Contests
            </Link>

            {/* Additional Info */}
            <div className="pt-4 border-t border-gray-700/50">
              <p className="text-xs text-gray-500">
                Join <span className="text-[#00FFC6] font-semibold">AlgoJudgeX</span> to compete in coding contests
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchContests();
    fetchUserContests();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contests`);
      if (response.ok) {
        const data = await response.json();
        setContests(data);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    }
  };

  const fetchUserContests = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contests/user/${user._id}`);
      if (response.ok) {
        const data = await response.json();
        setUserContests(data);
      } else {
        console.error('Failed to fetch user contests');
      }
    } catch (error) {
      console.error('Error fetching user contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinContest = async (contestId) => {
    if (!user?._id) {
      toast.error('Please log in to join contests');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contests/${contestId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      });

      if (response.ok) {
        toast.success('Successfully joined the contest!');
        fetchContests();
        fetchUserContests();
      } else {
        toast.error('Failed to join contest');
      }
    } catch (error) {
      console.error('Error joining contest:', error);
      toast.error('Error joining contest');
    }
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);

    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'active';
    return 'ended';
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeRemaining = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;

    if (diff <= 0) return 'Contest ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const ContestCard = ({ contest, isUserContest = false }) => {
    const status = getContestStatus(contest);
    const isParticipant = contest.participants?.includes(user?._id);
    
    return (
      <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30 hover:border-[#00FFC6]/30 transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white text-xl mb-2">{contest.title}</CardTitle>
              <p className="text-gray-400 text-sm">{contest.description}</p>
            </div>
            <Badge 
              variant={status === 'active' ? 'default' : status === 'upcoming' ? 'secondary' : 'outline'}
              className={`${
                status === 'active' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : status === 'upcoming'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="h-4 w-4" />
              <span>Start: {formatDateTime(contest.startTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="h-4 w-4" />
              <span>End: {formatDateTime(contest.endTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="h-4 w-4" />
              <span>{contest.participants?.length || 0} participants</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Trophy className="h-4 w-4" />
              <span>{contest.problems?.length || 0} problems</span>
            </div>
          </div>

          {status === 'upcoming' && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm font-medium">
                Starts in: {getTimeRemaining(contest.startTime)}
              </p>
            </div>
          )}

          {status === 'active' && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm font-medium">
                Ends in: {getTimeRemaining(contest.endTime)}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {!isParticipant && status !== 'ended' && (
              <Button 
                onClick={() => joinContest(contest._id)}
                className="bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] text-black hover:shadow-lg hover:shadow-[#00FFC6]/25"
              >
                <Plus className="h-4 w-4 mr-2" />
                Join Contest
              </Button>
            )}
            
            {status === 'active' && isParticipant && (
              <Button 
                onClick={() => navigate(`/contest/${contest._id}`)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/25"
              >
                <Play className="h-4 w-4 mr-2" />
                Enter Contest
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => navigate(`/contest/${contest._id}/leaderboard`)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00FFC6]"></div>
      </div>
    );
  }

  const upcomingContests = contests.filter(c => getContestStatus(c) === 'upcoming');
  const activeContests = contests.filter(c => getContestStatus(c) === 'active');
  const endedContests = contests.filter(c => getContestStatus(c) === 'ended');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#161A30] to-[#1a1f2e] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] bg-clip-text text-transparent mb-2">
            Contest Dashboard
          </h1>
          <p className="text-gray-400">Participate in coding contests and compete with others</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Contests</CardTitle>
              <Play className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeContests.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Upcoming Contests</CardTitle>
              <Calendar className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{upcomingContests.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">My Contests</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{userContests.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Contest Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#1e1e2e]/80 border-gray-700/30">
            <TabsTrigger value="active" className="data-[state=active]:bg-[#00FFC6] data-[state=active]:text-black">
              Active ({activeContests.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-[#00FFC6] data-[state=active]:text-black">
              Upcoming ({upcomingContests.length})
            </TabsTrigger>
            <TabsTrigger value="ended" className="data-[state=active]:bg-[#00FFC6] data-[state=active]:text-black">
              Ended ({endedContests.length})
            </TabsTrigger>
            <TabsTrigger value="my-contests" className="data-[state=active]:bg-[#00FFC6] data-[state=active]:text-black">
              My Contests ({userContests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeContests.length === 0 ? (
              <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Play className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Active Contests</h3>
                  <p className="text-gray-400 text-center">There are no contests running at the moment. Check back later!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeContests.map(contest => (
                  <ContestCard key={contest._id} contest={contest} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingContests.length === 0 ? (
              <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Contests</h3>
                  <p className="text-gray-400 text-center">No contests scheduled. New contests will appear here soon!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingContests.map(contest => (
                  <ContestCard key={contest._id} contest={contest} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ended" className="space-y-6">
            {endedContests.length === 0 ? (
              <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Ended Contests</h3>
                  <p className="text-gray-400 text-center">Previous contests will appear here once they end.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {endedContests.map(contest => (
                  <ContestCard key={contest._id} contest={contest} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-contests" className="space-y-6">
            {userContests.length === 0 ? (
              <Card className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 border-gray-700/30">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Contests Joined</h3>
                  <p className="text-gray-400 text-center">Join some contests to see them here!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userContests.map(contest => (
                  <ContestCard key={contest._id} contest={contest} isUserContest />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContestDashboard;
