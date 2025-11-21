
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, Clock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface YogaTask {
  task: string;
  duration: string;
}

interface YogaTasksProps {
  level: string;
  focus: string;
}

const YogaTasks: React.FC<YogaTasksProps> = ({ level, focus }) => {
  const [tasks, setTasks] = useState<YogaTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateTasks = async () => {
    setIsLoading(true);
    try {
      console.log('Generating tasks for level:', level, 'focus:', focus);
      
      const { data, error } = await supabase.functions.invoke('generate-yoga-tasks', {
        body: { level, focus }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Generated tasks:', data);
      setTasks(data.tasks || []);
      setCompletedTasks(new Set());
      
      toast({
        title: "New Tasks Generated!",
        description: `Created ${data.tasks?.length || 0} personalized yoga tasks for ${level} level ${focus} practice.`,
      });
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast({
        title: "Using Default Tasks",
        description: "Generated some basic yoga tasks for you to get started.",
        variant: "destructive"
      });
      
      // Set fallback tasks
      const fallbackTasks = [
        {"task": "Practice Mountain Pose with deep breathing", "duration": "3 minutes"},
        {"task": "Perform gentle neck and shoulder rolls", "duration": "5 minutes"},
        {"task": "Hold Warrior I pose on both sides", "duration": "6 minutes"},
        {"task": "Practice Cat-Cow stretches", "duration": "5 minutes"},
        {"task": "End with Child's Pose relaxation", "duration": "5 minutes"}
      ];
      setTasks(fallbackTasks);
      setCompletedTasks(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateTasks();
  }, [level, focus]);

  const toggleTask = (index: number) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
      toast({
        title: "Task Completed! ✨",
        description: "Great job on completing your yoga task!",
      });
    }
    setCompletedTasks(newCompleted);
  };

  const completionPercentage = tasks.length > 0 ? Math.round((completedTasks.size / tasks.length) * 100) : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Generated Yoga Tasks
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateTasks}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Generate New Tasks
          </Button>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <Badge variant="secondary" className="capitalize">{level} Level</Badge>
          <Badge variant="outline" className="capitalize">{focus} Focus</Badge>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">
              {completedTasks.size}/{tasks.length} completed ({completionPercentage}%)
            </span>
          </div>
        </div>
        {completionPercentage > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div 
                key={index} 
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                  completedTasks.has(index) 
                    ? 'bg-green-50 border-green-200 shadow-sm' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <Checkbox
                  checked={completedTasks.has(index)}
                  onCheckedChange={() => toggleTask(index)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className={`font-medium mb-1 ${
                    completedTasks.has(index) ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {task.task}
                  </p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">{task.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No tasks available at the moment</p>
            <Button onClick={generateTasks} disabled={isLoading}>
              Generate Your First Tasks
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YogaTasks;
