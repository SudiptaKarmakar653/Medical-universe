import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const FloatingChatbot: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: 'Hello! 👋 I\'m your MedicalUniverse AI Guide. I can help you find doctors, book appointments, assist with medicines, answer health questions, and guide you throughout the website. How may I assist you today?',
    isUser: false,
    timestamp: new Date()
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWaveAnimation, setShowWaveAnimation] = useState(false);
  const [showBouncingAnimation, setShowBouncingAnimation] = useState(false);

  // Check if current route is medical store related
  const isMedicalStorePage = location.pathname.includes('/medicine-store') || 
                            location.pathname.includes('/store') || 
                            location.pathname.includes('/cart') || 
                            location.pathname.includes('/checkout');

  // Check if current route is admin related (hide chatbot on admin pages)
  const isAdminPage = location.pathname.includes('/admin') || 
                     location.pathname.includes('/medicine-admin');

  // Initial greeting animations on page load
  useEffect(() => {
    // Don't show bouncing animation on medical store pages
    if (isMedicalStorePage) {
      return;
    }

    const timer = setTimeout(() => {
      setShowWaveAnimation(true);
      setShowBouncingAnimation(true);
      
      // Stop animations after 20 seconds
      const stopTimer = setTimeout(() => {
        setShowWaveAnimation(false);
        setShowBouncingAnimation(false);
      }, 20000); // 20 seconds
      
      return () => clearTimeout(stopTimer);
    }, 1000); // Start animation 1 second after page load

    return () => clearTimeout(timer);
  }, [isMedicalStorePage]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Registration & Login queries
    if (input.includes('register') || input.includes('sign up') || input.includes('create account')) {
      return '📝 To register on Medical Universe:\n\n1. Click "Sign Up" on the homepage\n2. Fill in your personal details (name, email, phone)\n3. Choose your role (Patient/Doctor)\n4. Verify your email\n5. Complete profile setup\n\n✅ Note: Doctors need admin approval before consulting patients.';
    }
    
    if (input.includes('login') || input.includes('sign in')) {
      return '🔐 To login to Medical Universe:\n\n1. Click "Login" button\n2. Enter your registered email & password\n3. Click "Sign In"\n\n💡 Forgot password? Use "Forgot Password" link to reset it.';
    }

    // Doctor-related queries
    if (input.includes('find doctor') || input.includes('search doctor') || input.includes('specialist')) {
      return '🩺 To find doctors on Medical Universe:\n\n1. Go to "Find Doctors" section\n2. Browse by specialty (Cardiology, Dermatology, etc.)\n3. View doctor profiles & ratings\n4. Check availability & book appointment\n\n✅ All doctors are verified by our admin team for quality assurance.';
    }

    if (input.includes('book appointment') || input.includes('appointment')) {
      return '📅 To book an appointment:\n\n1. Find your preferred doctor\n2. Check their available time slots\n3. Select date & time\n4. Confirm booking\n5. You\'ll receive confirmation via email\n\n💡 You can manage appointments from your patient dashboard.';
    }

    if (input.includes('doctor approval') || input.includes('doctor request')) {
      return '👨‍⚕️ For Doctor Registration:\n\n1. Register as "Doctor" role\n2. Submit medical credentials\n3. Wait for admin verification\n4. Once approved, you can start consulting\n\n⏳ Admin reviews usually take 24-48 hours.';
    }

    // Medicine & Medical Store queries
    if (input.includes('medicine') || input.includes('pharmacy') || input.includes('buy medicine')) {
      return '💊 Medical Store - How to buy medicines:\n\n1. Visit "Medical Store" section\n2. Search medicine by name\n3. Check availability & price\n4. Add to cart\n5. Proceed to checkout\n6. Choose delivery/pickup option\n\n⚠️ Prescription medicines require valid prescription upload.';
    }

    // Health advice queries
    if (input.includes('health advice') || input.includes('symptoms') || input.includes('medical advice')) {
      return '🏥 I can provide general health guidance, but for specific symptoms or medical conditions, please:\n\n✅ Consult our qualified doctors\n✅ Book an appointment for proper diagnosis\n✅ For emergencies, use our Emergency Help System\n\n⚠️ Always seek professional medical advice for serious health concerns.';
    }

    // Emergency queries
    if (input.includes('emergency') || input.includes('urgent') || input.includes('critical')) {
      return '🚨 For Medical Emergencies:\n\n🔴 Immediate: Call emergency services (911/102)\n🟡 Urgent Care: Use our Emergency Help System\n🟢 Non-urgent: Book regular appointment\n\n💡 Our platform provides quick access to emergency medical assistance when needed.';
    }

    // Services queries
    if (input.includes('services') || input.includes('what services')) {
      return '🏥 Medical Universe Services:\n\n🩺 Doctor Consultations\n💊 Online Pharmacy\n🤖 AI Health Assistant\n📱 Telemedicine\n🚨 Emergency Support\n📋 Health Records Management\n💬 Patient-Doctor Communication\n\nVisit our "Services" section for detailed information!';
    }

    // Contact & Support queries
    if (input.includes('contact') || input.includes('complaint') || input.includes('issue') || input.includes('problem') || input.includes('support')) {
      return '📞 Need Help or Have Issues?\n\n1. Visit "Contact Us" section\n2. Submit your complaint/query\n3. Our admin team will respond within 24 hours\n\n📧 You can also reach us for:\n• Technical issues\n• Account problems\n• Service complaints\n• General inquiries';
    }

    // Platform information
    if (input.includes('medical universe') || input.includes('about') || input.includes('platform')) {
      return '🌟 Welcome to Medical Universe!\n\nBuilt by Subhodeep Pal to revolutionize healthcare access. We connect patients with qualified doctors, provide online pharmacy services, and offer AI-powered health assistance.\n\n👥 Our community includes patients, verified doctors, and dedicated admin support to ensure quality healthcare for everyone.';
    }

    // Payment & Pricing
    if (input.includes('payment') || input.includes('cost') || input.includes('price') || input.includes('fee')) {
      return '💳 For pricing and payment information:\n\n• Doctor consultation fees vary by specialist\n• Medicine prices are displayed in the store\n• Multiple payment options available\n• Secure payment processing\n\n💡 Check specific sections for detailed pricing or contact admin for billing queries.';
    }

    // User roles explanation
    if (input.includes('roles') || input.includes('patient') || input.includes('doctor role') || input.includes('admin')) {
      return '👥 Medical Universe User Roles:\n\n🧑‍🤝‍🧑 PATIENT: Book appointments, buy medicines, consult doctors\n👨‍⚕️ DOCTOR: Provide consultations (requires admin approval)\n👨‍💼 ADMIN: Manages platform, verifies doctors, handles support\n\n✅ Each role has specific features and responsibilities.';
    }

    // General help
    if (input.includes('help') || input.includes('how to use') || input.includes('guide')) {
      return '🤝 I\'m here to help you navigate Medical Universe!\n\nI can assist with:\n✅ Registration & Login\n✅ Finding & booking doctors\n✅ Using medical store\n✅ Understanding services\n✅ General health guidance\n✅ Platform navigation\n\nWhat specific help do you need?';
    }

    // Default response
    return '👋 Thank you for reaching out! As your Medical Universe AI Guide, I can help you with:\n\n🩺 Finding & booking doctors\n💊 Purchasing medicines\n📋 Platform navigation\n🏥 General health guidance\n📞 Support & contact info\n\nPlease let me know what specific assistance you need, and I\'ll be happy to guide you step-by-step!';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Enhanced CSS animation styles
  const animationKeyframes = `
    @keyframes wave {
      0%, 100% { transform: rotate(-20deg); }
      25% { transform: rotate(-40deg); }
      75% { transform: rotate(0deg); }
    }
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-12px); }
      60% { transform: translateY(-8px); }
    }
    
    @keyframes combinedGreeting {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-12px); }
      60% { transform: translateY(-8px); }
    }
  `;

  // Robot SVG icon component with enhanced animations
  const RobotIcon = () => (
    <svg 
      width="104" 
      height="104" 
      viewBox="0 0 150 150" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="w-full h-full py-0 px-0 mx-[55px] my-[25px]"
    >
      {/* Robot Head */}
      <circle cx="75" cy="40" r="25" fill="white" stroke="#3B82F6" strokeWidth="2" />
      
      {/* Antenna */}
      <line x1="75" y1="15" x2="75" y2="8" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="75" cy="6" r="3" fill="#3B82F6" />
      
      {/* Screen Face */}
      <rect x="60" y="30" width="30" height="20" rx="5" fill="black" />
      
      {/* Eyes */}
      <circle cx="67" cy="37" r="3" fill="#3B82F6" />
      <circle cx="83" cy="37" r="3" fill="#3B82F6" />
      
      {/* Smile */}
      <path d="M 65 45 Q 75 50 85 45" stroke="white" strokeWidth="2" fill="none" />
      
      {/* Body */}
      <rect x="55" y="65" width="40" height="50" rx="8" fill="white" stroke="#3B82F6" strokeWidth="2" />
      
      {/* HI! Text on chest */}
      <rect x="62" y="80" width="26" height="12" rx="6" fill="#3B82F6" />
      <text x="75" y="88" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">HI!</text>
      
      {/* Left Arm (down) */}
      <rect x="40" y="70" width="15" height="8" rx="4" fill="#3B82F6" />
      <circle cx="37" cy="74" r="6" fill="#3B82F6" />
      
      {/* Right Arm (waving) - with conditional animation */}
      <g 
        style={{
          animation: showWaveAnimation ? 'wave 0.8s ease-in-out infinite' : 'none',
          transformOrigin: '102px 69px'
        }}
      >
        <rect x="95" y="65" width="15" height="8" rx="4" fill="#3B82F6" transform="rotate(-20 102 69)" />
        <circle cx="113" cy="67" r="6" fill="#3B82F6" />
      </g>
      
      {/* Legs */}
      <rect x="62" y="115" width="8" height="20" rx="4" fill="white" stroke="#3B82F6" strokeWidth="2" />
      <rect x="80" y="115" width="8" height="20" rx="4" fill="white" stroke="#3B82F6" strokeWidth="2" />
      
      {/* Feet */}
      <ellipse cx="66" cy="140" rx="8" ry="4" fill="#3B82F6" />
      <ellipse cx="84" cy="140" rx="8" ry="4" fill="#3B82F6" />
    </svg>
  );

  // Don't render chatbot on admin pages (after all hooks have been called)
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      {/* Add CSS keyframes to head */}
      <style dangerouslySetInnerHTML={{ __html: animationKeyframes }} />
      
      {/* Floating Chat Button - With Enhanced Animations */}
      <div 
        className="fixed bottom-6 right-20 md:right-24 lg:right-28 z-50"
        style={{
          animation: showBouncingAnimation ? 'bounce 2s ease-in-out infinite' : 'none'
        }}
      >
        <button 
          onClick={toggleChat}
          className="w-32 h-32 md:w-36 md:h-36 p-2 bg-transparent border-none shadow-none hover:scale-110 transition-transform duration-300 focus:outline-none"
          aria-label="Open MedicalUniverse AI Guide"
        >
          <RobotIcon />
        </button>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-40 right-4 md:right-8 lg:right-12 z-50 w-80 md:w-96 h-96 md:h-[28rem] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">MedicalUniverse AI Guide</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <Button 
              onClick={toggleChat}
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-line ${
                      message.isUser 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div 
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div 
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 text-sm"
              />
              <Button 
                onClick={sendMessage}
                size="icon"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={!inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
