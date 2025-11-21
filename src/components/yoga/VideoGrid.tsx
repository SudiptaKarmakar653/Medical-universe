
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, User } from "lucide-react";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

interface VideoGridProps {
  videos: Video[];
  onVideoSelect: (videoId: string, title: string) => void;
  isLoading: boolean;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, onVideoSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
        <p className="text-gray-500">Try adjusting your search or yoga preferences</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
          <div className="relative aspect-video">
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button 
                size="lg" 
                onClick={() => onVideoSelect(video.id, video.title)}
                className="rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
              >
                <Play className="h-6 w-6 mr-2 fill-current" />
                Play Video
              </Button>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              <Clock className="h-3 w-3 inline mr-1" />
              Video
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm line-clamp-2 mb-2 text-gray-900 leading-tight">
              {video.title}
            </h3>
            <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
              {video.description}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <span className="truncate">{video.channelTitle}</span>
              </div>
              <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VideoGrid;
