import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RecoveryProgram {
  id: string;
  surgery_type: string;
  program_name: string;
  total_days: number;
}

export interface RecoveryTask {
  id: string;
  program_id: string;
  day_number: number;
  task_title: string;
  task_description: string;
  task_type: string;
  difficulty_level: number;
  estimated_duration_minutes: number;
}

export interface PatientProgress {
  id: string;
  patient_id: string;
  program_id: string;
  surgery_date: string;
  current_day: number;
  total_completion_percentage: number;
}

export interface TaskCompletion {
  id: string;
  patient_progress_id: string;
  task_id: string;
  day_number: number;
  is_completed: boolean;
  completion_date?: string;
  notes?: string;
}

export function useRecovery(userId?: string | null) {
  const [programs, setPrograms] = useState<RecoveryProgram[]>([]);
  const [userProgress, setUserProgress] = useState<PatientProgress | null>(null);
  const [todaysTasks, setTodaysTasks] = useState<RecoveryTask[]>([]);
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchPrograms();
      fetchUserProgress();
    } else {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userProgress) {
      fetchTodaysTasks();
      fetchTaskCompletions();
    }
  }, [userProgress]);

  const fetchPrograms = async () => {
    try {
      console.log('Fetching recovery programs...');
      const { data, error } = await supabase
        .from('recovery_programs')
        .select('*')
        .order('surgery_type');

      if (error) {
        console.error('Error fetching programs:', error);
        throw error;
      }
      
      console.log('Programs fetched successfully:', data);
      setPrograms(data || []);
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      toast({
        title: "Error",
        description: "Failed to load recovery programs. Please try refreshing the page.",
        variant: "destructive"
      });
    }
  };

  const fetchUserProgress = async () => {
    try {
      if (!userId) {
        setLoading(false);
        return;
      }

      console.log('Fetching user progress for:', userId);

      const { data, error } = await supabase
        .from('patient_recovery_progress')
        .select('*')
        .eq('patient_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user progress:', error);
        throw error;
      }
      
      console.log('User progress data:', data);
      setUserProgress(data);
    } catch (error: any) {
      console.error('Error fetching user progress:', error);
      toast({
        title: "Error",
        description: "Failed to load your recovery progress. Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysTasks = async () => {
    try {
      if (!userProgress) return;

      console.log('Fetching today\'s tasks for day:', userProgress.current_day);

      const { data, error } = await supabase
        .from('recovery_tasks')
        .select('*')
        .eq('program_id', userProgress.program_id)
        .eq('day_number', userProgress.current_day)
        .order('task_type');

      if (error) {
        console.error('Error fetching today\'s tasks:', error);
        throw error;
      }
      
      console.log('Today\'s tasks fetched:', data);
      setTodaysTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching todays tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load today's tasks. Please try refreshing the page.",
        variant: "destructive"
      });
    }
  };

  const fetchTaskCompletions = async () => {
    try {
      if (!userProgress) return;

      console.log('Fetching task completions for progress ID:', userProgress.id);

      const { data, error } = await supabase
        .from('daily_task_completions')
        .select('*')
        .eq('patient_progress_id', userProgress.id)
        .eq('day_number', userProgress.current_day);

      if (error) {
        console.error('Error fetching task completions:', error);
        throw error;
      }
      
      console.log('Task completions fetched:', data);
      setTaskCompletions(data || []);
    } catch (error: any) {
      console.error('Error fetching task completions:', error);
      toast({
        title: "Error",
        description: "Failed to load task completion status. Please try refreshing the page.",
        variant: "destructive"
      });
    }
  };

  const startRecoveryProgram = async (surgeryType: string, surgeryDate: string) => {
    try {
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "Please sign in to start your recovery program",
          variant: "destructive"
        });
        return null;
      }

      console.log('Starting recovery program for user:', userId);
      console.log('Surgery type:', surgeryType);
      console.log('Surgery date:', surgeryDate);

      const program = programs.find(p => p.surgery_type === surgeryType);
      if (!program) {
        console.error('Program not found for surgery type:', surgeryType);
        toast({
          title: "Program not found",
          description: "The selected recovery program could not be found",
          variant: "destructive"
        });
        return null;
      }

      console.log('Found program:', program);

      // Check if user already has a program
      const { data: existingProgress } = await supabase
        .from('patient_recovery_progress')
        .select('*')
        .eq('patient_id', userId)
        .maybeSingle();

      if (existingProgress) {
        console.log('User already has progress:', existingProgress);
        toast({
          title: "Program already exists",
          description: "You already have an active recovery program",
          variant: "destructive"
        });
        return existingProgress;
      }

      // Insert the new progress record
      const progressData = {
        patient_id: userId,
        program_id: program.id,
        surgery_date: surgeryDate,
        current_day: 1,
        total_completion_percentage: 0
      };

      console.log('Inserting progress data:', progressData);

      const { data, error } = await supabase
        .from('patient_recovery_progress')
        .insert(progressData)
        .select()
        .single();

      if (error) {
        console.error('Error starting program:', error);
        throw error;
      }

      console.log('Started recovery program successfully:', data);
      setUserProgress(data);

      toast({
        title: "Recovery program started!",
        description: `Your ${program.program_name} has begun. Let's start your healing journey!`,
      });

      return data;
    } catch (error: any) {
      console.error('Error starting program:', error);
      toast({
        title: "Error",
        description: `Failed to start recovery program: ${error.message || 'Please try again.'}`,
        variant: "destructive"
      });
      return null;
    }
  };

  const completeTask = async (taskId: string, isCompleted: boolean, notes?: string) => {
    try {
      if (!userProgress) {
        toast({
          title: "Error",
          description: "Recovery progress not found",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('daily_task_completions')
        .upsert({
          patient_progress_id: userProgress.id,
          task_id: taskId,
          day_number: userProgress.current_day,
          is_completed: isCompleted,
          completion_date: isCompleted ? new Date().toISOString() : null,
          notes: notes || null
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setTaskCompletions(prev => {
        const existing = prev.find(tc => tc.task_id === taskId);
        if (existing) {
          return prev.map(tc => tc.task_id === taskId ? data : tc);
        } else {
          return [...prev, data];
        }
      });

      // Calculate and update completion percentage
      await updateCompletionPercentage();

      toast({
        title: isCompleted ? "Task completed!" : "Task marked incomplete",
        description: isCompleted ? "Great progress on your recovery!" : "You can try again later.",
      });

    } catch (error: any) {
      console.error('Error updating task completion:', error);
      toast({
        title: "Error",
        description: "Failed to update task completion",
        variant: "destructive"
      });
    }
  };

  const updateCompletionPercentage = async () => {
    try {
      if (!userProgress) return;

      const completedToday = taskCompletions.filter(tc => tc.is_completed).length;
      const totalToday = todaysTasks.length;
      const todayPercentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

      // For now, just use today's percentage as overall percentage
      // In a full implementation, you'd calculate across all days
      const { error } = await supabase
        .from('patient_recovery_progress')
        .update({
          total_completion_percentage: todayPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProgress.id);

      if (error) throw error;

      setUserProgress(prev => prev ? {
        ...prev,
        total_completion_percentage: todayPercentage
      } : null);

    } catch (error) {
      console.error('Error updating completion percentage:', error);
    }
  };

  const submitSymptomReport = async (symptoms: Record<string, boolean>, severityLevel: number) => {
    try {
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit symptom reports",
          variant: "destructive"
        });
        return;
      }

      const requiresEmergency = severityLevel >= 4 || symptoms.chest_pain || symptoms.difficulty_breathing;

      const { data, error } = await supabase
        .from('symptom_reports')
        .insert({
          patient_id: userId,
          symptoms: symptoms,
          severity_level: severityLevel,
          requires_emergency: requiresEmergency,
          doctor_notified: requiresEmergency
        })
        .select()
        .single();

      if (error) throw error;

      if (requiresEmergency) {
        toast({
          title: "⚠️ Emergency Symptoms Detected",
          description: "Please contact your doctor immediately or call emergency services.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Symptom report submitted",
          description: "Your symptoms have been recorded for your doctor's review.",
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error submitting symptom report:', error);
      toast({
        title: "Error",
        description: "Failed to submit symptom report",
        variant: "destructive"
      });
    }
  };

  const getTaskCompletion = (taskId: string) => {
    return taskCompletions.find(tc => tc.task_id === taskId);
  };

  const getTodayCompletionStats = () => {
    const completed = taskCompletions.filter(tc => tc.is_completed).length;
    const total = todaysTasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  return {
    programs,
    userProgress,
    todaysTasks,
    taskCompletions,
    loading,
    startRecoveryProgram,
    completeTask,
    submitSymptomReport,
    getTaskCompletion,
    getTodayCompletionStats,
    refreshData: () => {
      if (userId) {
        fetchUserProgress();
        if (userProgress) {
          fetchTodaysTasks();
          fetchTaskCompletions();
        }
      }
    }
  };
}
