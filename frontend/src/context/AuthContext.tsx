import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "student";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  studentId?: string;
  roomNo?: string;
  blockNo?: string;
  hostel?: string;
  roomType?: string;
  acType?: string;
  fee?: number;
  dueDate?: string;
}

const DEMO_USERS: Record<string, AuthUser & { password: string }> = {
  admin: {
    id: "USR001",
    password: "admin123",
    name: "Dr. Meera Iyer",
    role: "admin",
    email: "admin@hostel.edu",
    avatar: "MI",
  },
  student: {
    id: "STU2024081",
    password: "student123",
    name: "Arjun Sharma",
    role: "student",
    email: "arjun.sharma@hostel.edu",
    avatar: "AS",
    studentId: "STU2024081",
    roomNo: "204",
    blockNo: "B-2",
    hostel: "Tagore Hostel",
    roomType: "Double Sharing",
    acType: "Non-AC",
    fee: 12500,
    dueDate: "2024-04-05",
  },
};

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (username: string, password: string): boolean => {
    const found = DEMO_USERS[username.toLowerCase()];
    if (found && found.password === password) {
      const { password: _pw, ...authUser } = found;
      setUser(authUser);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
