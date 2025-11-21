
import React, { useState } from 'react';
import { useAuth } from '@/context/auth-provider';
import { useRecovery } from '@/hooks/use-recovery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Check, X, Clock, Info, Volume2 } from 'lucide-react';
import { voiceAssistant } from '@/utils/voiceAssistant';

interface DailyTaskViewProps {
  voiceEnabled: boolean;
}

export const DailyTaskView: React.FC<DailyTaskViewProps> = ({ voiceEnabled }) => {
  const { user } = useAuth();
  const { 
    userProgress, 
    todaysTasks, 
    completeTask, 
    getTaskCompletion, 
    getTodayCompletionStats 
  } = useRecovery(user?.id);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [taskNotes, setTaskNotes] = useState<Record<string, string>>({});

  const handleCompleteTask = async (taskId: string, isCompleted: boolean) => {
    const notes = taskNotes[taskId] || '';
    await completeTask(taskId, isCompleted, notes);
    
    if (isCompleted && voiceEnabled) {
      const task = todaysTasks.find(t => t.id === taskId);
      if (task) {
        const praise = voiceAssistant.generateCompletionPraise(task.task_title);
        voiceAssistant.speak(praise);
      }
    }
  };

  const handleTaskInstruction = (task: any) => {
    if (voiceEnabled) {
      const instruction = voiceAssistant.generateTaskInstruction(
        task.task_title,
        task.task_description,
        task.estimated_duration_minutes
      );
      voiceAssistant.speak(instruction);
    }
  };

  const getTaskTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'exercise': 'bg-blue-100 text-blue-800 border-blue-200',
      'breathing': 'bg-green-100 text-green-800 border-green-200',
      'therapy': 'bg-purple-100 text-purple-800 border-purple-200',
      'care': 'bg-pink-100 text-pink-800 border-pink-200',
      'medication': 'bg-orange-100 text-orange-800 border-orange-200',
      'general': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || colors.general;
  };

  const getDifficultyIcon = (level: number) => {
    if (level <= 2) return '🟢';
    if (level <= 3) return '🟡';
    return '🔴';
  };

  const stats = getTodayCompletionStats();

  if (!userProgress) {
    return <div>Please set up your recovery program first.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Day {userProgress.current_day} Progress</span>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {stats.completed}/{stats.total}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span className="font-semibold">{stats.percentage}%</span>
            </div>
            <Progress value={stats.percentage} className="h-3" />
            <p className="text-sm text-gray-600">
              Keep going! Each completed task brings you closer to full recovery.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          📋 Today's Recovery Tasks
          <Badge variant="secondary">{todaysTasks.length} tasks</Badge>
        </h2>

        {todaysTasks.map((task) => {
          const completion = getTaskCompletion(task.id);
          const isCompleted = completion?.is_completed || false;
          const isExpanded = expandedTask === task.id;

          return (
            <Card 
              key={task.id} 
              className={`transition-all duration-200 ${
                isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'hover:shadow-md'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-semibold ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                        {task.task_title}
                      </h3>
                      <Badge className={getTaskTypeColor(task.task_type)}>
                        {task.task_type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {task.estimated_duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        {getDifficultyIcon(task.difficulty_level)}
                        Level {task.difficulty_level}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {voiceEnabled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTaskInstruction(task)}
                        className="h-8 w-8 p-0"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Instructions</h4>
                      <p className="text-gray-700">{task.task_description}</p>
                    </div>

                    {!isCompleted && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Notes (optional)
                        </label>
                        <Textarea
                          placeholder="Add any notes about this task..."
                          value={taskNotes[task.id] || ''}
                          onChange={(e) => setTaskNotes(prev => ({
                            ...prev,
                            [task.id]: e.target.value
                          }))}
                          className="h-20"
                        />
                      </div>
                    )}

                    {completion?.notes && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-1">Your Notes</h5>
                        <p className="text-blue-700 text-sm">{completion.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}

              <CardContent className="pt-0">
                <div className="flex gap-2">
                  {!isCompleted ? (
                    <>
                      <Button
                        onClick={() => handleCompleteTask(task.id, true)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                      <Button
                        onClick={() => handleCompleteTask(task.id, false)}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Can't Do Now
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 text-green-700">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">Completed!</span>
                        {completion?.completion_date && (
                          <span className="text-sm text-green-600">
                            at {new Date(completion.completion_date).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleCompleteTask(task.id, false)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Undo
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {stats.percentage === 100 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Excellent Work!
            </h3>
            <p className="text-green-700">
              You've completed all tasks for day {userProgress.current_day}! 
              Your dedication to recovery is inspiring. Rest well and prepare for tomorrow's journey.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
