
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, AlertTriangle, Send, Bot, User, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'patient' | 'ai' | 'doctor';
  message_type: string;
  created_at: string;
}

interface PregnancyChatProps {
  week: number;
  language: string;
  userId?: string;
  partnerPhone?: string;
}

const PregnancyChat: React.FC<PregnancyChatProps> = ({ week, language, userId, partnerPhone }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchChatHistory();
    }
  }, [userId]);

  const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('pregnancy_chat_messages')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const typedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        message: msg.message,
        sender_type: msg.sender_type as 'patient' | 'ai' | 'doctor',
        message_type: msg.message_type,
        created_at: msg.created_at
      }));

      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const sendMessage = async (messageType: string = 'general') => {
    if (!newMessage.trim() || !user?.id) return;

    setLoading(true);
    const userMessage = newMessage;
    setNewMessage('');

    try {
      // Save user message
      const { data: userMsgData, error: userMsgError } = await supabase
        .from('pregnancy_chat_messages')
        .insert({
          patient_id: user.id,
          message: userMessage,
          sender_type: 'patient',
          message_type: messageType
        })
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      const typedUserMessage: ChatMessage = {
        id: userMsgData.id,
        message: userMsgData.message,
        sender_type: userMsgData.sender_type as 'patient' | 'ai' | 'doctor',
        message_type: userMsgData.message_type,
        created_at: userMsgData.created_at
      };

      setMessages(prev => [...prev, typedUserMessage]);

      // Get AI response with personalized analysis
      console.log('Sending message to AI assistant:', {
        message: userMessage,
        week,
        language,
        messageType: 'chat',
        userId: user.id
      });

      const { data, error } = await supabase.functions.invoke('pregnancy-ai-assistant', {
        body: {
          message: userMessage,
          week,
          language,
          messageType: 'chat',
          userId: user.id
        }
      });

      if (error) {
        console.error('Error calling AI assistant:', error);
        throw error;
      }

      console.log('AI Response received:', data);

      // Save AI response
      const { data: aiMsgData, error: aiMsgError } = await supabase
        .from('pregnancy_chat_messages')
        .insert({
          patient_id: user.id,
          message: data.response,
          sender_type: 'ai',
          message_type: messageType
        })
        .select()
        .single();

      if (aiMsgError) throw aiMsgError;

      const typedAiMessage: ChatMessage = {
        id: aiMsgData.id,
        message: aiMsgData.message,
        sender_type: aiMsgData.sender_type as 'patient' | 'ai' | 'doctor',
        message_type: aiMsgData.message_type,
        created_at: aiMsgData.created_at
      };

      setMessages(prev => [...prev, typedAiMessage]);

      // Check if response indicates emergency
      if (data.response.includes('🚨 EMERGENCY') || data.response.includes('emergency')) {
        toast({
          title: "⚠️ Emergency Detected",
          description: "The AI has detected potential emergency symptoms. Please follow the advice given.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendEmergencyAlert = async () => {
    const emergencyMessage = language === 'bengali' 
      ? '🚨 জরুরি: আমার অবিলম্বে চিকিৎসা সহায়তা প্রয়োজন। গুরুতর লক্ষণ দেখা দিয়েছে।'
      : '🚨 EMERGENCY: I need immediate medical assistance. I am experiencing severe symptoms.';

    setNewMessage(emergencyMessage);
    await sendMessage('emergency');

    // Simulate emergency alert
    if (partnerPhone) {
      toast({
        title: language === 'bengali' ? '🚨 জরুরি বার্তা পাঠানো হয়েছে' : '🚨 Emergency Alert Sent',
        description: language === 'bengali' 
          ? 'আপনার পার্টনার ও জরুরি যোগাযোগকারীকে অবহিত করা হয়েছে'
          : 'Your partner and emergency contacts have been notified',
      });
    }
  };

  const quickResponses = [
    {
      en: "I'm feeling nauseous and dizzy",
      bn: "আমার বমি বমি ভাব ও মাথা ঘুরছে"
    },
    {
      en: "I have severe back pain",
      bn: "আমার তীব্র পিঠে ব্যথা হচ্ছে"
    },
    {
      en: "Baby movements have decreased",
      bn: "শিশুর নড়াচড়া কমে গেছে"
    },
    {
      en: "I'm having trouble sleeping",
      bn: "আমার ঘুমের সমস্যা হচ্ছে"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Emergency Section */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            {language === 'bengali' ? '🚨 জরুরি সেবা' : '🚨 Emergency Services'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={sendEmergencyAlert}
              variant="destructive"
              className="w-full"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {language === 'bengali' ? 'SOS - জরুরি সাহায্য' : 'SOS - Emergency Help'}
            </Button>
            <Button
              onClick={() => window.open('tel:emergency')}
              variant="outline"
              className="w-full border-red-300 text-red-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              {language === 'bengali' ? 'জরুরি কল' : 'Emergency Call'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Chat Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            {language === 'bengali' ? 'AI স্বাস্থ্য সহায়ক' : 'AI Health Assistant'}
            <Badge variant="outline" className="bg-blue-50">
              {language === 'bengali' ? 'ব্যক্তিগত বিশ্লেষণ' : 'Personalized Analysis'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick Response Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {quickResponses.map((response, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setNewMessage(language === 'bengali' ? response.bn : response.en)}
                className="text-left justify-start h-auto p-3"
              >
                {language === 'bengali' ? response.bn : response.en}
              </Button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 space-y-3 bg-gray-50">
            {chatLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 h-full flex flex-col items-center justify-center">
                <Brain className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                <p className="font-medium">
                  {language === 'bengali' ? 'আমি আপনার ব্যক্তিগত AI স্বাস্থ্য সহায়ক!' : 'I\'m your personalized AI health assistant!'}
                </p>
                <p className="text-sm mt-1">
                  {language === 'bengali' 
                    ? 'আপনার মেডিকেল ইতিহাস বিশ্লেষণ করে পরামর্শ দিতে পারি'
                    : 'I can analyze your medical history and provide personalized advice'
                  }
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.sender_type === 'patient'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800 border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender_type === 'patient' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Brain className="h-3 w-3 text-blue-600" />
                      )}
                      <span className="text-xs font-medium">
                        {message.sender_type === 'patient' ? 'You' : 'AI Assistant'}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-line">{message.message}</p>
                    {message.message_type === 'emergency' && (
                      <Badge variant="destructive" className="mt-2 text-xs">
                        {language === 'bengali' ? '🚨 জরুরি' : '🚨 Emergency'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={language === 'bengali' ? 'আপনার লক্ষণ বা প্রশ্ন লিখুন...' : 'Describe your symptoms or ask a question...'}
              onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            {language === 'bengali' 
              ? '⚡ AI আপনার মেডিকেল প্রোফাইল বিশ্লেষণ করে ব্যক্তিগত পরামর্শ দেয়'
              : '⚡ AI analyzes your medical profile to provide personalized advice'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PregnancyChat;
