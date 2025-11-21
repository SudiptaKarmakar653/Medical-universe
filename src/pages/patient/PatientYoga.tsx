
import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Camera, BookOpen, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import YouTubePlayer from "@/components/yoga/YouTubePlayer";
import VideoGrid from "@/components/yoga/VideoGrid";
import YogaTasks from "@/components/yoga/YogaTasks";
import PostureDetection from "@/components/yoga/PostureDetection";
import UserProgress from "@/components/yoga/UserProgress";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

const PatientYoga = () => {
  useTitle("AI-Powered Yoga Program - Medical Universe");
  const { toast } = useToast();
  
  const [selectedLevel, setSelectedLevel] = useState("beginner");
  const [selectedFocus, setSelectedFocus] = useState("flexibility");
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{id: string, title: string} | null>(null);
  const [activeTab, setActiveTab] = useState("practice");

  const levels = ["beginner", "intermediate", "advanced"];
  const focusAreas = ["flexibility", "strength", "balance", "relaxation", "meditation"];

  const searchYogaVideos = async (query?: string) => {
    setIsLoadingVideos(true);
    try {
      const searchTerm = query || `${selectedLevel} yoga ${selectedFocus}`;
      const { data, error } = await supabase.functions.invoke('youtube-search', {
        body: { query: searchTerm, maxResults: 12 }
      });

      if (error) throw error;
      setVideos(data.videos);
    } catch (error) {
      console.error('Error searching videos:', error);
      toast({
        title: "Error",
        description: "Failed to load yoga videos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingVideos(false);
    }
  };

  useEffect(() => {
    searchYogaVideos();
  }, [selectedLevel, selectedFocus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchYogaVideos(searchQuery);
    }
  };

  const handleVideoSelect = (videoId: string, title: string) => {
    setSelectedVideo({ id: videoId, title });
  };

  const closeVideoPlayer = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="patient" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="patient" className="hidden lg:block" />
        
        <main className="flex-1 p-6">
          <div className="bg-zinc-200 my-[70px] p-6 rounded-lg">
            <h1 className="text-2xl font-bold mb-6">AI-Powered Yoga Program</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="practice" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Practice
                </TabsTrigger>
                <TabsTrigger value="posture" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Posture Detection
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Videos
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Progress
                </TabsTrigger>
              </TabsList>

              <TabsContent value="practice" className="space-y-6">
                {/* Level and Focus Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Yoga Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {levels.map((level) => (
                          <Button
                            key={level}
                            variant={selectedLevel === level ? "default" : "outline"}
                            onClick={() => setSelectedLevel(level)}
                            className="capitalize"
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Focus Area</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {focusAreas.map((focus) => (
                          <Button
                            key={focus}
                            variant={selectedFocus === focus ? "default" : "outline"}
                            onClick={() => setSelectedFocus(focus)}
                            className="capitalize"
                          >
                            {focus}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI-Generated Tasks */}
                <YogaTasks level={selectedLevel} focus={selectedFocus} />
              </TabsContent>

              <TabsContent value="posture" className="space-y-6">
                <PostureDetection />
              </TabsContent>

              <TabsContent value="videos" className="space-y-6">
                {/* Video Search */}
                <Card>
                  <CardHeader>
                    <CardTitle>Search Yoga Videos</CardTitle>
                    <CardDescription>
                      Find yoga videos from YouTube based on your preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search for yoga videos..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button type="submit">Search</Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Video Grid */}
                <Card>
                  <CardHeader>
                    <CardTitle>Yoga Videos</CardTitle>
                    <CardDescription>
                      {searchQuery ? `Search results for "${searchQuery}"` : `${selectedLevel} level yoga videos for ${selectedFocus}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VideoGrid 
                      videos={videos}
                      onVideoSelect={handleVideoSelect}
                      isLoading={isLoadingVideos}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="space-y-6">
                <UserProgress />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* YouTube Video Player Modal */}
      {selectedVideo && (
        <YouTubePlayer
          videoId={selectedVideo.id}
          title={selectedVideo.title}
          onClose={closeVideoPlayer}
        />
      )}
    </div>
  );
};

export default PatientYoga;
