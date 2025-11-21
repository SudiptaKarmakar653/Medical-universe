
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Play, RotateCcw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';
import YouTubePlayer from '@/components/yoga/YouTubePlayer';

interface YogaTask {
  id: string;
  task_title: string;
  task_description: string;
  day_number: number;
  is_completed: boolean;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

interface YogaRoutineProps {
  week: number;
  language: string;
  userId?: string;
}

const YogaRoutine: React.FC<YogaRoutineProps> = ({ week, language, userId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [yogaTasks, setYogaTasks] = useState<YogaTask[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<{id: string, title: string} | null>(null);

  const actualUserId = userId || user?.id;

  useEffect(() => {
    if (actualUserId) {
      fetchYogaTasks();
      // Load videos immediately
      fetchYogaVideos();
    }
  }, [actualUserId, week]);

  const fetchYogaTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('pregnancy_tasks')
        .select('*')
        .eq('patient_id', actualUserId)
        .eq('task_type', 'yoga')
        .eq('week_number', week)
        .order('day_number');

      if (error) throw error;
      setYogaTasks(data || []);
    } catch (error) {
      console.error('Error fetching yoga tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYogaVideos = async () => {
    setVideosLoading(true);
    try {
      const trimester = week <= 12 ? 'first' : week <= 27 ? 'second' : 'third';
      const searchQuery = `pregnancy yoga ${trimester} trimester safe prenatal`;

      console.log('Searching for yoga videos:', searchQuery);

      const { data, error } = await supabase.functions.invoke('youtube-search', {
        body: {
          query: searchQuery,
          week,
          type: 'yoga',
          maxResults: 6
        }
      });

      if (error) {
        console.error('Error fetching yoga videos:', error);
        setVideos([]);
        toast({
          title: "Video Loading Issue",
          description: "Unable to load yoga videos at the moment.",
          variant: "destructive"
        });
      } else {
        console.log('Yoga videos fetched:', data.videos?.length || 0);
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching yoga videos:', error);
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('pregnancy_tasks')
        .update({ 
          is_completed: !isCompleted,
          completed_at: !isCompleted ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      setYogaTasks(tasks =>
        tasks.map(task =>
          task.id === taskId
            ? { ...task, is_completed: !isCompleted }
            : task
        )
      );

      toast({
        title: !isCompleted ? "Great job!" : "Task unmarked",
        description: !isCompleted 
          ? "Yoga session completed!" 
          : "Task has been unmarked as incomplete",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const currentTask = yogaTasks.find(task => task.day_number === currentDay);
  const trimesterInfo = week <= 12 ? 'First' : week <= 27 ? 'Second' : 'Third';

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-purple-600">Loading your yoga routine...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {selectedVideo && (
        <YouTubePlayer 
          videoId={selectedVideo.id}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-purple-800">
              {language === 'bengali' ? 'প্রেগন্যান্সি যোগা' : 'Pregnancy Yoga Routine'}
            </CardTitle>
            <Badge variant="outline" className="bg-white">
              {trimesterInfo} Trimester - Week {week}
            </Badge>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7].map(day => {
              const task = yogaTasks.find(t => t.day_number === day);
              return (
                <Button
                  key={day}
                  variant={currentDay === day ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentDay(day)}
                  className={`relative ${task?.is_completed ? 'bg-green-100 border-green-500' : ''}`}
                >
                  {language === 'bengali' ? `দিন ${day}` : `Day ${day}`}
                  {task?.is_completed && (
                    <CheckCircle className="h-3 w-3 text-green-600 absolute -top-1 -right-1" />
                  )}
                </Button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          {/* Yoga Videos Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-800">
                {language === 'bengali' ? 'প্রেগন্যান্সি যোগা ভিডিও' : 'Pregnancy Yoga Videos'}
              </h3>
              {videosLoading && (
                <div className="flex items-center text-sm text-purple-600">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading videos...
                </div>
              )}
            </div>
            
            {videosLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-200"></div>
                    <CardContent className="p-3">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
                    <div className="relative aspect-video">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button 
                          onClick={() => setSelectedVideo({id: video.id, title: video.title})}
                          className="rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                        >
                          <Play className="h-5 w-5 mr-2 fill-current" />
                          Play
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1 text-gray-900">
                        {video.title}
                      </h4>
                      <p className="text-xs text-gray-600 truncate">
                        {video.channelTitle}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {language === 'bengali' 
                    ? 'এই মুহূর্তে কোনো ভিডিও পাওয়া যায়নি। পরে আবার চেষ্টা করুন।'
                    : 'No videos available right now. Please try again later.'
                  }
                </p>
                <Button 
                  onClick={fetchYogaVideos}
                  size="sm"
                  variant="outline"
                  disabled={videosLoading}
                >
                  {videosLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Retry'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Daily Task Section */}
          {currentTask ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">{currentTask.task_title}</h3>
                <p className="text-gray-700 mb-4">{currentTask.task_description}</p>
                
                <Button
                  onClick={() => toggleTaskCompletion(currentTask.id, currentTask.is_completed)}
                  variant={currentTask.is_completed ? "outline" : "default"}
                  size="sm"
                >
                  {currentTask.is_completed ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {language === 'bengali' ? 'আবার করুন' : 'Mark Incomplete'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {language === 'bengali' ? 'সম্পন্ন' : 'Mark Complete'}
                    </>
                  )}
                </Button>
              </div>

              {/* Weekly Progress */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">
                  {language === 'bengali' ? 'সাপ্তাহিক অগ্রগতি' : 'Weekly Progress'}
                </h4>
                <div className="flex gap-2">
                  {yogaTasks.map(task => (
                    <div
                      key={task.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        task.is_completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {task.day_number}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-purple-600 mt-2">
                  {yogaTasks.filter(t => t.is_completed).length} / {yogaTasks.length} {language === 'bengali' ? 'সম্পন্ন' : 'completed'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {language === 'bengali' 
                  ? 'এই দিনের জন্য কোনো যোগা সেশন নেই'
                  : 'No specific yoga task for this day. Practice with the videos above!'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default YogaRoutine;
