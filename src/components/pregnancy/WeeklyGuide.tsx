
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Loader2, Baby, Heart, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';

interface WeeklyGuideProps {
  week: number;
  language: string;
}

const WeeklyGuide: React.FC<WeeklyGuideProps> = ({ week, language }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [weeklyMessage, setWeeklyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPersonalizedWeeklyGuide();
    }
  }, [week, language, user?.id]);

  const fetchPersonalizedWeeklyGuide = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log('Fetching personalized weekly guide for week:', week);
      
      const { data, error } = await supabase.functions.invoke('pregnancy-ai-assistant', {
        body: {
          message: `Generate comprehensive week ${week} pregnancy guidance`,
          week,
          language,
          messageType: 'weekly_guide',
          userId: user.id
        }
      });

      if (error) {
        console.error('Error calling pregnancy AI assistant:', error);
        throw error;
      }

      console.log('AI Response received:', data);
      setWeeklyMessage(data.response || getDefaultMessage());
    } catch (error) {
      console.error('Error fetching personalized weekly guide:', error);
      setWeeklyMessage(getDefaultMessage());
      toast({
        title: "Note",
        description: "Using default content. AI analysis will be available shortly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultMessage = () => {
    if (language === 'bengali') {
      return `সপ্তাহ ${week}: আপনার শিশুর বিকাশ চমৎকারভাবে এগিয়ে চলছে! এই সময়ে নিয়মিত বিশ্রাম নিন এবং পুষ্টিকর খাবার খান। আপনার শিশুর হৃদস্পন্দন এখন আরও শক্তিশালী হচ্ছে।`;
    }
    return `Week ${week}: Your baby is developing beautifully! This week, focus on getting proper rest and eating nutritious meals. Your baby's heartbeat is getting stronger each day.`;
  };

  const speakText = () => {
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(weeklyMessage);
      utterance.lang = language === 'bengali' ? 'bn-BD' : 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => {
        setSpeaking(false);
        toast({
          title: "Speech Error",
          description: "Could not play audio. Please try again.",
          variant: "destructive"
        });
      };

      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Not Supported",
        description: "Speech synthesis is not supported in your browser.",
        variant: "destructive"
      });
    }
  };

  const parseGuidanceContent = (content: string) => {
    // Split content into sections for better display
    const sections = content.split('\n\n').filter(section => section.trim());
    return sections;
  };

  const sections = parseGuidanceContent(weeklyMessage);

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-pink-800 flex items-center gap-2">
            <Baby className="h-6 w-6" />
            {language === 'bengali' ? `সপ্তাহ ${week} গাইড` : `Week ${week} Personalized Guide`}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">
              <Heart className="h-4 w-4 mr-1 text-red-500" />
              {language === 'bengali' ? 'ব্যক্তিগত' : 'Personalized'}
            </Badge>
            <Button
              onClick={speakText}
              variant={speaking ? "destructive" : "outline"}
              size="sm"
            >
              {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-pink-600 mx-auto mb-4" />
              <p className="text-pink-600">
                {language === 'bengali' ? 'আপনার ব্যক্তিগত গাইড তৈরি করা হচ্ছে...' : 'Generating your personalized guide...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-pink-300">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section}</p>
              </div>
            ))}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <Baby className="h-5 w-5" />
                  {language === 'bengali' ? 'শিশুর বিকাশ' : 'Baby Development'}
                </h3>
                <p className="text-sm text-green-700">
                  {language === 'bengali' 
                    ? 'সপ্তাহ অনুযায়ী আপনার শিশুর বৃদ্ধি ও বিকাশের তথ্য'
                    : 'Week-specific baby growth and development information'
                  }
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  {language === 'bengali' ? 'মায়ের যত্ন' : 'Maternal Care'}
                </h3>
                <p className="text-sm text-blue-700">
                  {language === 'bengali' 
                    ? 'আপনার স্বাস্থ্য ও সুস্থতার জন্য বিশেষজ্ঞ পরামর্শ'
                    : 'Expert advice for your health and wellbeing'
                  }
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {language === 'bengali' ? 'AI বিশ্লেষণ' : 'AI Analysis'}
                </h3>
                <p className="text-sm text-purple-700">
                  {language === 'bengali' 
                    ? 'আপনার মেডিকেল হিস্ট্রি অনুযায়ী ব্যক্তিগত পরামর্শ'
                    : 'Personalized advice based on your medical profile'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyGuide;
