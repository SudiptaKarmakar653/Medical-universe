import React, { useState, useRef, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { useTitle } from "@/hooks/use-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Send, Mic, Paperclip, Bot, User, Pill, ArrowRight, Loader2, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

// Define interfaces for chat messages
interface ChatMessage {
  role: string;
  content: string;
  image?: string; // Make image optional
}
interface MedicineMessage {
  role: string;
  content: string;
}

// Contact form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters."
  })
});
const HealthAssistantPage = () => {
  useTitle("Health Assistant - Medical Universe");
  const {
    toast
  } = useToast();
  const [message, setMessage] = useState("");
  const [medicineQuery, setMedicineQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMedicineSending, setIsMedicineSending] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{
    role: "bot",
    content: "Hello! I'm your AI Health Assistant. How can I help you today?"
  }, {
    role: "bot",
    content: "You can ask me about symptoms, general health questions, or get guidance on medical conditions."
  }]);
  const [medicineHistory, setMedicineHistory] = useState<MedicineMessage[]>([{
    role: "bot",
    content: "Enter a condition or symptoms, and I'll suggest some over-the-counter medications that may help."
  }, {
    role: "bot",
    content: "Remember: Always consult with a healthcare professional before taking any medication."
  }]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const medicineEndRef = useRef<HTMLDivElement>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: ""
    }
  });

  // Handle navbar scroll state
  const handleNavbarScroll = (scrolled: boolean) => {
    setIsScrolled(scrolled);
  };

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [chatHistory]);
  useEffect(() => {
    medicineEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [medicineHistory]);

  // Common questions shortcuts for chat
  const commonQuestions = ["What are the symptoms of flu?", "How can I manage my stress?", "What causes headaches?", "How to improve sleep quality?", "What's a balanced diet?"];

  // Common conditions for medicine suggestions
  const commonConditions = ["Common cold", "Headache", "Allergies", "Indigestion", "Muscle pain"];
  const handleSendMessage = () => {
    if (!message.trim() && !uploadedImage) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      image: uploadedImage || undefined // Only include image if it exists
    };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage("");
    setUploadedImage(null);

    // Simulate AI processing
    setIsSending(true);
    setTimeout(() => {
      let botResponse = "";

      // Simple response logic based on user input
      if (message.toLowerCase().includes("headache")) {
        botResponse = "Headaches can be caused by various factors like stress, dehydration, lack of sleep, or tension. For occasional headaches, rest, hydration, and over-the-counter pain relievers like acetaminophen or ibuprofen might help. If you're experiencing severe or recurring headaches, it would be best to consult with a healthcare professional.";
      } else if (message.toLowerCase().includes("flu") || message.toLowerCase().includes("cold")) {
        botResponse = "Common flu symptoms include fever, cough, sore throat, body aches, and fatigue. To manage symptoms, rest well, stay hydrated, and consider over-the-counter medications like acetaminophen for fever and pain relief. Decongestants may help with nasal congestion. If symptoms are severe or persistent, please consult a healthcare provider.";
      } else if (message.toLowerCase().includes("stress")) {
        botResponse = "Managing stress is important for your overall health. Try regular exercise, meditation, deep breathing exercises, maintaining a healthy diet, and ensuring adequate sleep. Consider activities you enjoy and try to incorporate them into your routine. If stress is significantly impacting your life, speaking with a mental health professional can be beneficial.";
      } else if (message.toLowerCase().includes("sleep")) {
        botResponse = "For better sleep quality, establish a regular sleep schedule, create a relaxing bedtime routine, ensure your bedroom is comfortable, quiet, and dark, limit screen time before bed, and avoid caffeine and large meals close to bedtime. Regular exercise can also help improve sleep quality.";
      } else if (uploadedImage) {
        botResponse = "I've analyzed the image you uploaded. While I can see what appears to be a health-related image, I'd recommend consulting with a healthcare professional for an accurate diagnosis. If you're noticing any concerning symptoms along with what's shown in the image, it would be best to seek medical attention.";
      } else {
        botResponse = "Thank you for your health question. Based on the information provided, I'd recommend discussing this with a healthcare professional for personalized advice. Remember that general health practices include staying hydrated, getting regular exercise, maintaining a balanced diet, and ensuring adequate sleep.";
      }
      setChatHistory(prev => [...prev, {
        role: "bot",
        content: botResponse
      }]);
      setIsSending(false);

      // Text-to-speech simulation
      if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(botResponse);
        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 0.8;
        window.speechSynthesis.speak(speech);
      }
    }, 1500);
  };
  const handleMedicineQuery = () => {
    if (!medicineQuery.trim()) return;

    // Add user query to chat
    setMedicineHistory(prev => [...prev, {
      role: "user",
      content: medicineQuery
    }]);
    setMedicineQuery("");

    // Simulate AI processing
    setIsMedicineSending(true);
    setTimeout(() => {
      let botResponse = "";

      // Simple response logic based on condition
      if (medicineQuery.toLowerCase().includes("cold") || medicineQuery.toLowerCase().includes("flu")) {
        botResponse = "For common cold or flu symptoms, you might consider:\n\n• Acetaminophen (Tylenol) for fever and pain relief\n• Decongestants like pseudoephedrine (Sudafed) for nasal congestion\n• Cough suppressants with dextromethorphan for dry cough\n• Antihistamines may help with runny nose\n\nPrecautions: Stay hydrated, get plenty of rest, and consult a doctor if symptoms worsen or last more than 7 days.";
      } else if (medicineQuery.toLowerCase().includes("headache") || medicineQuery.toLowerCase().includes("migraine")) {
        botResponse = "For headaches, these over-the-counter options may help:\n\n• Ibuprofen (Advil, Motrin)\n• Acetaminophen (Tylenol)\n• Aspirin\n• Naproxen sodium (Aleve)\n\nPrecautions: Take with food to avoid stomach upset. If headaches are severe, persistent or accompanied by other symptoms, consult a healthcare provider.";
      } else if (medicineQuery.toLowerCase().includes("allerg")) {
        botResponse = "For allergies, consider these over-the-counter options:\n\n• Non-drowsy antihistamines like cetirizine (Zyrtec), loratadine (Claritin), or fexofenadine (Allegra)\n• Nasal steroid sprays like fluticasone (Flonase) or triamcinolone (Nasacort)\n• Saline nasal sprays\n\nPrecautions: Some antihistamines may cause drowsiness. If symptoms are severe or don't improve, consult an allergist.";
      } else if (medicineQuery.toLowerCase().includes("indigestion") || medicineQuery.toLowerCase().includes("heartburn") || medicineQuery.toLowerCase().includes("acid")) {
        botResponse = "For indigestion or heartburn, these OTC medicines may help:\n\n• Antacids like Tums, Rolaids, or Maalox\n• H2 blockers like famotidine (Pepcid) or ranitidine\n• Proton pump inhibitors like omeprazole (Prilosec OTC)\n\nPrecautions: Avoid triggers like spicy foods, caffeine, and eating before bedtime. If symptoms persist beyond two weeks, consult a doctor.";
      } else {
        botResponse = "Based on the symptoms or condition you've described, I'd recommend consulting with a healthcare provider for personalized advice. In the meantime, ensure you're staying hydrated, getting adequate rest, and avoiding potential triggers that may worsen your symptoms. Over-the-counter pain relievers like acetaminophen or ibuprofen might provide temporary relief for discomfort, but a proper diagnosis is important for effective treatment.";
      }
      setMedicineHistory(prev => [...prev, {
        role: "bot",
        content: botResponse
      }]);
      setIsMedicineSending(false);
    }, 1500);
  };
  const handleKeyPress = (e: React.KeyboardEvent, type: 'chat' | 'medicine') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (type === 'chat') {
        handleSendMessage();
      } else {
        handleMedicineQuery();
      }
    }
  };
  const handleQuickQuestion = (question: string) => {
    setMessage(question);
    // Focus on input after selecting a quick question
    const inputElement = document.getElementById('message-input');
    if (inputElement) inputElement.focus();
  };
  const handleQuickCondition = (condition: string) => {
    setMedicineQuery(condition);
    // Focus on input after selecting a quick condition
    const inputElement = document.getElementById('medicine-input');
    if (inputElement) inputElement.focus();
  };
  const toggleRecording = () => {
    if (!isRecording && 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsRecording(true);

      // @ts-ignore - TypeScript doesn't know about the Speech Recognition API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + ' ' + transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => {
        setIsRecording(false);
        toast({
          title: "Voice recognition failed",
          description: "Please try again or type your question.",
          variant: "destructive"
        });
      };
      recognition.onend = () => {
        setIsRecording(false);
      };
      recognition.start();
    } else {
      toast({
        title: "Voice recognition not supported",
        description: "Your browser doesn't support voice recognition. Please type your question instead.",
        variant: "destructive"
      });
      setIsRecording(false);
    }
  };
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };
  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check if file is an image
      if (!file.type.match('image.*')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, PNG, etc.).",
          variant: "destructive"
        });
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        toast({
          title: "Image uploaded",
          description: "Your health-related image has been attached."
        });
      };
      reader.readAsDataURL(file);
    }
  };
  const removeUploadedImage = () => {
    setUploadedImage(null);
  };
  const onSubmitContact = (values: z.infer<typeof formSchema>) => {
    // Simulate sending contact form
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible."
    });
    form.reset();
  };
  return <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar onScrollChange={handleNavbarScroll} />
      <div className={`container mx-auto px-4 py-12 ${isScrolled ? 'page-content-scrolled' : 'page-content'}`}>
        <div className="max-w-4xl mx-auto my-[50px]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-fade-in">AI Health Assistant</h1>
            <p className="text-lg text-gray-600">
              Get instant answers to your health questions from our intelligent medical assistant.
            </p>
          </div>
          
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 transition-all duration-200 rounded-lg font-medium"
              >
                <Bot className="mr-2 h-4 w-4" />
                Health Assistant
              </TabsTrigger>
              <TabsTrigger 
                value="medicine" 
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 transition-all duration-200 rounded-lg font-medium"
              >
                <Pill className="mr-2 h-4 w-4" />
                Medicine Suggestion
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat">
              <Card className="border-2 shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-t-lg">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 rounded-full p-2">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-medium">Medical Universe Assistant</h2>
                        <p className="text-xs text-blue-100">Online • Powered by AI</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Area */}
                  <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-4">
                      {chatHistory.map((chat, index) => <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg shadow-sm ${chat.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                            <div className="flex items-center space-x-2 mb-1">
                              {chat.role === 'user' ? <>
                                  <span className="font-medium">You</span>
                                  <Avatar className="h-5 w-5">
                                    <User className="h-3 w-3" />
                                  </Avatar>
                                </> : <>
                                  <Avatar className="h-5 w-5 bg-blue-100">
                                    <Bot className="h-3 w-3 text-blue-600" />
                                  </Avatar>
                                  <span className="font-medium">Health Assistant</span>
                                </>}
                            </div>
                            <p className="text-sm whitespace-pre-line">{chat.content}</p>
                            {chat.image && <div className="mt-2">
                                <img src={chat.image} alt="Uploaded health image" className="max-w-full rounded-md max-h-48" />
                              </div>}
                          </div>
                        </div>)}
                      {isSending && <div className="flex justify-start">
                          <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[80%] shadow-sm">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-5 w-5 bg-blue-100">
                                <Bot className="h-3 w-3 text-blue-600" />
                              </Avatar>
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          </div>
                        </div>}
                      <div ref={chatEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {/* Quick Questions Chips */}
                  <div className="p-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">Common health questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {commonQuestions.map((q, i) => <Button key={i} variant="outline" size="sm" className="rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => handleQuickQuestion(q)}>
                          {q}
                        </Button>)}
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  {uploadedImage && <div className="px-4 pb-2">
                      <div className="relative inline-block">
                        <img src={uploadedImage} alt="Preview" className="h-16 rounded-md border border-gray-200" />
                        <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-800 text-white hover:bg-gray-700" onClick={removeUploadedImage}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>}
                  
                  {/* Input Area */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" className={`rounded-full ${isRecording ? 'bg-red-100 text-red-500 border-red-300' : ''}`} onClick={toggleRecording}>
                        <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full" onClick={handleImageUpload}>
                        <Paperclip className="h-4 w-4" />
                        <input type="file" ref={fileInputRef} onChange={onImageChange} accept="image/*" className="hidden" />
                      </Button>
                      <textarea id="message-input" className="flex-1 resize-none border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="Type your health question here..." rows={1} value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => handleKeyPress(e, 'chat')} />
                      <Button onClick={handleSendMessage} size="icon" className="rounded-full hover:bg-blue-700 transition-colors" disabled={!message.trim() && !uploadedImage || isSending}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      This AI assistant provides general information only and should not replace professional medical advice.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="medicine">
              <Card className="border-2 shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-t-lg">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 rounded-full p-2">
                        <Pill className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-medium">AI-Powered Drug Recommendations</h2>
                        <p className="text-xs text-blue-100">Enter symptoms or conditions for medicine suggestions</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Medicine Chat Area */}
                  <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-4">
                      {medicineHistory.map((chat, index) => <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg shadow-sm ${chat.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                            <div className="flex items-center space-x-2 mb-1">
                              {chat.role === 'user' ? <>
                                  <span className="font-medium">You</span>
                                  <Avatar className="h-5 w-5">
                                    <User className="h-3 w-3" />
                                  </Avatar>
                                </> : <>
                                  <Avatar className="h-5 w-5 bg-blue-100">
                                    <Pill className="h-3 w-3 text-blue-600" />
                                  </Avatar>
                                  <span className="font-medium">Medicine Advisor</span>
                                </>}
                            </div>
                            <p className="text-sm whitespace-pre-line">{chat.content}</p>
                          </div>
                        </div>)}
                      {isMedicineSending && <div className="flex justify-start">
                          <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[80%] shadow-sm">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-5 w-5 bg-blue-100">
                                <Pill className="h-3 w-3 text-blue-600" />
                              </Avatar>
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          </div>
                        </div>}
                      <div ref={medicineEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {/* Quick Conditions Chips */}
                  <div className="p-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">Common conditions:</p>
                    <div className="flex flex-wrap gap-2">
                      {commonConditions.map((c, i) => <Button key={i} variant="outline" size="sm" className="rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => handleQuickCondition(c)}>
                          {c}
                        </Button>)}
                    </div>
                  </div>
                  
                  {/* Input Area */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <textarea id="medicine-input" className="flex-1 resize-none border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="Enter a condition or symptoms..." rows={1} value={medicineQuery} onChange={e => setMedicineQuery(e.target.value)} onKeyDown={e => handleKeyPress(e, 'medicine')} />
                      <Button onClick={handleMedicineQuery} size="icon" className="rounded-full hover:bg-blue-700 transition-colors" disabled={!medicineQuery.trim() || isMedicineSending}>
                        {isMedicineSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Suggestions are for over-the-counter medications only. Always consult a healthcare professional.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How can our Health Assistant help you?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow hover:translate-y-[-5px] duration-300">
                <CardContent className="pt-6">
                  <div className="mx-auto bg-blue-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Symptom Checker</h3>
                  <p className="text-sm text-gray-600">Describe your symptoms and get possible causes and next steps</p>
                  <Button variant="link" className="mt-2 group">
                    Try now <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-lg transition-shadow hover:translate-y-[-5px] duration-300">
                <CardContent className="pt-6">
                  <div className="mx-auto bg-blue-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Medication Info</h3>
                  <p className="text-sm text-gray-600">Get information on medications, dosages, and potential side effects</p>
                  <Button variant="link" className="mt-2 group">
                    Learn more <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-lg transition-shadow hover:translate-y-[-5px] duration-300">
                <CardContent className="pt-6">
                  <div className="mx-auto bg-blue-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Wellness Tips</h3>
                  <p className="text-sm text-gray-600">Get personalized health tips and wellness recommendations</p>
                  <Button variant="link" className="mt-2 group">
                    Get tips <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Contact Section */}
          <div id="contact" className="mt-20 mb-10 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Contact Us</h2>
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitContact)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="name" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} className="transition-all duration-200 focus:border-blue-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                      <FormField control={form.control} name="email" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Your email" type="email" {...field} className="transition-all duration-200 focus:border-blue-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                    </div>
                    <FormField control={form.control} name="message" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Your message" {...field} className="min-h-[120px] transition-all duration-200 focus:border-blue-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    <div className="flex justify-center">
                      <Button type="submit" className="px-8 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]">
                        Send Message
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default HealthAssistantPage;
