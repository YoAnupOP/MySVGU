"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  User, 
  Sparkles,
  HelpCircle,
  CreditCard,
  Calendar,
  BookOpen,
  MessageSquare
} from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  helpful?: boolean;
  category?: string;
}

export default function Chatbot() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your SVGU AI assistant. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // PROTOTYPE MODE - Skip authentication check  
  // TODO: Re-enable when implementing real authentication
  // useEffect(() => {
  //   if (!authLoading && !isAuthenticated) {
  //     toast({
  //       title: "Unauthorized",
  //       description: "You are logged out. Logging in again...",
  //       variant: "destructive",
  //     });
  //     setTimeout(() => {
  //       window.location.href = "/api/login";
  //     }, 500);
  //     return;
  //   }
  // }, [isAuthenticated, authLoading, toast]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('fee') || message.includes('payment')) {
      return "Your fee status is currently up to date. The next payment is due on July 15, 2025. You can pay online through the student portal or visit the accounts office.";
    } else if (message.includes('library')) {
      return "The library is open Monday to Friday from 8:00 AM to 8:00 PM, and weekends from 9:00 AM to 5:00 PM. You can access digital resources 24/7 through the online portal.";
    } else if (message.includes('exam') || message.includes('schedule')) {
      return "Your upcoming mid-term exams are scheduled from March 15-25, 2025. Please check the detailed timetable on the announcements page for specific dates and venues.";
    } else if (message.includes('attendance')) {
      return "Your current attendance is 85%. You need to maintain at least 75% attendance to be eligible for exams. Make sure to attend your upcoming classes regularly.";
    } else if (message.includes('course') || message.includes('help') || message.includes('academic')) {
      return "I can help you with course-related queries! You can check your course materials in the student portal, contact your faculty during office hours, or visit the academic office for detailed guidance.";
    } else if (message.includes('hello') || message.includes('hi')) {
      return "Hello! I'm here to help you with any university-related questions. You can ask me about fees, library hours, exam schedules, attendance, and much more!";
    } else {
      return "I understand your query. For detailed information, please contact the relevant department or visit the student helpdesk. Is there anything specific about academics, fees, or university services I can help you with?";
    }
  };

  const handleSendMessage = () => {
    const message = inputMessage.trim();
    if (!message) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponse(message),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // PROTOTYPE MODE - Skip loading check
  // if (authLoading || !isAuthenticated) {
  //   return <div className="min-h-screen bg-light-bg" />;
  // }

  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student';
  const userInitials = user?.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ''}` : 'S';

  const quickActions = [
    { icon: CreditCard, label: "Check Fees", query: "What's my fee status?" },
    { icon: BookOpen, label: "Library Hours", query: "What are the library hours?" },
    { icon: Calendar, label: "Exam Schedule", query: "When are my upcoming exams?" },
    { icon: HelpCircle, label: "Academic Help", query: "I need help with my courses" },
  ];

  return (
    <div className="min-h-screen bg-light-bg">
      <Navbar />
      <MobileNav />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-academic-blue rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-text">SVGU AI Assistant</h1>
                <p className="text-gray-600">Get instant help with university-related queries</p>
              </div>
            </div>
            <div className="ml-auto">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.query)}
                className="flex items-center space-x-1 text-xs"
              >
                <action.icon className="h-3 w-3" />
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-slate-text flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Chat with AI Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Messages */}
            <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      {message.type === 'user' ? (
                        <AvatarFallback className="bg-academic-blue text-white text-xs">
                          {userInitials}
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-green-500 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className={`flex-1 max-w-xs lg:max-w-md ${
                      message.type === 'user' ? 'text-right' : ''
                    }`}>
                      <div
                        className={`inline-block p-3 rounded-lg text-sm ${
                          message.type === 'user'
                            ? 'bg-academic-blue text-white rounded-br-none'
                            : 'bg-gray-100 text-slate-text rounded-bl-none'
                        }`}
                      >
                        {message.content}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-500 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg rounded-bl-none p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-academic-blue hover:bg-deep-blue text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
