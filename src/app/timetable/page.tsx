"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, BookOpen } from "lucide-react";

export default function Timetable() {
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

  // Mock timetable data
  const timetable = [
    {
      id: 1,
      dayOfWeek: 1,
      subject: { name: "Mathematics", code: "MATH301" },
      startTime: "09:00",
      endTime: "10:30",
      room: "A101",
      faculty: "Dr. Smith",
      classType: "lecture"
    },
    {
      id: 2,
      dayOfWeek: 1,
      subject: { name: "Physics", code: "PHY302" },
      startTime: "11:00",
      endTime: "12:30",
      room: "B202",
      faculty: "Prof. Johnson",
      classType: "lecture"
    },
    {
      id: 3,
      dayOfWeek: 2,
      subject: { name: "Programming Lab", code: "CS303" },
      startTime: "10:00",
      endTime: "12:00",
      room: "Lab1",
      faculty: "Prof. Davis",
      classType: "lab"
    },
    {
      id: 4,
      dayOfWeek: 3,
      subject: { name: "Data Structures", code: "CS304" },
      startTime: "09:00",
      endTime: "10:30",
      room: "C103",
      faculty: "Dr. Wilson",
      classType: "lecture"
    },
    {
      id: 5,
      dayOfWeek: 4,
      subject: { name: "Tutorial", code: "MATH301" },
      startTime: "14:00",
      endTime: "15:00",
      room: "A201",
      faculty: "TA John",
      classType: "tutorial"
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

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const activeDays = allDays.filter(day => groupedTimetable[day]?.length > 0);

  const getClassTypeColor = (classType: string) => {
    switch (classType) {
      case 'lecture':
        return 'bg-academic-blue text-white';
      case 'lab':
        return 'bg-success-green text-white';
      case 'tutorial':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getClassTypeBorder = (classType: string) => {
    switch (classType) {
      case 'lecture':
        return 'border-blue-500 bg-blue-100';
      case 'lab':
        return 'border-green-500 bg-green-100';
      case 'tutorial':
        return 'border-purple-500 bg-purple-100';
      default:
        return 'border-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-light-bg">
      <Navbar />
      <MobileNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-text mb-2">Class Timetable</h1>
          <p className="text-gray-600">View your weekly class schedule and room assignments</p>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block">
          <Card className="border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-xl font-semibold text-slate-text flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-4">
                {allDays.map((day) => (
                  <div key={day} className="space-y-3">
                    <h3 className="font-semibold text-center text-slate-text bg-gray-50 py-2 rounded-lg">
                      {day}
                    </h3>
                    <div className="space-y-2 min-h-[200px]">
                      {groupedTimetable[day]?.map((entry: any) => (
                        <div
                          key={entry.id}
                          className={`p-3 rounded-lg border-l-4 ${getClassTypeBorder(entry.classType)}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge 
                              className={`text-xs ${getClassTypeColor(entry.classType)}`}
                            >
                              {entry.classType.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="font-medium text-sm text-slate-text mb-1">
                            {entry.subject?.name}
                          </p>
                          <p className="text-xs text-gray-600 mb-1">
                            {entry.subject?.code}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mb-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {entry.startTime} - {entry.endTime}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {entry.room}
                          </div>
                        </div>
                      )) || (
                        <div className="text-center text-gray-400 text-sm py-8">
                          No classes
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-6">
          {activeDays.map((day) => (
            <Card key={day} className="border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-slate-text">
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {groupedTimetable[day]?.map((entry: any) => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-lg border-l-4 ${getClassTypeBorder(entry.classType)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-slate-text">
                          {entry.subject?.name}
                        </h3>
                        <Badge 
                          className={`text-xs ${getClassTypeColor(entry.classType)}`}
                        >
                          {entry.classType.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {entry.subject?.code}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {entry.startTime} - {entry.endTime}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {entry.room}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Faculty: {entry.faculty}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
