"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CalendarCheck, 
  TrendingUp, 
  DollarSign, 
  BookOpen,
  Clock,
  MapPin,
  Award,
  Calendar
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // PROTOTYPE MODE - Skip authentication check
  // TODO: Re-enable this when implementing real authentication
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

  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student';

  // Mock data for development
  const student = {
    attendance: "85",
    cgpa: "8.5",
    feesStatus: "paid",
    feesDueDate: "2025-07-15"
  };

  const timetable = [
    {
      dayOfWeek: 1,
      subject: "Mathematics",
      startTime: "09:00",
      endTime: "10:30",
      room: "A101",
      faculty: "Dr. Smith"
    },
    {
      dayOfWeek: 1, 
      subject: "Physics",
      startTime: "11:00",
      endTime: "12:30",
      room: "B202",
      faculty: "Prof. Johnson"
    }
  ];

  const results = [
    {
      subject: "Mathematics",
      marks: 85,
      maxMarks: 100,
      grade: "A"
    },
    {
      subject: "Physics", 
      marks: 78,
      maxMarks: 100,
      grade: "B+"
    }
  ];

  const announcements = [
    {
      title: "Mid-term Examinations",
      description: "Mid-term exams will be conducted from March 15-25, 2025",
      date: "2025-03-01",
      subject: "General"
    },
    {
      title: "Holiday Notice",
      description: "University will remain closed on March 8th for Holi",
      date: "2025-03-05", 
      subject: "Administration"
    }
  ];

  // Group timetable by day
  const groupedTimetable = timetable?.reduce((acc: any, entry: any) => {
    const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayName = dayNames[entry.dayOfWeek];
    if (!acc[dayName]) acc[dayName] = [];
    acc[dayName].push(entry);
    return acc;
  }, {}) || {};

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="min-h-screen bg-light-bg">
      <Navbar />
      <MobileNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Dashboard Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-academic-blue to-deep-blue rounded-lg p-6 text-academic-blue">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
              <p className="text-blue-900">Ready to continue your academic journey? Check your latest updates below.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CalendarCheck className="h-8 w-8 text-success-green" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Attendance</p>
                      <p className="text-2xl font-bold text-slate-text">
                        {student?.attendance ? `${student.attendance}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {student?.attendance && (
                    <div className="mt-4">
                      <Progress 
                        value={parseFloat(student.attendance)} 
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-academic-blue" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">CGPA</p>
                      <p className="text-2xl font-bold text-slate-text">
                        {student?.cgpa || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {student?.cgpa && (
                    <p className="text-sm text-success-green mt-2">
                      Academic performance
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Fees Status</p>
                      <Badge 
                        variant={student?.feesStatus === 'paid' ? 'default' : 'destructive'}
                        className={student?.feesStatus === 'paid' ? 'bg-success-green hover:bg-success-green' : ''}
                      >
                        {student?.feesStatus || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  {student?.feesDueDate && (
                    <p className="text-sm text-gray-500 mt-2">
                      Next due: {new Date(student.feesDueDate).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Timetable Section */}
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-slate-text">
                  This Week's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {weekDays.map((day) => (
                    <div key={day} className="border border-gray-100 rounded-lg p-4">
                      <h4 className="font-medium text-slate-text mb-3">{day}</h4>
                      {groupedTimetable[day] && groupedTimetable[day].length > 0 ? (
                        <div className="space-y-2">
                          {groupedTimetable[day].map((entry: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm font-medium">{entry.startTime} - {entry.endTime}</span>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-slate-text">{entry.subject}</p>
                                <p className="text-xs text-gray-500">{entry.faculty}</p>
                              </div>
                              <div className="flex items-center text-gray-500">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-sm">{entry.room}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm italic">No classes scheduled</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-8">
            
            {/* Student Profile Card */}
            <Card className="border border-gray-200">
              <CardHeader className="text-center border-b border-gray-200">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={user?.profileImageUrl} alt={userName} />
                  <AvatarFallback className="text-lg font-semibold bg-academic-blue text-white">
                    {user?.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ''}` : 'S'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg text-slate-text">{userName}</CardTitle>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Student ID</span>
                    <span className="text-sm font-medium">2024001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Course</span>
                    <span className="text-sm font-medium">B.Tech CSE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Semester</span>
                    <span className="text-sm font-medium">6th</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Year</span>
                    <span className="text-sm font-medium">3rd Year</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-slate-text flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Recent Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {results?.slice(0, 5).map((result: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-text">{result.subject}</p>
                        <p className="text-xs text-gray-500">{result.marks}/{result.maxMarks}</p>
                      </div>
                      <Badge 
                        variant={result.grade.startsWith('A') ? 'default' : result.grade.startsWith('B') ? 'secondary' : 'destructive'}
                        className={result.grade.startsWith('A') ? 'bg-success-green hover:bg-success-green' : ''}
                      >
                        {result.grade}
                      </Badge>
                    </div>
                  )) || <p className="text-gray-500 text-sm italic">No recent results</p>}
                </div>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-slate-text flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Latest Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {announcements?.slice(0, 3).map((announcement: any, index: number) => (
                    <div key={index} className="p-3 border border-gray-100 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium text-slate-text">{announcement.title}</h4>
                        <span className="text-xs text-gray-500">{new Date(announcement.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{announcement.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {announcement.subject}
                      </Badge>
                    </div>
                  )) || <p className="text-gray-500 text-sm italic">No recent announcements</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}