
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy, Clock, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  level: string;
  totalPostureCorrections: number;
  averageAccuracy: number;
}

interface SessionData {
  date: string;
  duration: number;
  posesCompleted: number;
  averageAccuracy: number;
  tasksCompleted: number;
}

const UserProgress: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    weeklyGoal: 150,
    weeklyProgress: 0,
    level: 'beginner',
    totalPostureCorrections: 0,
    averageAccuracy: 0
  });
  const [recentSessions, setRecentSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In a real implementation, you would fetch this from your database
      // For now, we'll use localStorage to simulate user progress
      const savedStats = localStorage.getItem(`yoga_stats_${user.id}`);
      const savedSessions = localStorage.getItem(`yoga_sessions_${user.id}`);

      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      }

      if (savedSessions) {
        setRecentSessions(JSON.parse(savedSessions));
      }

      // Calculate real-time progress
      calculateWeeklyProgress();
    } catch (error) {
      console.error('Error loading user progress:', error);
      toast({
        title: "Error",
        description: "Failed to load your progress data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWeeklyProgress = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const savedSessions = localStorage.getItem(`yoga_sessions_${Math.random()}`);
    if (savedSessions) {
      const sessions: SessionData[] = JSON.parse(savedSessions);
      const thisWeekSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startOfWeek;
      });

      const weeklyMinutes = thisWeekSessions.reduce((total, session) => total + session.duration, 0);
      const weeklyProgress = Math.min((weeklyMinutes / userStats.weeklyGoal) * 100, 100);

      setUserStats(prev => ({ ...prev, weeklyProgress }));
    }
  };

  const recordSession = async (duration: number, posesCompleted: number, accuracy: number, tasksCompleted: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newSession: SessionData = {
        date: new Date().toISOString(),
        duration,
        posesCompleted,
        averageAccuracy: accuracy,
        tasksCompleted
      };

      // Update recent sessions
      const updatedSessions = [newSession, ...recentSessions.slice(0, 9)];
      setRecentSessions(updatedSessions);
      localStorage.setItem(`yoga_sessions_${user.id}`, JSON.stringify(updatedSessions));

      // Update user stats
      const updatedStats = {
        ...userStats,
        totalSessions: userStats.totalSessions + 1,
        totalMinutes: userStats.totalMinutes + duration,
        averageAccuracy: Math.round(((userStats.averageAccuracy * userStats.totalSessions) + accuracy) / (userStats.totalSessions + 1))
      };

      // Calculate streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const hasYesterdaySession = recentSessions.some(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.toDateString() === yesterday.toDateString();
      });

      if (hasYesterdaySession || userStats.currentStreak === 0) {
        updatedStats.currentStreak = userStats.currentStreak + 1;
      } else {
        updatedStats.currentStreak = 1;
      }

      setUserStats(updatedStats);
      localStorage.setItem(`yoga_stats_${user.id}`, JSON.stringify(updatedStats));

      // Recalculate weekly progress
      calculateWeeklyProgress();

      toast({
        title: "Session Recorded!",
        description: `Great job! You've completed ${duration} minutes of yoga practice.`,
      });
    } catch (error) {
      console.error('Error recording session:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{Math.round(userStats.weeklyProgress)}%</p>
            <p className="text-sm text-gray-600">Week Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{userStats.currentStreak}</p>
            <p className="text-sm text-gray-600">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{userStats.totalSessions}</p>
            <p className="text-sm text-gray-600">Total Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{userStats.totalMinutes}</p>
            <p className="text-sm text-gray-600">Minutes Practiced</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            This Week's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Weekly Goal: {userStats.weeklyGoal} minutes</span>
              <Badge variant={userStats.weeklyProgress >= 100 ? "default" : "secondary"}>
                {Math.round(userStats.weeklyProgress)}% Complete
              </Badge>
            </div>
            <Progress value={userStats.weeklyProgress} className="h-3" />
            <p className="text-sm text-gray-600">
              {userStats.weeklyProgress >= 100 
                ? "🎉 Congratulations! You've reached your weekly goal!" 
                : `Keep going! You need ${Math.max(0, userStats.weeklyGoal - Math.round(userStats.weeklyProgress * userStats.weeklyGoal / 100))} more minutes this week.`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{userStats.averageAccuracy}%</p>
              <p className="text-sm text-blue-700">Average Posture Accuracy</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600 capitalize">{userStats.level}</p>
              <p className="text-sm text-green-700">Current Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.slice(0, 5).map((session, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{new Date(session.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">
                      {session.duration} min • {session.posesCompleted} poses • {session.tasksCompleted} tasks
                    </p>
                  </div>
                  <Badge variant={session.averageAccuracy >= 80 ? "default" : "secondary"}>
                    {session.averageAccuracy}% accuracy
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserProgress;
