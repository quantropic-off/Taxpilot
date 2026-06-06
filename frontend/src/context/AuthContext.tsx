"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type Role = "admin" | "student" | null;

interface User {
  id: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check session storage on mount so login is required per session
    const storedUser = sessionStorage.getItem("taxpro_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // If they are on /login but already have a session, redirect based on role
      if (pathname === "/login") {
        if (parsedUser.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/gst");
        }
      }
    } else if (pathname !== "/login") {
      router.push("/login");
    }
  }, [pathname, router]);

  const login = (newUser: User) => {
    setUser(newUser);
    sessionStorage.setItem("taxpro_user", JSON.stringify(newUser));
    if (newUser.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/gst");
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("taxpro_user");
    router.push("/login");
  };

  // Wait for initial check
  if (!user && pathname !== "/login") {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
