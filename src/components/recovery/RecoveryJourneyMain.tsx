import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-provider';
import { useRecovery } from '@/hooks/use-recovery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Heart, Volume2, VolumeX, Calendar, Target, Sparkles, MessageCircle, RefreshCw, Settings } from 'lucide-react';
import { ProgramSetup } from './ProgramSetup';
import { DailyTaskView } from './DailyTaskView';
import { SymptomChecker } from './SymptomChecker';
import { RecoveryJourneySettings } from './RecoveryJourneySettings';
import { voiceAssistant } from '@/utils/voiceAssistant';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const RecoveryJourneyMain = () => {
  const { user } = useAuth();
  const { userProgress, loading, getTodayCompletionStats, refreshData } = useRecovery(user?.id);
  const [activeView, setActiveView] = useState<'overview' | 'tasks' | 'symptoms'>('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [aiMotivation, setAiMotivation] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Refresh data when user changes or when returning to overview
  useEffect(() => {
    if (user?.id && !loading) {
      refreshData();
    }
  }, [user?.id]);

  // Get AI motivation on load
  useEffect(() => {
    if (userProgress && activeView === 'overview') {
      getAIMotivation();
    }
  }, [userProgress, activeView]);

  const getAIMotivation = async () => {
    if (!userProgress) return;
    
    setLoadingAI(true);
    try {
      const response = await fetch('/api/recovery-ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          surgeryType: userProgress.program_id,
          currentDay: userProgress.current_day,
          messageType: 'daily_motivation',
          message: 'Generate daily motivation'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiMotivation(data.response);
        
        // Speak the motivation if voice is enabled
        if (voiceEnabled && voiceAssistant.isSupported()) {
          setTimeout(() => {
            voiceAssistant.speak(data.response);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('AI motivation error:', error);
      setAiMotivation("Every day brings you closer to full recovery. Keep going strong! 💪");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      toast({
        title: "Data refreshed",
        description: "Your recovery data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const toggleVoice = () => {
    const newState = voiceAssistant.toggle();
    setVoiceEnabled(newState);
    
    toast({
      title: newState ? "Voice assistance enabled" : "Voice assistance disabled",
      description: newState ? "AI will speak motivational messages" : "Voice guidance turned off",
    });
  };

  const getDaysRemaining = () => {
    if (!userProgress) return 0;
    return Math.max(0, 30 - userProgress.current_day + 1);
  };

  const getSurgeryTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      'heart': 'Heart Surgery',
      'knee': 'Knee Surgery', 
      'cesarean': 'Cesarean Section',
      'others': 'General Surgery'
    };
    return types[type] || type;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 pt-20 bg-gradient-to-br from-blue-50/30 to-purple-50/30">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading your recovery journey...</p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="mt-4"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </div>
    );
  }

  // Show setup if no user progress exists
  if (!userProgress) {
    return <ProgramSetup />;
  }

  const stats = getTodayCompletionStats();

  return (
    <div className="pt-20 pb-8 px-4 min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header with Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3 flex-wrap">
              🛏️ Recovery Journey
              <Badge variant="outline" className="text-lg px-3 py-1 bg-blue-100 text-blue-700 border-blue-300">
                Day {userProgress.current_day}
              </Badge>
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Your AI-guided path to healing and wellness</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoice}
              className={cn(
                "flex items-center gap-2 transition-all",
                voiceEnabled ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-gray-50"
              )}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              Voice {voiceEnabled ? 'On' : 'Off'}
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Recovery Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 mb-1">
                Day {userProgress.current_day}
              </div>
              <p className="text-sm text-blue-600 mb-3">
                {getDaysRemaining()} days remaining
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(userProgress.current_day / 30) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 mb-2">
                {stats.percentage}%
              </div>
              <Progress value={stats.percentage} className="h-3 mb-2" />
              <p className="text-sm text-green-600">
                {stats.completed} of {stats.total} tasks completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-600" />
                Recovery Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-purple-700 mb-2">
                {getSurgeryTypeDisplay(userProgress.program_id)}
              </div>
              <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                30-Day AI Program
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* AI Motivational Message */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="h-6 w-6 text-amber-600" />
                <h3 className="text-xl font-semibold text-amber-800">
                  AI Daily Motivation
                </h3>
                <MessageCircle className="h-5 w-5 text-amber-600" />
              </div>
              
              {loadingAI ? (
                <div className="flex items-center justify-center gap-2 py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent"></div>
                  <span className="text-amber-700">Generating personalized motivation...</span>
                </div>
              ) : (
                <p className="text-amber-700 italic text-lg leading-relaxed max-w-3xl mx-auto">
                  {aiMotivation || "Every step forward, no matter how small, is progress worth celebrating. Your dedication to recovery is inspiring!"}
                </p>
              )}
              
              <Button 
                onClick={getAIMotivation}
                variant="outline"
                size="sm"
                className="mt-4 border-amber-300 text-amber-700 hover:bg-amber-100"
                disabled={loadingAI}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Get New Motivation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={() => setActiveView('tasks')}
            className={cn(
              "flex-1 sm:flex-none transition-all duration-300",
              activeView === 'tasks' 
                ? "bg-blue-600 hover:bg-blue-700 shadow-lg scale-105" 
                : "bg-blue-600 hover:bg-blue-700"
            )}
            size="lg"
          >
            📋 Today's Tasks
          </Button>
          
          <Button 
            onClick={() => setActiveView('symptoms')}
            variant="outline"
            className={cn(
              "flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50 transition-all duration-300",
              activeView === 'symptoms' && "shadow-lg scale-105 bg-red-50"
            )}
            size="lg"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Symptom Checker
          </Button>
          
          <Button 
            onClick={() => setActiveView('overview')}
            variant="outline"
            className={cn(
              "flex-1 sm:flex-none transition-all duration-300",
              activeView === 'overview' && "shadow-lg scale-105 bg-gray-50"
            )}
            size="lg"
          >
            🏠 Overview
          </Button>
        </div>

        {/* View Content */}
        {activeView === 'tasks' && (
          <DailyTaskView voiceEnabled={voiceEnabled} />
        )}

        {activeView === 'symptoms' && (
          <SymptomChecker />
        )}

        {activeView === 'overview' && userProgress && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Recovery Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-lg">Surgery Date</h4>
                    <p className="text-gray-600">
                      {new Date(userProgress.surgery_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">Day 0</Badge>
                </div>
                
                <div className="flex items-center justify-between p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div>
                    <h4 className="font-semibold text-lg text-blue-800">Today</h4>
                    <p className="text-blue-600">
                      Continue your AI-guided recovery journey
                    </p>
                  </div>
                  <Badge className="bg-blue-600 text-lg px-3 py-1">
                    Day {userProgress.current_day}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-6 bg-green-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-lg text-green-800">Program Completion</h4>
                    <p className="text-green-600">
                      Estimated completion date
                    </p>
                  </div>
                  <Badge variant="outline" className="border-green-600 text-green-600 text-lg px-3 py-1">
                    Day 30
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <RecoveryJourneySettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default RecoveryJourneyMain;
