"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Calendar, MessageSquare, TrendingUp, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    // For prototype - redirect directly to dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Header */}
      <header className="bg-card-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-academic-blue mr-2" />
              <span className="text-xl font-bold text-slate-text">MySVGU</span>
            </div>
            <Button onClick={handleLogin} className="bg-academic-blue hover:bg-deep-blue text-white">
              Student Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-text mb-6">
            Welcome to <span className="text-academic-blue">MySVGU</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your comprehensive student portal for Swami Vivekanand Group University. 
            Access your academic dashboard, manage timetables, and get AI-powered assistance.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-academic-blue hover:bg-deep-blue text-white px-8 py-3 text-lg"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-text mb-12">
            Everything You Need in One Place
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-academic-blue transition-colors">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-academic-blue mb-4" />
                <CardTitle className="text-slate-text">Academic Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Monitor your attendance, CGPA, fee status, and recent exam results 
                  in a comprehensive overview.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-academic-blue transition-colors">
              <CardHeader>
                <Calendar className="h-12 w-12 text-success-green mb-4" />
                <CardTitle className="text-slate-text">Smart Timetable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  View your daily and weekly class schedules with room details 
                  and real-time updates from faculty.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-academic-blue transition-colors">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-purple-500 mb-4" />
                <CardTitle className="text-slate-text">AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get instant answers to university-related queries with our 
                  intelligent SVGU chatbot assistant.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-academic-blue transition-colors">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-yellow-500 mb-4" />
                <CardTitle className="text-slate-text">Live Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Stay informed with subject-wise announcements, exam schedules, 
                  and important university notifications.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-academic-blue transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-red-500 mb-4" />
                <CardTitle className="text-slate-text">Student Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Manage your personal information, academic records, 
                  and university credentials in one secure location.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-academic-blue transition-colors">
              <CardHeader>
                <GraduationCap className="h-12 w-12 text-academic-blue mb-4" />
                <CardTitle className="text-slate-text">Mobile Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access all features seamlessly across desktop, tablet, 
                  and mobile devices with our responsive design.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-academic-blue to-deep-blue">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Academic Experience?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of SVGU students who are already using MySVGU to 
            streamline their academic journey.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            variant="secondary"
            className="bg-white text-academic-blue hover:bg-gray-100 px-8 py-3 text-lg"
          >
            Login to Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-6 w-6 text-academic-blue mr-2" />
            <span className="font-semibold text-slate-text">MySVGU Student Portal</span>
          </div>
          <p className="text-gray-600">
            © 2025 Swami Vivekanand Group University. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 