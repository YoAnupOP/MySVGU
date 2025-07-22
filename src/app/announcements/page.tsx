"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  Calendar, 
  BookOpen, 
  AlertCircle,
  Clock,
  Building,
  GraduationCap
} from "lucide-react";

export default function Announcements() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  // PROTOTYPE MODE - Skip loading check
  // if (authLoading || !isAuthenticated) {
  //   return <div className="min-h-screen bg-light-bg" />;
  // }

  // Mock announcements data
  const announcements = [
    {
      id: 1,
      title: "Mid-term Examinations Schedule",
      content: "Dear Students,\n\nThe mid-term examinations for the current semester will be conducted from March 15-25, 2025. Please check your individual exam schedule on the student portal and prepare accordingly.\n\nPlease bring your student ID card and necessary stationery for the examinations. Mobile phones are strictly prohibited in the examination hall.\n\nFor any queries, contact the examination department.",
      department: "Academic Office",
      priority: "high",
      createdAt: "2025-03-01T10:00:00Z",
      targetProgram: "All Programs",
      targetSemester: null
    },
    {
      id: 2,
      title: "Holiday Notice - Holi Festival",
      content: "The university will remain closed on March 8th, 2025 on account of Holi festival. Regular classes will resume from March 9th, 2025.\n\nWish you all a very Happy and Colorful Holi!",
      department: "Administration",
      priority: "normal",
      createdAt: "2025-03-05T14:30:00Z",
      targetProgram: null,
      targetSemester: null
    },
    {
      id: 3,
      title: "Computer Science Department Workshop",
      content: "A workshop on 'Artificial Intelligence and Machine Learning' will be conducted on March 20th, 2025 from 10:00 AM to 4:00 PM in the CS department.\n\nAll CS students are encouraged to participate. Registration is mandatory through the department office.",
      department: "Computer Science",
      priority: "normal",
      createdAt: "2025-03-10T09:00:00Z",
      targetProgram: "B.Tech CSE",
      targetSemester: "6"
    },
    {
      id: 4,
      title: "Library New Book Arrivals",
      content: "The library has received new books on various subjects including latest technology, literature, and research materials. Students are encouraged to visit the library and explore the new collection.\n\nLibrary timing: Monday to Friday 8:00 AM - 8:00 PM, Weekends 9:00 AM - 5:00 PM",
      department: "Library",
      priority: "low",
      createdAt: "2025-03-12T11:15:00Z",
      targetProgram: null,
      targetSemester: null
    },
    {
      id: 5,
      title: "Fee Payment Deadline Extension",
      content: "Due to technical issues with the online payment portal, the fee payment deadline has been extended to March 25th, 2025. Students who haven't paid their fees can now make payments without any late fees until the new deadline.\n\nFor assistance with fee payment, contact the accounts office.",
      department: "Accounts Office",
      priority: "high",
      createdAt: "2025-03-14T16:45:00Z",
      targetProgram: null,
      targetSemester: null
    }
  ];

  const getDepartmentIcon = (department: string) => {
    switch (department?.toLowerCase()) {
      case 'computer science':
        return <GraduationCap className="h-4 w-4" />;
      case 'academic office':
      case 'administration':
      case 'accounts office':
        return <Building className="h-4 w-4" />;
      case 'library':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department?.toLowerCase()) {
      case 'computer science':
        return 'border-academic-blue bg-blue-50';
      case 'academic office':
      case 'administration':
        return 'border-green-500 bg-green-50';
      case 'accounts office':
        return 'border-yellow-500 bg-yellow-50';
      case 'library':
        return 'border-purple-500 bg-purple-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const announcementDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - announcementDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      } else {
        return announcementDate.toLocaleDateString();
      }
    }
  };

  return (
    <div className="min-h-screen bg-light-bg">
      <Navbar />
      <MobileNav />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Megaphone className="h-8 w-8 text-academic-blue mr-3" />
            <h1 className="text-3xl font-bold text-slate-text">Announcements & Updates</h1>
          </div>
          <p className="text-gray-600">Stay updated with the latest news and announcements from your university</p>
        </div>

        <div className="space-y-6">
          {announcements.map((announcement: any) => (
            <Card 
              key={announcement.id} 
              className={`border-l-4 ${getDepartmentColor(announcement.department)} transition-shadow hover:shadow-md`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getDepartmentIcon(announcement.department)}
                      <span className="text-sm font-medium text-gray-600">
                        {announcement.department || 'General'}
                      </span>
                      <Badge variant={getPriorityColor(announcement.priority)}>
                        {announcement.priority?.toUpperCase() || 'NORMAL'}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-slate-text leading-tight">
                      {announcement.title}
                    </CardTitle>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatRelativeTime(announcement.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>
                
                {(announcement.targetProgram || announcement.targetSemester) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium mr-2">Target:</span>
                      {announcement.targetProgram && (
                        <Badge variant="outline" className="mr-2">
                          {announcement.targetProgram}
                        </Badge>
                      )}
                      {announcement.targetSemester && (
                        <Badge variant="outline">
                          Semester {announcement.targetSemester}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
