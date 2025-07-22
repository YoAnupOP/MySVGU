"use client";

import { useState, useEffect } from 'react';

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // PROTOTYPE MODE - Always authenticated for development
    // Replace with real auth logic later
    const mockUser: User = {
      firstName: "Anup",
      lastName: "Student", 
      email: "anup.student@svgu.edu",
      profileImageUrl: undefined
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading
  };
} 