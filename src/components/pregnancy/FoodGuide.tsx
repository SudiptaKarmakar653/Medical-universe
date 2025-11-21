
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Loader2, Apple, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';

interface FoodGuideProps {
  week: number;
  language: string;
}

const FoodGuide: React.FC<FoodGuideProps> = ({ week, language }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [foodGuide, setFoodGuide] = useState('');
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPersonalizedFoodGuide();
    }
  }, [week, language, user?.id]);

  const fetchPersonalizedFoodGuide = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log('Fetching personalized food guide for week:', week);
      
      const { data, error } = await supabase.functions.invoke('pregnancy-ai-assistant', {
        body: {
          message: `Generate personalized nutrition plan for week ${week}`,
          week,
          language,
          messageType: 'food_guide',
          userId: user.id
        }
      });

      if (error) {
        console.error('Error calling pregnancy AI assistant:', error);
        throw error;
      }

      console.log('AI Food Guide Response:', data);
      setFoodGuide(data.response || getDefaultFoodGuide());
    } catch (error) {
      console.error('Error fetching personalized food guide:', error);
      setFoodGuide(getDefaultFoodGuide());
      toast({
        title: "Note",
        description: "Using default content. Personalized nutrition analysis will be available shortly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultFoodGuide = () => {
    if (language === 'bengali') {
      return `RECOMMENDED FOODS: সবুজ শাক-সবজি, ডাল, মাছ, দুধ, ফল, বাদাম

FOODS TO AVOID: কাঁচা মাছ, অতিরিক্ত চা-কফি, জাঙ্ক ফুড, কাঁচা ডিম`;
    }
    return `RECOMMENDED FOODS: Leafy greens, lentils, fish, dairy, fruits, nuts, whole grains

FOODS TO AVOID: Raw fish, excessive caffeine, junk food, raw eggs, unpasteurized dairy`;
  };

  const speakText = () => {
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(foodGuide);
      utterance.lang = language === 'bengali' ? 'bn-BD' : 'en-US';
      utterance.rate = 0.8;
      
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const parseFoodGuide = (text: string) => {
    const recommendedMatch = text.match(/RECOMMENDED FOODS?:?\s*(.*?)(?=FOODS? TO AVOID|$)/is);
    const avoidMatch = text.match(/FOODS? TO AVOID:?\s*(.*?)$/is);
    
    const recommended = recommendedMatch ? recommendedMatch[1].trim() : '';
    const avoid = avoidMatch ? avoidMatch[1].trim() : '';
    
    return { 
      recommended: recommended.split(/[,\n]/).map(item => item.trim()).filter(item => item),
      avoid: avoid.split(/[,\n]/).map(item => item.trim()).filter(item => item)
    };
  };

  const { recommended, avoid } = parseFoodGuide(foodGuide);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-green-800 flex items-center gap-2">
              <Apple className="h-6 w-6" />
              {language === 'bengali' ? 'ব্যক্তিগত পুষ্টি গাইড' : 'Personalized Nutrition Guide'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                {language === 'bengali' ? 'AI বিশ্লেষণ' : 'AI Analyzed'}
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
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-green-600">
                  {language === 'bengali' ? 'আপনার পুষ্টি পরিকল্পনা তৈরি করা হচ্ছে...' : 'Creating your personalized nutrition plan...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recommended Foods */}
              <div className="bg-white p-6 rounded-lg border-l-4 border-green-500 shadow-sm">
                <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {language === 'bengali' ? 'আজ খাবেন' : 'Recommended Foods'}
                </h3>
                <div className="space-y-2">
                  {recommended.length > 0 ? recommended.map((food, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">{food}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-green-600">
                      {language === 'bengali' ? 'সুষম খাবার খান' : 'Eat a balanced diet'}
                    </p>
                  )}
                </div>
              </div>

              {/* Foods to Avoid */}
              <div className="bg-white p-6 rounded-lg border-l-4 border-red-500 shadow-sm">
                <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                  <X className="h-5 w-5" />
                  {language === 'bengali' ? 'এড়িয়ে চলুন' : 'Foods to Avoid'}
                </h3>
                <div className="space-y-2">
                  {avoid.length > 0 ? avoid.map((food, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-700">{food}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-red-600">
                      {language === 'bengali' ? 'ক্ষতিকর খাবার এড়িয়ে চলুন' : 'Avoid harmful foods'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Nutritional Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Apple className="h-4 w-4" />
              {language === 'bengali' ? 'হাইড্রেশন' : 'Hydration'}
            </h4>
            <p className="text-sm text-blue-700">
              {language === 'bengali' 
                ? 'দিনে ৮-১০ গ্লাস পানি পান করুন'
                : 'Drink 8-10 glasses of water daily'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {language === 'bengali' ? 'ভিটামিন' : 'Supplements'}
            </h4>
            <p className="text-sm text-purple-700">
              {language === 'bengali' 
                ? 'ফলিক অ্যাসিড ও আয়রন সাপ্লিমেন্ট নিন'
                : 'Take folic acid and iron as prescribed'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {language === 'bengali' ? 'খাবারের সময়' : 'Meal Timing'}
            </h4>
            <p className="text-sm text-orange-700">
              {language === 'bengali' 
                ? 'দিনে ৫-৬ বার অল্প অল্প করে খান'
                : 'Eat 5-6 small meals throughout the day'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoodGuide;
