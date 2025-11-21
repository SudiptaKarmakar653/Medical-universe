
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, week, maxResults = 12, type = 'general' } = await req.json();
    // Use the provided YouTube API key
    const youtubeApiKey = 'AIzaSyAGf72z_ThspQUBrfYq3Z0-9Ki5xl58aT8';

    if (!youtubeApiKey) {
      throw new Error('YouTube API key not configured');
    }

    // Enhanced search queries based on pregnancy week and type
    let searchQuery = query;
    
    if (type === 'yoga') {
      const trimester = week <= 12 ? 'first' : week <= 27 ? 'second' : 'third';
      searchQuery = `pregnancy yoga ${trimester} trimester week ${week} safe prenatal exercise`;
    } else if (type === 'nutrition') {
      searchQuery = `pregnancy nutrition week ${week} healthy eating pregnant women`;
    } else if (type === 'exercise') {
      searchQuery = `pregnancy exercise week ${week} safe workout pregnant women`;
    } else {
      // For general yoga searches from the yoga page
      searchQuery = query || 'yoga beginner safe practice';
    }

    console.log('YouTube search query:', searchQuery);

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}&key=${youtubeApiKey}&videoDuration=medium&videoDefinition=high&safeSearch=strict&relevanceLanguage=en&order=relevance`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('YouTube API Error:', data);
      throw new Error(data.error?.message || 'YouTube API error');
    }

    // Simplified filtering - much less restrictive
    const videos = data.items
      .filter((item: any) => {
        const title = item.snippet.title.toLowerCase();
        
        // Basic filtering to exclude obviously problematic content
        const blockedKeywords = ['nsfw', 'explicit', 'adult', 'inappropriate'];
        const hasBlockedContent = blockedKeywords.some(keyword => 
          title.includes(keyword)
        );
        
        // Don't filter out content too aggressively
        return !hasBlockedContent && title.length > 0;
      })
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt
      }));

    console.log(`Found ${videos.length} filtered videos`);

    return new Response(JSON.stringify({ videos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in youtube-search function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      videos: [] // Return empty array as fallback
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
